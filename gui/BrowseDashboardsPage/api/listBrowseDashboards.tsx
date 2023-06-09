import { gql } from "@apollo/client";

import {
  dashboardItemGqlFragment,
  toDashboardType,
  DashboardType,
} from "./dashboardItem";

import {
  ListBrowseDashboardsQuery,
  ListBrowseDashboardsQueryVariables,
  Order_By,
} from "lib/types/graphql";

/* Get variables for the dashboard */

export interface ApiParams {
  filter: {
    freetext: string;
    owner?: {
      type: "user" | "team";
      handle: string;
    };
    tag?: string;
  };
  order:
    | {
        by: "trending";
        time_range: "1h" | "4h" | "24h";
      }
    | {
        by: "favorites";
        time_range: "24h" | "7d" | "30d" | "all";
      }
    | {
        by: "created_at";
      }
    | {
        by: "name";
      };
  page: number;
  pageSize: number;
}

export function getListBrowseDashboardsVariables(
  input: ApiParams
): ListBrowseDashboardsQueryVariables {
  function order() {
    switch (input.order.by) {
      case "trending": {
        const { time_range } = input.order;
        return [
          {
            trending_scores: {
              [`score_${time_range}`]: Order_By.DescNullsLast,
            },
          },
          {
            dashboard_favorite_count_all: {
              favorite_count: Order_By.DescNullsLast,
            },
          },
        ];
      }
      case "favorites": {
        const favorite_view =
          input.order.time_range === "all"
            ? "dashboard_favorite_count_all"
            : `dashboard_favorite_count_last_${input.order.time_range}`;
        return [
          { [favorite_view]: { favorite_count: Order_By.DescNullsLast } },
          { id: Order_By.Asc },
        ];
      }
      case "created_at":
        return { created_at: Order_By.Desc };
      case "name":
        return { name: Order_By.Asc };
    }
  }

  function filterTags() {
    if (input.filter.tag) {
      return { _contains: [input.filter.tag] };
    } else {
      return {};
    }
  }

  function includeFavs() {
    function isFavs(time_range: string): boolean {
      return (
        input.order.by === "favorites" && input.order.time_range === time_range
      );
    }
    return {
      include_favs_last_24h: isFavs("24h"),
      include_favs_last_7d: isFavs("7d"),
      include_favs_last_30d: isFavs("30d"),
      include_favs_all_time: isFavs("all") || input.order.by !== "favorites",
    };
  }

  function filterOwner() {
    const { owner } = input.filter;
    if (!owner) {
      return [];
    }
    switch (owner.type) {
      case "team":
        return [{ team: { handle: { _eq: owner.handle } } }];
      case "user":
        return [{ user: { name: { _eq: owner.handle } } }];
    }
  }

  return {
    filter_name: input.filter.freetext
      ? { _ilike: `%${input.filter.freetext}%` }
      : {},
    filter_tags: filterTags(),
    filter_custom: filterOwner(),
    order: order(),
    limit: input.pageSize,
    offset: input.pageSize * (input.page - 1),

    ...includeFavs(),
  };
}

/* The actual query */
// Not assigned to constant here. Using generated. See _GrahphQL requests_ in readme.
gql`
  query ListBrowseDashboards(
    $filter_name: String_comparison_exp
    $filter_tags: jsonb_comparison_exp
    $filter_custom: [dashboards_bool_exp!]
    $order: [dashboards_order_by!]
    $limit: Int!
    $offset: Int!
    $include_favs_last_24h: Boolean! = false
    $include_favs_last_7d: Boolean! = false
    $include_favs_last_30d: Boolean! = false
    $include_favs_all_time: Boolean! = false
  ) {
    dashboards(
      where: {
        is_archived: { _eq: false }
        name: $filter_name
        tags: $filter_tags
        _and: $filter_custom
      }
      limit: $limit
      offset: $offset
      order_by: $order
    ) {
      ...DashboardItem
    }
    dashboards_aggregate(
      where: {
        is_archived: { _eq: false }
        name: $filter_name
        tags: $filter_tags
        _and: $filter_custom
      }
    ) {
      aggregate {
        count
      }
    }
  }

  ${dashboardItemGqlFragment}
`;

/* Selector: Transform dashboard result data to more usable data structure */
export function transformData(
  data: ListBrowseDashboardsQuery
): {
  dashboards: DashboardType[];
  total_count: number;
} {
  return {
    dashboards: data.dashboards.map(toDashboardType),
    total_count: data.dashboards_aggregate?.aggregate?.count ?? 0,
  };
}
