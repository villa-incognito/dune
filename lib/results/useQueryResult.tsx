import React from "react";
import {
  GetExecutionQuery,
  GetResultDocument,
  GetResultQuery,
  GetResultQueryVariables,
} from "lib/types/graphql";
import { GetExecutionQueryVariables } from "lib/types/graphql";
import { Parameter } from "lib/parameters/types";
import { QueryResult } from "lib/results/types";
import { QueryResult as ApolloQueryResult, useQuery } from "@apollo/client";
import { QueryResultsCache } from "./cache";
import { QueryResultMeta } from "lib/results/types";
import { SessionContext } from "gui/session/session";
import { apolloCore, apolloCoreHack } from "lib/apollo/apollo";
import { convertNull } from "lib/types/types";
import { delayBeforeRefreshJob } from "lib/results/utils";
import { gql } from "@apollo/client";
import { guessResultColumnTypes } from "lib/results/values";
import { isNonNullable } from "lib/types/types";
import { removeNullable } from "lib/types/types";
import { sortColumns } from "lib/results/values";
import { useEffect } from "react";
import { useGetExecutionQuery } from "lib/types/graphql";
import { useMemo } from "react";
import { useSessionRef } from "gui/session/session";
import { useState } from "react";
import { Session } from "lib/users/types";

const maxCacheSize = 524288000; // 500Mb

export const executionsCache = new QueryResultsCache<GetExecutionQuery>({
  maxSize: maxCacheSize,
});

interface TemporaryJob {
  jobId: string;
  queryId: number;
}

// useQueryResult gets the results for a given query and handles all the logic related to
// re-validating stale results.
//
// The flow is as follows:
//  1) Call `get_result_v4` query, which returns a combination of:
//     - result ID: The latest successful result for a given query
//     - error ID: The latest error for a given query, if the freshest execution resulted in an error
//     - job ID: The ID of a job that is currently running to refresh the results for the query
//  2) If a job ID was returned, we poll the backend using the `get_execution` query
//     until the execution has completed
//  3) We retrieve data for the initial paint using the result ID and error ID
//  4) And we finally join all the data above in a single data structure

// Along with the results this hook provides a refresh function that will refetch the data.
// If a query is updated then you can simply call the refresh function to get the updated results.
// If you provide a job_id then the passed job_id is used instead of the job_id returned by the
// get_result_v4.
export const useQueryResult = (
  queryId: number | undefined,
  parameters: Parameter[] | undefined,
  {
    can_refresh,
    apiKey,
  }: {
    can_refresh: boolean;
    apiKey?: string;
  }
): QueryResult | undefined => {
  const { sessionLoading } = React.useContext(SessionContext);
  const [tempJob, setTempJob] = React.useState<TemporaryJob>();

  // The fetchers below must wait for sessionLoading before doing anything.
  // However, if we have an API key then we know that the key will be used
  // instead of the session token, and we can skip the wait.
  if (!apiKey && sessionLoading) {
    return { job: { done: false } };
  }

  // Step 1: call get_result that returns the result_id of cached results and
  //         the job_id of any job that has been triggered. This should only
  //         be called once per render.
  const {
    resultId,
    jobId,
    errorId,
    refresh: refreshResultAndJobId,
  } = useGetResult(queryId, parameters, can_refresh, apiKey);

  // if the tempJobId has been set in the refresh callback use it instead of
  // job id returned in step 1
  const jobIdToUse = tempJob?.jobId || jobId;
  const queryIdToUse = tempJob?.queryId || queryId;

  // Step 2: Get the job status and results (if available) for the job_id
  const {
    data: jobResultsData,
    error: jobResultsDataError,
  } = useGetRefreshExecution(jobIdToUse, queryIdToUse, parameters, apiKey, {
    can_refresh,
  });

  // Step 3: Get the results or error (if available) for the result_id from step 1.
  const {
    data: initialResultsData,
    error: initialResultsDataError,
  } = useGetInitialResults(resultId, errorId, queryId, parameters, apiKey);

  // If there is a tempJobId then only show the results of the job and
  // don't ever show the results of the initial resultId.
  const resultData = useMemo(() => {
    return tempJob
      ? jobResultsData
      : // favour the results of the the job because it will be more fresh
        {
          error: jobResultsData?.job?.done
            ? jobResultsData?.error
            : initialResultsData?.error,
          matrix: jobResultsData?.matrix || initialResultsData?.matrix,
          meta: jobResultsData?.meta || initialResultsData?.meta,
          job: jobResultsData?.job,
        };
  }, [jobResultsData, initialResultsData]);

  // Return a callback that can be used to refresh the current data.
  // This callback takes an optional job id parameter that can be used
  // to fetch results for specific jobs (used when calling execute_query for selections).
  const refresh = React.useCallback(
    async (tempJobId?: string, tempQueryId?: number) => {
      if (tempJobId) {
        setTempJob({ jobId: tempJobId, queryId: tempQueryId || queryId || 0 });
      } else {
        refreshResultAndJobId && (await refreshResultAndJobId());
        setTempJob(undefined);
      }
    },
    [refreshResultAndJobId]
  );

  const error = initialResultsDataError || jobResultsDataError;

  // Memoize the result to prevent unnecessary re-renders.
  const result = React.useMemo(() => {
    const apolloError = error && transformError(error);

    const result: QueryResult = {
      refresh,
      apolloError,
      ...resultData,
    };
    return result;
  }, [resultData, refresh, error]);

  return result;
};

interface QueryResultDetails {
  resultId?: string;
  errorId?: string;
  jobId?: string;
  refresh?: () => void;
}

const updateGetResultCache = (
  res: GetExecutionQuery,
  queryId: number | undefined,
  parameters: Parameter[] | undefined,
  can_refresh: boolean
) => {
  let cache;
  if (res.get_execution?.execution_succeeded) {
    cache = {
      get_result_v4: {
        __typename: "GetResultV4Response",
        result_id: res.get_execution.execution_succeeded.execution_id,
        job_id: null,
        error_id: null,
      },
    };
  } else if (res.get_execution?.execution_failed) {
    cache = {
      get_result_v4: {
        __typename: "GetResultV4Response",
        job_id: null,
        error_id: res.get_execution.execution_failed.execution_id,
      },
    };
  }

  if (cache) {
    apolloCore.writeQuery({
      query: getResultQuery,
      variables: {
        query_id: queryId || 0,
        parameters: parameters || [],
        can_refresh,
      },
      data: cache,
    });
  }
};

// useGetResult: Hook that fetches the meta information about the results'
// of a query.
// Returns any combination of result_id, error_id and job_id
// Only fetches once and then stores result in cache for future invocations.
// Use returned refresh function to get latest result metadata.
const getResultQuery = gql`
  query GetResult(
    $query_id: Int!
    $parameters: [Parameter!]!
    $can_refresh: Boolean!
  ) {
    get_result_v4(
      query_id: $query_id
      parameters: $parameters
      can_refresh: $can_refresh
    ) {
      job_id
      result_id
      error_id
    }
  }
`;

interface GetResultQueryParams {
  queryId?: number;
  parameters?: Parameter[];
  can_refresh: boolean;
  apiKey: string | undefined;
  session?: Session;
}

// Since the apollo cache uses the variables as part of the
// the cache key this function provides a way to ensure that
// useGetResult and any other query calling GetResult share
// the same variables.
export function getResultQueryParams({
  queryId,
  parameters,
  can_refresh,
  apiKey,
  session,
}: GetResultQueryParams) {
  const formattedParams: Parameter[] = formatParams(parameters);
  return {
    queryDoc: GetResultDocument,
    context: { session: session, apiKey },
    variables: {
      query_id: queryId || 0,
      parameters: formattedParams,
      can_refresh,
    },
  };
}

const useGetResult = (
  queryId: number | undefined,
  parameters: Parameter[] | undefined,
  can_refresh: boolean,
  apiKey: string | undefined
): QueryResultDetails => {
  const session = useSessionRef();
  const getResultParams = getResultQueryParams({
    queryId,
    parameters,
    can_refresh,
    apiKey,
    session: session.current,
  });
  const res = useQuery<GetResultQuery, GetResultQueryVariables>(
    getResultParams.queryDoc,
    {
      context: getResultParams.context,
      skip: !queryId,
      fetchPolicy: "cache-first",
      variables: getResultParams.variables,
    }
  );
  const details = useMemo(
    () => ({
      jobId: convertNull<string>(res?.data?.get_result_v4?.job_id),
      resultId: convertNull<string>(res?.data?.get_result_v4?.result_id),
      errorId: convertNull<string>(res?.data?.get_result_v4?.error_id),
      refresh: res.refetch,
    }),
    [res.data, res.refetch]
  );

  return details;
};

type useGetRefreshExecutionResponse = Pick<
  ApolloQueryResult<QueryResult | undefined, GetExecutionQueryVariables>,
  "data" | "error"
>;
const useGetRefreshExecution = (
  jobId: string | undefined,
  queryId: number | undefined,
  parameters: Parameter[] | undefined,
  apiKey: string | undefined,
  {
    can_refresh,
  }: {
    can_refresh: boolean;
  }
): useGetRefreshExecutionResponse => {
  const [currentPosition, setCurrentPosition] = useState<number | undefined>();
  const session = useSessionRef();
  const formattedParams: Parameter[] = formatParams(parameters);

  const execCacheKey = `execution_${jobId}`;
  const cachedExec = executionsCache.get(execCacheKey);
  const execution = useGetExecutionQuery({
    skip: Boolean(cachedExec) || Boolean(!jobId),
    variables: {
      execution_id: jobId || "",
      query_id: queryId || 0,
      parameters: formattedParams,
    },
    context: { session: session.current, apiKey },
    // We don't want to cache results that are not final (i.e completed or failed).
    // Therefore, apply the result to an external cache when the results go into a
    // final state.
    fetchPolicy: "no-cache",
    notifyOnNetworkStatusChange: true,
    onCompleted: (res) => {
      if (
        res.get_execution?.execution_queued === null &&
        res.get_execution?.execution_running === null
      ) {
        executionsCache.set(execCacheKey, res);
        updateGetResultCache(res, queryId, formattedParams, can_refresh);
      }
    },
    client: apolloCoreHack,
  });

  // A job is considered to be done when it has been executed
  let done = true;
  if (jobId) {
    done =
      Boolean(cachedExec) ||
      (execution.data?.get_execution?.execution_queued === null &&
        execution.data?.get_execution?.execution_running === null) ||
      execution.error !== undefined;
  }

  useEffect(() => {
    if (jobId) {
      if (done) {
        execution.stopPolling();
      } else {
        execution.startPolling(delayBeforeRefreshJob(currentPosition));
      }
    }
  }, [done, jobId]);

  useEffect(() => {
    // Set the queue position so that it can be used to determine how
    // frequently to poll
    setCurrentPosition(
      execution?.data?.get_execution?.execution_queued?.position
    );
  }, [execution?.data?.get_execution?.execution_queued]);

  const queryResult = useMemo(() => {
    // generate a QueryResult object by parsing the results of the job
    if (Boolean(cachedExec) || (execution?.data && !execution?.error)) {
      return {
        job: generateJob(queryId, cachedExec || execution?.data),
        matrix: generateMatrix(cachedExec || execution?.data),
        meta: getMeta(queryId, cachedExec || execution?.data),
        error: generateError(cachedExec || execution?.data),
      };
    }
  }, [execution?.data, execution?.error]);
  return useMemo(() => ({ data: queryResult, error: execution.error }), [
    queryResult,
    execution.error,
  ]);
};

type useGetInitialResultsResponse = Pick<
  ApolloQueryResult<QueryResult | undefined>,
  "data" | "error"
>;
const useGetInitialResults = (
  resultId: string | undefined,
  errorId: string | undefined,
  queryId: number | undefined,
  parameters: Parameter[] | undefined,
  apiKey: string | undefined
): useGetInitialResultsResponse => {
  const session = useSessionRef();
  const formattedParams: Parameter[] = formatParams(parameters);

  const resultCacheKey = `execution_${resultId}`;
  const cachedResult = executionsCache.get(resultCacheKey);
  const resultExec = useGetExecutionQuery({
    skip: Boolean(cachedResult) || !resultId,
    variables: {
      execution_id: resultId || "",
      query_id: queryId || 0,
      parameters: formattedParams,
    },
    context: { session: session.current, apiKey },
    fetchPolicy: "no-cache",
    onCompleted: (res) => {
      executionsCache.set(resultCacheKey, res);
    },
    client: apolloCoreHack,
  });
  const errorCacheKey = `execution_${errorId}`;
  const cachedError = executionsCache.get(errorCacheKey);
  const errorExec = useGetExecutionQuery({
    skip: Boolean(cachedError) || !errorId,
    variables: {
      execution_id: errorId || "",
      query_id: queryId || 0,
      parameters: formattedParams,
    },
    context: { session: session.current, apiKey },
    // Using the cache here returns undefined in some cases even if the cache contains
    // a valid result. We have disabled it since we already store the result in an
    // external cache.
    fetchPolicy: "no-cache",
    onCompleted: (res) => {
      executionsCache.set(errorCacheKey, res);
    },
    client: apolloCoreHack,
  });

  // Build the result
  const queryResult = useMemo(() => {
    return {
      matrix: generateMatrix(cachedResult || resultExec?.data),
      meta: getMeta(queryId, cachedResult || resultExec?.data),
      error: generateError(cachedError || errorExec?.data),
    };
  }, [cachedResult, cachedError, resultExec.data, errorExec.data]);
  return useMemo(
    () => ({
      data: queryResult,
      error: resultExec.error || errorExec.error,
    }),
    [queryResult, resultExec.error, errorExec.error]
  );
};

const getMeta = (
  queryId?: number,
  result?: GetExecutionQuery
): QueryResultMeta | undefined => {
  if (!result) return;

  if (result.get_execution && result.get_execution.execution_succeeded) {
    return removeNullable<QueryResultMeta>({
      query_id: queryId,
      job_id: convertNull<string>(
        result.get_execution.execution_succeeded.execution_id
      ),
      result_id: convertNull<string>(
        result.get_execution.execution_succeeded.execution_id
      ),
      runtime: convertNull<number>(
        result.get_execution.execution_succeeded.runtime_seconds
      ),
      generated_at: convertNull<string>(
        result.get_execution.execution_succeeded.generated_at
      ),
      max_result_size_reached_bytes: convertNull<number>(
        result.get_execution.execution_succeeded.max_result_size_reached_bytes
      ),
      request_max_result_size_bytes: convertNull<number>(
        result.get_execution.execution_succeeded.request_max_result_size_bytes
      ),
    });
  }
};

// Turns out that sending an undefined value (eg: enumOptions)
// causes issues with the apolloClient. As a result do not set
// enum options if it is not available
function formatParams(params?: Parameter[]): Parameter[] {
  let formattedParams: Parameter[] = [];
  if (params && params.length > 0) {
    formattedParams = params.map((p) => {
      if (p.enumOptions) {
        return {
          key: p.key,
          type: p.type,
          value: p.value,
          enumOptions: p.enumOptions,
        };
      } else {
        return { key: p.key, type: p.type, value: p.value };
      }
    });
  }
  return formattedParams;
}

// Utility functions used to generate a QueryResult object from the different graphql calls

function generateJob(
  queryId?: number,
  res?: GetExecutionQuery
): QueryResult["job"] | undefined {
  if (!res) return;

  if (res.get_execution) {
    return {
      id: convertNull<string>(
        res.get_execution.execution_queued?.execution_id ||
          res.get_execution.execution_running?.execution_id
      ),
      query_id: queryId,
      category: convertNull<string>(
        res.get_execution.execution_queued?.execution_type ||
          res.get_execution.execution_running?.execution_type
      ),
      user_id: convertNull(
        res.get_execution.execution_queued?.execution_user_id ||
          res.get_execution.execution_running?.execution_user_id
      ),
      created_at: convertNull<string>(
        res.get_execution.execution_queued?.created_at ||
          res.get_execution.execution_running?.created_at
      ),
      is_running: Boolean(res.get_execution.execution_running),
      queue_position: res.get_execution.execution_queued?.position,
      done:
        res.get_execution.execution_queued === null &&
        res.get_execution.execution_running === null,
    };
  }
}

function generateMatrix(res?: GetExecutionQuery): QueryResult["matrix"] {
  const queryRes = res?.get_execution?.execution_succeeded;
  if (queryRes) {
    const rows = queryRes.data;
    if (!rows) {
      return;
    }

    let columns = guessResultColumnTypes(rows);
    // queryResult.columns is a list of the columns in the data.
    // if it is not null, we want to make sure the columns are shown in that order
    if (isNonNullable(queryRes.columns)) {
      columns = sortColumns(columns, queryRes.columns);
    }
    return { rows, columns };
  }
}

function generateError(res?: GetExecutionQuery): QueryResult["error"] {
  const queryErr = res?.get_execution?.execution_failed;

  if (queryErr) {
    const metadata = queryErr.metadata
      ? {
          line: queryErr.metadata.line,
          position: queryErr.metadata.column,
          hint: queryErr.metadata.hint,
        }
      : undefined;

    return {
      id: queryErr.execution_id,
      job_id: queryErr.execution_id,
      message: queryErr.message,
      type: queryErr.type,
      generated_at: queryErr.generated_at,
      metadata: metadata,
      runtime: convertNull(queryErr.runtime_seconds),
    };
  }
}

function transformError(error: Error): Error {
  if (/Unexpected end of JSON input/.test(error.message)) {
    return new Error(
      "Failed to read response from server. This can happen if the result set is too large.",
      { cause: error }
    );
  }

  return error;
}
