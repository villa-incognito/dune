/* eslint react-hooks/exhaustive-deps: 2 */
/* eslint react-hooks/rules-of-hooks: 2 */

import { gql } from "@apollo/client";
import { isEqual } from "lodash";
import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { SessionContext } from "gui/session/session";
import { apolloCore } from "lib/apollo/apollo";
import {
  AbortError,
  Execution,
  isExecutionFinal,
  pollForFinalExecution,
} from "lib/execution/execution";
import { useDeepMemo } from "src/hooks/useDeepMemo";
import { Parameter } from "lib/parameters/types";
import {
  GetResultDocument,
  GetResultQuery,
  GetResultQueryVariables,
} from "lib/types/graphql";
import { Session } from "lib/users/types";
import {
  QueryResult,
  QueryResultError,
  QueryResultJob,
  QueryResultMatrix,
  QueryResultMeta,
} from "./types";
import { guessResultColumnTypes, sortColumns } from "./values";

export function useQueryResult(
  queryId: number | undefined,
  parameters: Parameter[] | undefined,
  {
    can_refresh,
    apiKey,
  }: {
    can_refresh: boolean;
    apiKey?: string;
  }
): QueryResult {
  const { sessionLoading, session } = useContext(SessionContext);
  const [loading, setLoading] = useState(true);

  // The execution result for 'result_id'
  const [resultQueryResult, setResultQueryResult] = useState<QueryResult>();

  // The execution result for 'error_id'
  const [errorQueryResult, setErrorQueryResult] = useState<QueryResult>();

  // The execution result for 'job_id'
  const [jobQueryResult, setJobQueryResult] = useState<QueryResult>();

  const [fetchError, setFetchError] = useState<Error>();
  const createAbortController = useCreateAbortController();

  const normalizedParameters = useDeepMemo(
    () => normalizeParameters(parameters ?? []),
    parameters
  );

  const previousInputsRef = useRef<{
    queryId: number | undefined;
    normalizedParameters: Parameter[] | undefined;
    can_refresh: boolean;
    apiKey: string | undefined;
  }>();

  const refresh = useCallback(
    async (tempJobId?: string, tempQueryId?: number) => {
      if (queryId === undefined) {
        return;
      }

      const done = jobQueryResult?.job?.done ?? false;

      // If a previous job has finished, we overwrite the stale results
      // with the fresh results while waiting for the new job to finish.
      if (done) {
        if (jobQueryResult?.error !== undefined) {
          setErrorQueryResult(jobQueryResult);
        } else {
          setResultQueryResult(jobQueryResult);
        }
      }

      setJobQueryResult(undefined);
      setLoading(true);
      const controller = createAbortController();

      try {
        if (tempJobId !== undefined) {
          await pollQueryResult(
            tempQueryId ?? queryId,
            normalizedParameters,
            tempJobId,
            controller.signal,
            setJobQueryResult
          );
        } else {
          await pollQueryResults(
            queryId,
            normalizedParameters,
            session,
            apiKey,
            can_refresh,
            controller.signal,
            setResultQueryResult,
            setErrorQueryResult,
            setJobQueryResult
          );
        }
      } catch (error) {
        if (!(error instanceof Error)) {
          throw error;
        }

        if (error instanceof AbortError) {
          setJobQueryResult(undefined);
          return;
        }

        setFetchError(transformError(error));
      } finally {
        setLoading(false);
      }
    },
    [
      queryId,
      normalizedParameters,
      session,
      apiKey,
      can_refresh,
      jobQueryResult,
      createAbortController,
      setResultQueryResult,
      setErrorQueryResult,
      setJobQueryResult,
      setFetchError,
    ]
  );

  // This effect makes sure that the query results are refreshed when the
  // hook inputs change
  useEffect(() => {
    // No API key was specified, so we need to wait for the session to load
    // so we can determine whether it's a signed in user or not.
    if (apiKey === undefined && sessionLoading) {
      return;
    }

    const inputs = {
      queryId,
      normalizedParameters,
      can_refresh,
      apiKey,
    };

    if (!isEqual(inputs, previousInputsRef.current)) {
      refresh();
      previousInputsRef.current = inputs;
    }
  }, [
    queryId,
    normalizedParameters,
    can_refresh,
    apiKey,
    sessionLoading,
    refresh,
  ]);

  // This effect listens to the GetResult cache and makes sure that
  // query results are refreshed accordingly. The cache is updated whenever
  // a user clicks 'Run' on a dashboard.
  useEffect(() => {
    if (queryId === undefined) {
      return;
    }

    const subscription = watchGetResult(
      queryId,
      normalizedParameters,
      can_refresh,
      (data) => {
        const jobId = data.get_result_v4?.job_id ?? null;

        if (jobId === null) {
          return;
        }

        refresh(jobId);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [queryId, normalizedParameters, can_refresh, refresh]);

  // Merges stale and fresh results into a single query result
  const queryResult = useMemo(() => {
    const done = jobQueryResult?.job?.done ?? false;

    return {
      loading,
      error: done ? jobQueryResult?.error : errorQueryResult?.error,
      matrix: jobQueryResult?.matrix ?? resultQueryResult?.matrix,
      meta: jobQueryResult?.meta ?? resultQueryResult?.meta,
      job: jobQueryResult?.job,
      fetchError,
      refresh,
    };
  }, [
    loading,
    resultQueryResult,
    errorQueryResult,
    jobQueryResult,
    fetchError,
    refresh,
  ]);

  return queryResult;
}

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
  const formattedParams: Parameter[] = normalizeParameters(parameters ?? []);
  return {
    queryDoc: GetResultDocument,
    context: { session: session, apiKey },
    variables: {
      query_id: queryId ?? 0,
      parameters: formattedParams,
      can_refresh,
    },
  };
}

function useCreateAbortController() {
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      if (controllerRef.current !== null) {
        controllerRef.current.abort();
      }
    };
  }, []);

  const createAbortController = useCallback(() => {
    if (controllerRef.current !== null) {
      controllerRef.current.abort();
    }

    controllerRef.current = new AbortController();
    return controllerRef.current;
  }, []);

  return createAbortController;
}

// Uses the polling API for executions found in 'lib/execution/execution.ts' to
// poll the execution data for a given 'executionId'.
async function pollQueryResult(
  queryId: number,
  parameters: Parameter[],
  executionId: string,
  signal: AbortSignal,
  onQueryResult: (queryResult: QueryResult) => void
) {
  const executions = pollForFinalExecution(
    executionId,
    queryId,
    parameters,
    signal
  );

  for await (const execution of executions) {
    if (!signal.aborted) {
      onQueryResult(createQueryResult(queryId, execution));
    }
  }
}

// Uses the 'pollQueryResult' function to poll the stale and fresh
// query results in parallel. The stale results consist of the
// execution data for 'result_id' and 'error_id', while the fresh results
// consist of the execution data for 'job_id'.
async function pollQueryResults(
  queryId: number,
  parameters: Parameter[],
  session: Session | undefined,
  apiKey: string | undefined,
  canRefresh: boolean,
  signal: AbortSignal,
  onResultQueryResult: (queryResult: QueryResult) => void,
  onErrorQueryResult: (queryResult: QueryResult) => void,
  onJobQueryResult: (queryResult: QueryResult) => void
) {
  const {
    job_id = null,
    result_id = null,
    error_id = null,
  } = await callGetResult(queryId, parameters, session, apiKey, canRefresh);

  const promises: Promise<void>[] = [];

  if (result_id !== null) {
    promises.push(
      pollQueryResult(
        queryId,
        parameters,
        result_id,
        signal,
        onResultQueryResult
      )
    );
  }

  if (error_id !== null) {
    promises.push(
      pollQueryResult(queryId, parameters, error_id, signal, onErrorQueryResult)
    );
  }

  if (job_id !== null) {
    promises.push(
      pollQueryResult(queryId, parameters, job_id, signal, onJobQueryResult)
    );
  }

  await Promise.all(promises);
}

async function callGetResult(
  queryId: number,
  parameters: Parameter[],
  session: Session | undefined,
  apiKey: string | undefined,
  canRefresh: boolean
) {
  const { data } = await apolloCore.query<
    GetResultQuery,
    GetResultQueryVariables
  >({
    query: GetResultDocument,
    variables: { query_id: queryId, parameters, can_refresh: canRefresh },
    context: { session, apiKey },
    fetchPolicy: "no-cache",
  });

  const result = data.get_result_v4 ?? null;

  if (result === null) {
    throw new Error("Response from 'get_result_v4' was empty");
  }

  return result;
}

function watchGetResult(
  queryId: number,
  parameters: Parameter[],
  canRefresh: boolean,
  onGetResult: (data: GetResultQuery) => void
) {
  let isFirstResult = true;

  return apolloCore
    .watchQuery<GetResultQuery, GetResultQueryVariables>({
      query: GetResultDocument,
      variables: { query_id: queryId, parameters, can_refresh: canRefresh },
    })
    .subscribe({
      next: ({ data }) => {
        // Skip the first result since it's already handled elsewhere
        if (isFirstResult) {
          isFirstResult = false;
          return;
        }

        onGetResult(data);
      },
    });
}

/*
 * 👇 Utility functions for transforming an Execution into a QueryResult
 */

function createQueryResult(queryId: number, execution: Execution) {
  return {
    job: createQueryResultJob(queryId, execution),
    meta: createQueryResultMeta(queryId, execution),
    matrix: createQueryResultMatrix(execution),
    error: createQueryResultError(execution),
  };
}

function createQueryResultJob(
  queryId: number,
  execution: Execution
): QueryResultJob {
  if (isExecutionFinal(execution)) {
    return { done: true };
  }

  switch (execution.__typename) {
    case "ExecutionQueued":
      return {
        id: execution.execution_id,
        query_id: queryId,
        category: execution.execution_type,
        user_id: execution.execution_user_id ?? undefined,
        created_at: execution.created_at,
        is_running: false,
        queue_position: execution.position,
        done: false,
      };
    case "ExecutionRunning":
      return {
        id: execution.execution_id,
        query_id: queryId,
        category: execution.execution_type,
        user_id: execution.execution_user_id ?? undefined,
        created_at: execution.created_at,
        is_running: true,
        done: false,
      };
  }
}

function createQueryResultMeta(
  queryId: number,
  execution: Execution
): QueryResultMeta | undefined {
  if (execution.__typename !== "ExecutionSucceeded") {
    return undefined;
  }

  return {
    query_id: queryId,
    job_id: execution.execution_id,
    result_id: execution.execution_id,
    runtime: execution.runtime_seconds,
    generated_at: execution.generated_at,
    max_result_size_reached_bytes:
      execution.max_result_size_reached_bytes ?? undefined,
    request_max_result_size_bytes:
      execution.request_max_result_size_bytes ?? undefined,
  };
}

function createQueryResultMatrix(
  execution: Execution
): QueryResultMatrix | undefined {
  if (execution.__typename !== "ExecutionSucceeded") {
    return undefined;
  }

  const { data: rows = null, columns: columnNames = null } = execution;

  if (rows === null) {
    return undefined;
  }

  const columns = guessResultColumnTypes(rows);

  if (columnNames !== null) {
    sortColumns(columns, columnNames);
  }

  return { rows, columns };
}

function createQueryResultError(
  execution: Execution
): QueryResultError | undefined {
  if (execution.__typename !== "ExecutionFailed") {
    return undefined;
  }

  const metadata =
    execution.metadata !== undefined && execution.metadata !== null
      ? {
          line: execution.metadata.line,
          position: execution.metadata.column,
          hint: execution.metadata.hint,
        }
      : undefined;

  return {
    id: execution.execution_id,
    job_id: execution.execution_id,
    message: execution.message,
    type: execution.type,
    generated_at: execution.generated_at,
    metadata: metadata,
    runtime: execution.runtime_seconds,
  };
}

/*
 * 👇 Utility functions for transforming parameters and errors
 */

// Keep only certain fields (key, type, value, enumOptions) from the parameters
function normalizeParameters(parameters: Parameter[]): Parameter[] {
  return parameters.map(({ key, type, value, enumOptions }) => {
    const parameter: Parameter = { key, type, value };

    if (enumOptions !== undefined) {
      parameter.enumOptions = enumOptions;
    }

    return parameter;
  });
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

gql`
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
