import { gql } from "@apollo/client";
import { apolloCoreHack } from "lib/apollo/apollo";
import {
  ExecutionFailed,
  ExecutionQueued,
  ExecutionRunning,
  ExecutionSucceeded,
  GetExecutionDocument,
  GetExecutionQuery,
  GetExecutionQueryVariables,
  Parameter,
} from "lib/types/graphql";
import { PickRequired } from "lib/types/types";
import { LRUCache } from "./cache";
import { sizeOf } from "./memory";

export class AbortError extends Error {
  constructor(message = "The operation was canceled") {
    super(message);
  }
}

export const executionCache = new LRUCache<string, ExecutionFinal>({
  limit: 100,
  maxSize: 512 * 1024 * 1024,
  sizeCalculation: (value, key) => {
    return sizeOf(value) + sizeOf(key);
  },
});

export type Execution = ExecutionPending | ExecutionFinal;

type ExecutionPending =
  | PickRequired<ExecutionQueued, "__typename">
  | PickRequired<ExecutionRunning, "__typename">;

export type ExecutionFinal =
  | PickRequired<ExecutionSucceeded, "__typename">
  | PickRequired<ExecutionFailed, "__typename">;

export async function* pollForFinalExecution(
  executionId: string,
  queryId: number,
  parameters: Parameter[],
  signal: AbortSignal,
  pollingDelay = 1000
): AsyncGenerator<Execution> {
  const cachedExecution = executionCache.get(executionId);

  if (cachedExecution !== undefined) {
    yield cachedExecution;
    return;
  }

  try {
    let execution = await abortable(
      callGetExecution(executionId, queryId, parameters),
      signal
    );

    yield execution;

    while (isExecutionPending(execution)) {
      if (signal.aborted) {
        return;
      }

      await abortable(delay(pollingDelay), signal);

      execution = await abortable(
        callGetExecution(executionId, queryId, parameters),
        signal
      );

      yield execution;
    }

    executionCache.set(executionId, execution);
  } catch (error) {
    if (signal.aborted) {
      return;
    }

    throw error;
  }
}

async function callGetExecution(
  executionId: string,
  queryId: number,
  parameters: Parameter[]
) {
  const { data } = await apolloCoreHack.query<
    GetExecutionQuery,
    GetExecutionQueryVariables
  >({
    query: GetExecutionDocument,
    variables: {
      execution_id: executionId,
      query_id: queryId,
      parameters,
    },
    fetchPolicy: "no-cache",
  });

  return toExecution(data);
}

function delay(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function abortable<T>(promise: Promise<T>, signal: AbortSignal) {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => {
      signal.addEventListener("abort", () => {
        reject(new AbortError());
      });
    }),
  ]);
}

export function isExecutionPending(
  execution: Execution
): execution is ExecutionPending {
  return (
    execution.__typename === "ExecutionQueued" ||
    execution.__typename === "ExecutionRunning"
  );
}

export function isExecutionFinal(
  execution: Execution
): execution is ExecutionFinal {
  return (
    execution.__typename === "ExecutionSucceeded" ||
    execution.__typename === "ExecutionFailed"
  );
}

function toExecution({ get_execution }: GetExecutionQuery): Execution {
  const executionQueued = get_execution?.execution_queued ?? null;
  const executionRunning = get_execution?.execution_running ?? null;
  const executionSucceeded = get_execution?.execution_succeeded ?? null;
  const executionFailed = get_execution?.execution_failed ?? null;

  if (executionQueued !== null) {
    return { __typename: "ExecutionQueued", ...executionQueued };
  }

  if (executionRunning !== null) {
    return { __typename: "ExecutionRunning", ...executionRunning };
  }

  if (executionSucceeded !== null) {
    return { __typename: "ExecutionSucceeded", ...executionSucceeded };
  }

  if (executionFailed !== null) {
    return { __typename: "ExecutionFailed", ...executionFailed };
  }

  throw new AbortError();
}

gql`
  query GetExecution(
    $execution_id: String!
    $query_id: Int!
    $parameters: [Parameter!]!
  ) {
    get_execution(
      execution_id: $execution_id
      query_id: $query_id
      parameters: $parameters
    ) {
      execution_queued {
        execution_id
        execution_user_id
        position
        execution_type
        created_at
      }
      execution_running {
        execution_id
        execution_user_id
        execution_type
        started_at
        created_at
      }
      execution_succeeded {
        execution_id
        runtime_seconds
        generated_at
        columns
        data
        max_result_size_reached_bytes
        request_max_result_size_bytes
      }
      execution_failed {
        execution_id
        type
        message
        metadata {
          line
          column
          hint
        }
        runtime_seconds
        generated_at
      }
    }
  }
`;
