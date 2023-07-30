/* eslint @typescript-eslint/strict-boolean-expressions: off */

import { ApolloError, gql, QueryResult } from "@apollo/client";
import * as Sentry from "@sentry/react";
import type { ActiveContext } from "shared/ContextSwitcher/store";
import { useSession } from "gui/session/session";
import {
  OperationCosts,
  useGetTeamOperationCostsQuery,
  useGetUserOperationCostsQuery,
} from "lib/types/graphql";
import { ReactNode } from "react";

gql`
  query GetTeamOperationCosts($teamId: Int!) {
    team_operation_costs(team_id: $teamId) {
      key
      interactive_executions {
        dataset_id
        public_performance_tier_key
        credits
      }
    }
  }
`;

gql`
  query GetUserOperationCosts {
    user_operation_costs {
      key
      interactive_executions {
        dataset_id
        public_performance_tier_key
        credits
      }
    }
  }
`;

const PerformanceTierDisplayNames = {
  free: {
    displayName: "Free",
    description: (
      <>
        Run fast queries in the query editor in a Medium size cluster with lower
        guarantees but at no cost.
      </>
    ),
  },
  medium: {
    displayName: "Medium",
    description: <>Run faster queries more reliably.</>,
  },
  large: {
    displayName: "Large",
    description: <>Speed up your more complex workloads.</>,
  },
};

type DatasetID = number;

export type SupportedPublicPerformanceTierKey = keyof typeof PerformanceTierDisplayNames;

export function isSupportedPublicPerformanceTierKey(
  string: string
): string is SupportedPublicPerformanceTierKey {
  return string in PerformanceTierDisplayNames;
}

export type ExecutionTiersData = {
  publicPerformanceTierKey: SupportedPublicPerformanceTierKey;
  displayName: string;
  description: ReactNode;
  credits: number;
};

type PerformanceTiers = Record<DatasetID, ExecutionTiersData[]>;

export function useGetPerformanceTiers(
  activeContext: ActiveContext | undefined
): Pick<QueryResult<PerformanceTiers>, "loading" | "data" | "error"> {
  const session = useSession();
  const teamId = activeContext?.id ?? 0;

  const teamResult = useGetTeamOperationCostsQuery({
    skip:
      !session ||
      !session.user ||
      !activeContext ||
      activeContext.type !== "team",
    variables: { teamId },
    context: { session },
    fetchPolicy: "cache-first",
  });
  const userResult = useGetUserOperationCostsQuery({
    skip:
      !session ||
      !session.user ||
      !activeContext ||
      activeContext.type !== "user",
    context: { session },
    fetchPolicy: "cache-first",
  });

  const isTeam = activeContext && activeContext.type === "team";
  const resultData: OperationCosts | undefined = isTeam
    ? teamResult.data?.team_operation_costs
    : userResult.data?.user_operation_costs;
  const loading: boolean = isTeam ? teamResult.loading : userResult.loading;
  const error: ApolloError | undefined = isTeam
    ? teamResult.error
    : userResult.error;

  return {
    error,
    loading,
    data: resultData && transformOperationCosts(resultData),
  };
}

// transformOperationCosts transforms the operation costs response from a dict of dicts to
// a dict of arrays. It also merges in display information.
function transformOperationCosts(serverData: OperationCosts): PerformanceTiers {
  const executionTiers = serverData.interactive_executions;

  const result: PerformanceTiers = {};
  for (const executionTier of executionTiers) {
    if (!result[executionTier.dataset_id]) {
      result[executionTier.dataset_id] = [] as ExecutionTiersData[];
    }
    const publicPerformanceTierKey = executionTier.public_performance_tier_key as SupportedPublicPerformanceTierKey;
    if (PerformanceTierDisplayNames[publicPerformanceTierKey]) {
      result[executionTier.dataset_id]!.push({
        publicPerformanceTierKey,
        displayName:
          PerformanceTierDisplayNames[publicPerformanceTierKey].displayName,
        description:
          PerformanceTierDisplayNames[publicPerformanceTierKey].description,
        credits: executionTier.credits,
      });
    } else {
      Sentry.captureException(
        `${publicPerformanceTierKey} is not a supported performance tier`
      );
    }
  }
  Object.keys(result).forEach((key) => {
    result[Number(key)].sort((a, b) => a.credits - b.credits);
  });
  return result;
}
