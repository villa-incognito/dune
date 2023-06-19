import { gql } from "@apollo/client";
import { logger } from "lib/logger/browser";

import { useSession } from "gui/session/session";
import { useDashboardsFavoritesQuery } from "lib/types/graphql";

type DashboardId = number;

export interface Output {
  dict?: Record<DashboardId, { iHaveFavorited: boolean }>;
}

export default function useDashboardsFavorites(
  dashboard_ids: number[]
): Output {
  const session = useSession();
  const session_id = session?.user?.id;

  const { data } = useDashboardsFavoritesQuery({
    skip: session_id === undefined || dashboard_ids.length === 0,
    variables: {
      dashboard_ids: dashboard_ids.sort(),
      session_id: session_id,
    },
    context: { session }, // Needs session to get private dashboards
    onError: logger.error,
    fetchPolicy: "cache-first",
  });

  return {
    dict:
      data &&
      Object.fromEntries(
        data.dashboards.map((dashboard) => [
          dashboard.id,
          {
            iHaveFavorited: dashboard.favorite_dashboards.length === 1,
          },
        ])
      ),
  };
}

// Not assigned to constant here. Using generated. See _GrahphQL requests_ in readme.
gql`
  query DashboardsFavorites($dashboard_ids: [Int!]!, $session_id: Int) {
    dashboards(where: { id: { _in: $dashboard_ids } }, limit: 20) {
      id
      favorite_dashboards(where: { user_id: { _eq: $session_id } }, limit: 1) {
        created_at
      }
    }
  }
`;
