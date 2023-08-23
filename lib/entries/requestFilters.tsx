/* eslint @typescript-eslint/strict-boolean-expressions: off */

import { assertUnreachable } from "src/utils/assertUnreachable";
import { EntryFilter } from "lib/entries/types";
import { EntryType } from "lib/entries/types";
import { EntriesRequestFilters } from "lib/entries/types";
import { QueriesRequestFilters } from "lib/entries/types";
import { Order_By } from "lib/types/graphql";

export const generateUserFilterVariables = (
  entriesRequestFilters: EntriesRequestFilters = {}
) => {
  return {
    query: entriesRequestFilters.q
      ? { _ilike: `%${entriesRequestFilters.q}%` }
      : {},
    limit: pagingSize(entriesRequestFilters),
    offset: pagingOffset(entriesRequestFilters),
  };
};

// Temporarily duplicate these functions to satisfy tsc...
export const generateDashboardFilterVariables = (
  entriesRequestFilters: EntriesRequestFilters = {},
  type: EntryType,
  filter?: EntryFilter
) => {
  const { time_range = "all" } = entriesRequestFilters;
  const order = entriesRequestFilters.order ?? defaultFilterOrder(type, filter);

  return {
    tags: entriesRequestFilters.tags
      ? { _contains: entriesRequestFilters.tags }
      : {},
    query: entriesRequestFilters.q
      ? { _ilike: `%${entriesRequestFilters.q}%` }
      : {},
    limit: pagingSize(entriesRequestFilters),
    offset: pagingOffset(entriesRequestFilters),
    order: pagingDashboardVariablesOrder(entriesRequestFilters, type, filter),
    favs_last_24h: time_range === "24h",
    favs_last_7d: time_range === "7d",
    favs_last_30d: time_range === "30d",
    // For trending, we sort by (trending scores, total number of stars)
    favs_all_time: time_range === "all" || order === "trending",
  };
};

const pagingDashboardVariablesOrder = (
  entriesRequestFilters: EntriesRequestFilters = {},
  type: EntryType,
  filter?: EntryFilter
) => {
  switch (entriesRequestFilters.order ?? defaultFilterOrder(type, filter)) {
    case "name":
      return { name: Order_By.Asc };

    case "created_at":
      return { created_at: Order_By.Desc };

    case "trending":
      return getTrendingOrder(entriesRequestFilters);

    case "favorites":
    default:
      return getFavoriteOrder(entriesRequestFilters, type);
  }
};

export const generateQueryFilterVariables = (
  entriesRequestFilters: QueriesRequestFilters = {},
  type: EntryType,
  filter?: EntryFilter
) => {
  const { time_range = "all" } = entriesRequestFilters;

  return {
    tags: entriesRequestFilters.tags
      ? { _contains: entriesRequestFilters.tags }
      : {},
    query: entriesRequestFilters.q
      ? { _ilike: `%${entriesRequestFilters.q}%` }
      : {},
    limit: pagingSize(entriesRequestFilters),
    offset: pagingOffset(entriesRequestFilters),
    order: pagingQueryVariablesOrder(entriesRequestFilters, type, filter),
    favs_last_24h: time_range === "24h",
    favs_last_7d: time_range === "7d",
    favs_last_30d: time_range === "30d",
    favs_all_time: time_range === "all",
    exclude_favorites: entriesRequestFilters.exclude_favorites || false,
    exclude_forks: entriesRequestFilters.exclude_forks || false,
    exclude_users: entriesRequestFilters.exclude_users || false,
    exclude_visualizations:
      entriesRequestFilters.exclude_visualizations || false,
  };
};

const pagingQueryVariablesOrder = (
  entriesRequestFilters: EntriesRequestFilters = {},
  type: EntryType,
  filter?: EntryFilter
) => {
  switch (entriesRequestFilters.order ?? defaultFilterOrder(type, filter)) {
    case "name":
      return { name: Order_By.Asc };

    case "created_at":
      return { created_at: Order_By.Desc };

    case "favorites":
    default:
      return getFavoriteOrder(entriesRequestFilters, type);
  }
};

function getFavoriteOrder(
  entriesRequestFilters: EntriesRequestFilters,
  type: EntryType
) {
  const { time_range = "7d" } = entriesRequestFilters;

  if (time_range === "all") {
    return [getAllTimeFavoriteOrder(type), { id: Order_By.Asc }];
  } else {
    return [getRecentFavoriteOrder(type, time_range), { id: Order_By.Asc }];
  }
}

function getTrendingOrder(entriesRequestFilters: EntriesRequestFilters) {
  const { time_range = "4h" } = entriesRequestFilters;
  return [
    {
      trending_scores: {
        [`score_${time_range}`]: Order_By.DescNullsLast,
      },
    },
    {
      dashboard_favorite_count_all: { favorite_count: Order_By.DescNullsLast },
    },
  ];
}

function getAllTimeFavoriteOrder(type: EntryType) {
  switch (type) {
    case "dashboard":
      return {
        dashboard_favorite_count_all: {
          favorite_count: Order_By.DescNullsLast,
        },
      };
    case "query":
      return {
        query_favorite_count_all: { favorite_count: Order_By.DescNullsLast },
      };
    default:
      assertUnreachable(type);
  }
}

function getRecentFavoriteOrder(
  type: EntryType,
  time_range: Omit<EntriesRequestFilters["time_range"], "all">
) {
  switch (type) {
    case "dashboard":
    case "query": {
      const prop = `${type}_favorite_count_last_${time_range}`;
      return { [prop]: { favorite_count: Order_By.DescNullsLast } };
    }
    default:
      assertUnreachable(type);
  }
}

const defaultFilterOrder = (type: EntryType, filter?: EntryFilter) => {
  switch (type) {
    case "dashboard":
      switch (filter) {
        // https://dune.com/browse/dashboards/authored
        case "authored":
          return "created_at";

        // https://dune.com/browse/dashboards/favorite
        // https://dune.com/browse/dashboards
        case "favorite":
        default:
          return "trending";
      }

    case "query":
      switch (filter) {
        // https://dune.com/browse/queries/authored
        case "authored":
          return "created_at";

        // https://dune.com/browse/queries/favorite
        // https://dune.com/browse/queries
        case "favorite":
        default:
          return "favorites";
      }

    default:
      assertUnreachable(type);
  }
};

export const pagingPage = (
  entriesRequestFilters: EntriesRequestFilters = {}
) => {
  return entriesRequestFilters.page ?? 1;
};

export const pagingSize = (
  entriesRequestFilters: EntriesRequestFilters = {}
) => {
  return entriesRequestFilters.page_size ?? 20;
};

const pagingOffset = (entriesRequestFilters: EntriesRequestFilters = {}) => {
  return (
    pagingSize(entriesRequestFilters) * ((entriesRequestFilters.page ?? 1) - 1)
  );
};
