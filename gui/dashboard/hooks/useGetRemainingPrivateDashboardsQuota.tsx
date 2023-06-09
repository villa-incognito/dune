import { gql, QueryResult } from "@apollo/client";
import { useRequiredSessionWithUser } from "gui/session/session";
import {
  useGetTeamPrivateDashboardsQuery,
  useGetUserPrivateDashboardsQuery,
} from "lib/types/graphql";

interface Context {
  type: "user" | "team";
  id: number;
}

export function useGetRemainingPrivateDashboardsQuota(
  context?: Context
): Pick<QueryResult<{ remainingQuota: number }>, "loading" | "data" | "error"> {
  const session = useRequiredSessionWithUser();
  const userResult = useGetUserPrivateDashboardsQuery({
    skip: !context || context.type !== "user",
    context: { session },
    fetchPolicy: "cache-and-network",
  });
  const teamResult = useGetTeamPrivateDashboardsQuery({
    skip: !context || context.type !== "team",
    context: { session },
    fetchPolicy: "cache-and-network",
    variables: { teamId: context!.id },
  });

  if (!context) {
    return {
      data: { remainingQuota: 0 },
      loading: false,
    };
  }

  let remainingQuota: number;
  switch (context.type) {
    case "team": {
      const maxPrivateDashboards =
        teamResult.data?.team_members_details[0]?.service_tier
          ?.max_private_dashboards;
      const privateDashboardsCount =
        teamResult.data?.dashboards_aggregate?.aggregate?.count;
      if (maxPrivateDashboards === null) {
        // if maxPrivateDashboards is null it means that the team has infinite remaining quota.
        // Can return any positive number, but 1000 is a nice round number and reflects the high number of remaining dashboards.
        remainingQuota = 1000;
      } else if (
        maxPrivateDashboards !== undefined &&
        privateDashboardsCount !== undefined
      ) {
        remainingQuota = maxPrivateDashboards - privateDashboardsCount;
      } else {
        remainingQuota = 0;
      }
      break;
    }
    case "user": {
      const maxPrivateDashboards =
        session.user.user_service_tier.max_private_dashboards;
      const privateDashboardsCount =
        userResult.data?.dashboards_aggregate?.aggregate?.count;
      if (maxPrivateDashboards === null) {
        // if maxPrivateDashboards is null it means that the user has infinite remaining quota.
        // Can return any positive number, but 1000 is a nice round number and reflects the high number of remaining dashboards.
        remainingQuota = 1000;
      } else if (
        maxPrivateDashboards !== undefined &&
        privateDashboardsCount !== undefined
      ) {
        remainingQuota = maxPrivateDashboards - privateDashboardsCount;
      } else {
        remainingQuota = 0;
      }
      break;
    }
  }
  const loading =
    context.type === "team" ? teamResult.loading : userResult.loading;
  const error = context.type === "team" ? teamResult.error : userResult.error;
  return {
    data: { remainingQuota },
    loading,
    error,
  };
}

gql`
  query GetUserPrivateDashboards {
    dashboards_aggregate(
      where: {
        is_private: { _eq: true }
        is_archived: { _eq: false }
        team_id: { _is_null: true }
      }
    ) {
      aggregate {
        count
      }
    }
  }
`;

gql`
  query GetTeamPrivateDashboards($teamId: Int!) {
    dashboards_aggregate(
      where: {
        is_private: { _eq: true }
        is_archived: { _eq: false }
        team_id: { _eq: $teamId }
      }
    ) {
      aggregate {
        count
      }
    }

    team_members_details(where: { id: { _eq: $teamId } }) {
      id
      service_tier {
        id
        max_private_dashboards
      }
    }
  }
`;
