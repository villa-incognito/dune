import { DeleteFavoriteDashboardMutation } from "lib/types/graphql";
import { DeleteFavoriteDashboardMutationVariables } from "lib/types/graphql";
import { DeleteFavoriteQueryMutation } from "lib/types/graphql";
import { DeleteFavoriteQueryMutationVariables } from "lib/types/graphql";
import { Owner } from "lib/entries/types";
import { Entry, EntryPageWithVizWidgets } from "lib/entries/types";
import { FullDashboard, EntryDashboard } from "lib/entries/types";
import { EntryDashboardWithVizWidgets } from "lib/entries/types";
import { EntryPage } from "lib/entries/types";
import { EntriesRequestFilters } from "lib/entries/types";
import { EntryQuery } from "lib/entries/types";
import { EntryUser } from "lib/entries/types";
import { EntrySlug } from "lib/entries/types";
import { FindDashboardQuery } from "lib/types/graphql";
import { FindDashboardQueryVariables } from "lib/types/graphql";
import { FindQueryQuery } from "lib/types/graphql";
import { FindQueryQueryVariables } from "lib/types/graphql";
import { InsertFavoriteDashboardMutation } from "lib/types/graphql";
import { InsertFavoriteDashboardMutationVariables } from "lib/types/graphql";
import { InsertFavoriteQueryMutation } from "lib/types/graphql";
import { InsertFavoriteQueryMutationVariables } from "lib/types/graphql";
import { ListDashboardsQuery } from "lib/types/graphql";
import { ListDashboardsQueryVariables } from "lib/types/graphql";
import { ListDashboardsWithVisualizationWidgetsQuery } from "lib/types/graphql";
import { ListDashboardsWithVisualizationWidgetsQueryVariables } from "lib/types/graphql";
import { ListFavoriteDashboardsQuery } from "lib/types/graphql";
import { ListFavoriteDashboardsQueryVariables } from "lib/types/graphql";
import { ListFavoriteQueriesQuery } from "lib/types/graphql";
import { ListFavoriteQueriesQueryVariables } from "lib/types/graphql";
import { ListQueriesQuery } from "lib/types/graphql";
import { ListQueriesQueryVariables } from "lib/types/graphql";
import { ListUsersQuery } from "lib/types/graphql";
import { ListUsersQueryVariables } from "lib/types/graphql";
import { NotFoundError } from "lib/entries/errors";
import { Session } from "lib/users/types";
import { apolloCore } from "lib/apollo/apollo";
import { assert } from "lib/assert/assert";
import { assertUnreachable } from "lib/assertUnreachable";
import { convertNull } from "lib/types/types";
import { deleteFavoriteDashboard } from "lib/entries/graphql";
import { deleteFavoriteQuery } from "lib/entries/graphql";
import { findDashboard } from "lib/entries/graphql";
import { findQuery } from "lib/entries/graphql";
import { insertFavoriteDashboard } from "lib/entries/graphql";
import { insertFavoriteQuery } from "lib/entries/graphql";
import { listDashboards } from "lib/entries/graphql";
import { listFavoriteDashboards } from "lib/entries/graphql";
import { listFavoriteQueries } from "lib/entries/graphql";
import { ListDashboardsWithVisualizationWidgetsDocument } from "lib/types/graphql";
import { listUsers } from "lib/entries/graphql";
import { listQueries } from "lib/entries/graphql";
import { pagingPage } from "lib/entries/requestFilters";
import { pagingSize } from "lib/entries/requestFilters";
import { generateDashboardFilterVariables } from "lib/entries/requestFilters";
import { generateQueryFilterVariables } from "lib/entries/requestFilters";
import { generateUserFilterVariables } from "lib/entries/requestFilters";
import { preprocessWidgets } from "lib/widgets/widgets";
import { removeNullable } from "lib/types/types";
import { sortParameters } from "lib/parameters/parameters";
import { sortVisuals } from "lib/visuals/visuals";
import type { Maybe, Teams, Users } from "lib/types/graphql";
import { FindDashboardMetadataDocument } from "lib/types/graphql";
import { FindDashboardMetadataQuery } from "lib/types/graphql";
import { FindDashboardMetadataQueryVariables } from "lib/types/graphql";
import { FindQueryMetadataDocument } from "lib/types/graphql";
import { FindQueryMetadataQuery } from "lib/types/graphql";
import { FindQueryMetadataQueryVariables } from "lib/types/graphql";

export const fetchDashboard = async (
  user: string,
  slug: string,
  session?: Session,
  apiKey?: string
) => {
  const res = await apolloCore.query<
    FindDashboardQuery,
    FindDashboardQueryVariables
  >({
    query: findDashboard,
    variables: {
      session_filter: session?.user?.id ? { _eq: session.user.id } : {},
      user,
      slug,
    },
    context: { session, apiKey },
    fetchPolicy: "no-cache",
  });

  if (!res.data.dashboards[0]) {
    throw new NotFoundError(`dashboard not found: ${slug}`);
  }

  return preprocessWidgets(parseDashboardResponse(res.data.dashboards[0]));
};

export const fetchDashboardMetadata = async (
  owner_handle: string,
  slug: string,
  apiKey?: string
) => {
  const res = await apolloCore.query<
    FindDashboardMetadataQuery,
    FindDashboardMetadataQueryVariables
  >({
    query: FindDashboardMetadataDocument,
    variables: { owner_handle, slug },
    context: { apiKey },
  });

  return res.data.dashboards[0];
};

export const fetchQuery = async (
  id: number,
  session?: Session,
  apiKey?: string
) => {
  const res = await apolloCore.query<FindQueryQuery, FindQueryQueryVariables>({
    query: findQuery,
    variables: {
      session_filter: session?.user?.id ? { _eq: session.user.id } : {},
      id,
    },
    context: { session, apiKey },
    fetchPolicy: "no-cache",
  });

  if (!res.data.queries[0]) {
    throw new NotFoundError(`query not found: ${id}`);
  }

  return parseQueryResponse(res.data.queries[0], { time_range: "all" });
};

export const fetchQueryMetadata = async (id: number) => {
  const res = await apolloCore.query<
    FindQueryMetadataQuery,
    FindQueryMetadataQueryVariables
  >({
    query: FindQueryMetadataDocument,
    variables: { id: id },
  });

  return res.data.queries_by_pk;
};

export const fetchDashboards = async (
  entriesRequestFilters: EntriesRequestFilters,
  session?: Session
) => {
  function filterAuthorName() {
    if (entriesRequestFilters.user_name) {
      return [{ user: { name: { _eq: entriesRequestFilters.user_name } } }];
    } else if (entriesRequestFilters.team_handle) {
      return [{ team: { handle: { _eq: entriesRequestFilters.team_handle } } }];
    } else {
      return [];
    }
  }

  const res = await apolloCore.query<
    ListDashboardsQuery,
    ListDashboardsQueryVariables
  >({
    query: listDashboards,
    variables: {
      session_filter: session?.user?.id ? { _eq: session.user.id } : {},
      filter_custom: filterAuthorName(),
      ...generateDashboardFilterVariables(entriesRequestFilters, "dashboard"),
    },
    context: { session },
    fetchPolicy: "no-cache",
  });

  return parseDashboardsResponse(res.data, entriesRequestFilters);
};

export const fetchQueries = async (
  entriesRequestFilters: EntriesRequestFilters,
  session?: Session
) => {
  function filterAuthorName() {
    if (entriesRequestFilters.user_name) {
      return {
        _or: [
          { user: { name: { _eq: entriesRequestFilters.user_name } } },
          {
            team: {
              memberships: {
                user: { name: { _eq: entriesRequestFilters.user_name } },
              },
            },
          },
        ],
      };
    } else if (entriesRequestFilters.team_handle) {
      return { team: { handle: { _eq: entriesRequestFilters.team_handle } } };
    } else {
      return [];
    }
  }

  const res = await apolloCore.query<
    ListQueriesQuery,
    ListQueriesQueryVariables
  >({
    query: listQueries,
    variables: {
      session_filter: session?.user?.id ? { _eq: session.user.id } : {},
      filter_custom: filterAuthorName(),
      ...generateQueryFilterVariables(entriesRequestFilters, "query"),
      is_archived: false,
    },
    context: { session },
    fetchPolicy: "no-cache",
  });

  return parseQueriesResponse(res.data, entriesRequestFilters);
};

export const fetchUsers = async (
  entriesRequestFilters: EntriesRequestFilters,
  session?: Session
): Promise<EntryPage<EntryUser>> => {
  const { limit, offset, query } = generateUserFilterVariables(
    entriesRequestFilters
  );

  const res = await apolloCore.query<ListUsersQuery, ListUsersQueryVariables>({
    query: listUsers,
    variables: {
      limit,
      offset,
      query,
    },
    context: { session },
    fetchPolicy: "no-cache",
  });

  const users: EntryUser[] = res.data.user_received_stars.map(
    ({ sum, user }) => {
      if (user === undefined || user === null) {
        throw new Error("User is undefined or null");
      }

      return {
        ...user,
        receivedStars: sum,
        firstQueryCreatedDate: user.queries[0]?.created_at ?? null,
      };
    }
  );

  return {
    count: res.data.user_received_stars_aggregate.aggregate?.count ?? 0,
    page_size: pagingSize(entriesRequestFilters),
    page: pagingPage(entriesRequestFilters),
    results: users,
  };
};

export const fetchRelatedDashboards = async (
  dashboard: FullDashboard,
  session?: Session
) => {
  // Dashboards without tags have no related dashboards.
  if (!dashboard.tags || dashboard.tags.length === 0) {
    return [];
  }

  const res = await fetchDashboards(
    { tags: dashboard.tags, page_size: 6 },
    session
  );

  // Remove the current dashboard from the related.
  const results = res?.results ?? [];
  return results.filter((r) => r.id !== dashboard.id);
};

export const fetchAuthoredDashboardsWithVisualizationWidgets = async (
  entriesRequestFilters: EntriesRequestFilters,
  session?: Session
): Promise<EntryPageWithVizWidgets<EntryDashboardWithVizWidgets>> => {
  assert(session, "fetchAuthoredDashboards called without a session");

  const { query } = generateDashboardFilterVariables(
    entriesRequestFilters,
    "query",
    "authored"
  );

  const res = await apolloCore.query<
    ListDashboardsWithVisualizationWidgetsQuery,
    ListDashboardsWithVisualizationWidgetsQueryVariables
  >({
    query: ListDashboardsWithVisualizationWidgetsDocument,
    variables: {
      author_name: session!.user!.name!,
      query,
    },
    context: { session },
    fetchPolicy: "no-cache",
  });
  return parseDashboardsWithVizWidgetsResponse(res.data);
};

export const fetchAuthoredQueries = async (
  entriesRequestFilters: EntriesRequestFilters,
  session?: Session
): Promise<EntryPage<EntryQuery>> => {
  assert(session, "fetchAuthoredQueries called without a session");

  function filterAuthorName() {
    return {
      _or: [
        { user: { name: { _eq: session!.user!.name! } } },
        {
          team: {
            memberships: {
              user: { name: { _eq: session!.user!.name! } },
            },
          },
        },
      ],
    };
  }

  const res = await apolloCore.query<
    ListQueriesQuery,
    ListQueriesQueryVariables
  >({
    query: listQueries,
    variables: {
      session_filter: { _eq: session!.user!.id! },
      filter_custom: filterAuthorName(),
      ...generateQueryFilterVariables(
        entriesRequestFilters,
        "query",
        "authored"
      ),
      is_archived: Boolean(entriesRequestFilters.archived),
    },
    context: { session },
    fetchPolicy: "no-cache",
  });

  return parseQueriesResponse(res.data, entriesRequestFilters);
};

export const fetchFavoriteDashboards = async (
  entriesRequestFilters: EntriesRequestFilters,
  session?: Session
): Promise<EntryPage<EntryDashboard>> => {
  assert(session, "fetchFavoriteDashboards called without a session");

  const res = await apolloCore.query<
    ListFavoriteDashboardsQuery,
    ListFavoriteDashboardsQueryVariables
  >({
    query: listFavoriteDashboards,
    variables: {
      session_id: session!.user!.id!,
      ...generateDashboardFilterVariables(
        entriesRequestFilters,
        "dashboard",
        "favorite"
      ),
    },
    context: { session },
    fetchPolicy: "no-cache",
  });

  return parseDashboardsResponse(res.data, entriesRequestFilters);
};

export const fetchFavoriteQueries = async (
  entriesRequestFilters: EntriesRequestFilters,
  session?: Session
): Promise<EntryPage<EntryQuery>> => {
  assert(session, "fetchFavoriteQueries called without a session");

  const res = await apolloCore.query<
    ListFavoriteQueriesQuery,
    ListFavoriteQueriesQueryVariables
  >({
    query: listFavoriteQueries,
    variables: {
      session_id: session!.user!.id!,
      ...generateQueryFilterVariables(
        entriesRequestFilters,
        "query",
        "favorite"
      ),
    },
    context: { session },
    fetchPolicy: "no-cache",
  });

  return parseQueriesResponse(res.data, entriesRequestFilters);
};

export const updateFavorite = async (
  entry: Entry,
  insert: boolean,
  session?: Session
) => {
  assert(session, "updateFavorite called without a session");

  const variables = { session_id: session!.user!.id! };
  const context = { session };

  if (isDashboard(entry) && insert) {
    return await apolloCore.mutate<
      InsertFavoriteDashboardMutation,
      InsertFavoriteDashboardMutationVariables
    >({
      mutation: insertFavoriteDashboard,
      variables: { ...variables, dashboard_id: entry.id },
      fetchPolicy: "no-cache",
      context,
    });
  }

  if (isDashboard(entry) && !insert) {
    return await apolloCore.mutate<
      DeleteFavoriteDashboardMutation,
      DeleteFavoriteDashboardMutationVariables
    >({
      mutation: deleteFavoriteDashboard,
      variables: { ...variables, dashboard_id: entry.id },
      fetchPolicy: "no-cache",
      context,
    });
  }

  if (isQuery(entry) && insert) {
    return await apolloCore.mutate<
      InsertFavoriteQueryMutation,
      InsertFavoriteQueryMutationVariables
    >({
      mutation: insertFavoriteQuery,
      variables: { ...variables, query_id: entry.id },
      fetchPolicy: "no-cache",
      context,
    });
  }

  if (isQuery(entry) && !insert) {
    return await apolloCore.mutate<
      DeleteFavoriteQueryMutation,
      DeleteFavoriteQueryMutationVariables
    >({
      mutation: deleteFavoriteQuery,
      variables: { ...variables, query_id: entry.id },
      fetchPolicy: "no-cache",
      context,
    });
  }

  throw new Error(`unknown favorite update`);
};

const parseDashboardsResponse = (
  data: ListDashboardsQuery | ListFavoriteDashboardsQuery,
  entriesRequestFilters: EntriesRequestFilters
): EntryPage<EntryDashboard> => {
  return {
    count: data.dashboards_aggregate.aggregate?.count ?? 0,
    page_size: pagingSize(entriesRequestFilters),
    page: pagingPage(entriesRequestFilters),
    results: data.dashboards.map((r) =>
      parseEntryDashboardResponse(r, entriesRequestFilters)
    ),
  };
};

const parseDashboardsWithVizWidgetsResponse = (
  data: ListDashboardsWithVisualizationWidgetsQuery
): EntryPageWithVizWidgets<EntryDashboardWithVizWidgets> => {
  return {
    results: data.dashboards.map((r) =>
      parseEntryDashboardWithVizWidgetsResponse(r)
    ),
  };
};

const parseQueriesResponse = (
  data: ListQueriesQuery | ListFavoriteQueriesQuery,
  entriesRequestFilters: EntriesRequestFilters
): EntryPage<EntryQuery> => {
  return {
    count: data.queries_aggregate.aggregate?.count ?? 0,
    page_size: pagingSize(entriesRequestFilters),
    page: pagingPage(entriesRequestFilters),
    results: data.queries.map((r) =>
      parseQueryResponse(r, entriesRequestFilters)
    ),
  };
};

const parseEntryDashboardResponse = (
  data: ListDashboardsQuery["dashboards"][0],
  entriesRequestFilters: Pick<EntriesRequestFilters, "order" | "time_range">
): EntryDashboard => {
  function favsInPeriod(): number {
    if (entriesRequestFilters.order === "favorites") {
      switch (entriesRequestFilters.time_range) {
        case "24h":
          return data.dashboard_favorite_count_last_24h?.favorite_count ?? 0;
        case "7d":
        case undefined:
          return data.dashboard_favorite_count_last_7d?.favorite_count ?? 0;
        case "30d":
          return data.dashboard_favorite_count_last_30d?.favorite_count ?? 0;
        case "all":
          return data.dashboard_favorite_count_all?.favorite_count ?? 0;
        case "1h":
        case "4h":
          // Invalid time range for favorites
          return 0;
        default:
          assertUnreachable(entriesRequestFilters.time_range);
      }
    }

    return data.dashboard_favorite_count_all?.favorite_count ?? 0;
  }

  return {
    id: data.id,
    name: data.name,
    slug: data.slug,
    created_at: data.created_at,
    updated_at: data.updated_at,
    owner: parseOwner(data),
    tags: convertNull<string[]>(data.tags || []),
    num_favorites_in_period: favsInPeriod(),
    is_favorite: data.favorite_dashboards.length > 0,
    is_private: data.is_private,
    is_archived: Boolean(data.is_archived),
    trending_scores: {
      score_1h: data.trending_scores?.score_1h ?? 0,
      score_4h: data.trending_scores?.score_4h ?? 0,
      score_24h: data.trending_scores?.score_24h ?? 0,
    },
  };
};

const parseEntryDashboardWithVizWidgetsResponse = (
  data: ListDashboardsWithVisualizationWidgetsQuery["dashboards"][0]
): EntryDashboardWithVizWidgets => {
  return {
    id: data.id,
    name: data.name,
    slug: data.slug,
    created_at: data.created_at,
    updated_at: data.updated_at,
    owner: parseOwner(data),
    is_private: data.is_private,
    is_archived: Boolean(data.is_archived),
    visualization_widgets: removeNullable(data.visualization_widgets || []),
  };
};

const parseDashboardResponse = (
  data: FindDashboardQuery["dashboards"][0]
): FullDashboard => {
  function forkedDashboard() {
    if (!data.forked_dashboard) {
      return null;
    }
    const { team, user, name, slug } = data.forked_dashboard;

    return {
      owner_handle: team?.handle ?? user?.name ?? "",
      dashboard_name: name,
      dashboard_slug: slug,
    };
  }

  return {
    id: data.id,
    name: data.name,
    slug: data.slug,
    created_at: data.created_at,
    updated_at: data.updated_at,
    owner: parseOwner(data),
    forked_dashboard: forkedDashboard(),
    tags: convertNull<string[]>(data.tags || []),
    num_favorites_in_period:
      data.dashboard_favorite_count_all?.favorite_count ?? 0,
    is_favorite: data.favorite_dashboards.length > 0,
    is_private: data.is_private,
    is_archived: Boolean(data.is_archived),
    text_widgets: removeNullable(data.text_widgets || []),
    visualization_widgets: removeNullable(data.visualization_widgets || []),
    param_widgets: removeNullable(data.param_widgets || []),
    trending_scores: {
      score_1h: data.trending_scores?.score_1h ?? 0,
      score_4h: data.trending_scores?.score_4h ?? 0,
      score_24h: data.trending_scores?.score_24h ?? 0,
    },
  };
};

const parseQueryResponse = (
  data: FindQueryQuery["queries"][0] | ListQueriesQuery["queries"][0],
  entriesRequestFilters: Pick<EntriesRequestFilters, "time_range">
): EntryQuery => {
  const visuals = "visualizations" in data ? data.visualizations : [];
  const sortedVisuals = sortVisuals(visuals);
  const sortedParameters = sortParameters(data.parameters ?? []);
  function forkedQuery() {
    if (!data.forked_query) {
      return null;
    }
    const { team, user, name, id } = data.forked_query;

    return {
      owner_handle: team ? team.handle : user?.name ?? "",
      query_id: id,
      query_name: name as string,
    };
  }
  function favsInPeriod(): number {
    switch (entriesRequestFilters.time_range) {
      case "24h":
        return data.query_favorite_count_last_24h?.favorite_count ?? 0;
      case "7d":
      case undefined:
        return data.query_favorite_count_last_7d?.favorite_count ?? 0;
      case "30d":
        return data.query_favorite_count_last_30d?.favorite_count ?? 0;
      case "all":
        return data.query_favorite_count_all?.favorite_count ?? 0;
      case "1h":
      case "4h":
        // Invalid time range for favorites
        return 0;
      default:
        assertUnreachable(entriesRequestFilters.time_range);
    }
  }

  return {
    id: data.id,
    dataset_id: data.dataset_id,
    name: data.name || "",
    description: data.description || "",
    query: data.query,
    version: data.version,
    matview_id: data.matview_id ?? null,
    schedule: data.schedule,
    created_at: data.created_at,
    updated_at: data.updated_at,
    owner: parseOwner(data),
    tags: convertNull<string[]>(data.tags || []),
    num_favorites_in_period: favsInPeriod(),
    is_favorite: data.favorite_queries.length > 0,
    is_private: data.is_private,
    is_archived: Boolean(data.is_archived),
    is_temp: Boolean(data.is_temp),
    visualizations: sortedVisuals,
    parameters: sortedParameters,
    forked_query: forkedQuery(),
  };
};

export function parseOwner(data: {
  __typename?: string;
  id: string | number;
  team?: Maybe<Pick<Teams, "id" | "name" | "handle" | "profile_image_url">>;
  user?: Maybe<Pick<Users, "id" | "name" | "profile_image_url">>;
}): Owner {
  if (data.team) {
    return {
      type: "team",
      id: data.team.id,
      name: data.team.name,
      handle: data.team.handle,
      profile_image_url: data.team.profile_image_url ?? null,
    };
  }

  if (data.user) {
    return {
      type: "user",
      id: data.user.id,
      name: data.user.name,
      handle: data.user.name,
      profile_image_url: data.user.profile_image_url ?? null,
    };
  }

  throw Error(
    `data has neither team nor user. __typename={${data.__typename}}, id={${data.id}}.`
  );
}

export const entryIcon = (slug: EntrySlug | "people"): string => {
  switch (slug) {
    case "queries":
      return "terminal";
    case "dashboards":
      return "dashboard";
    case "people":
      return "people";
  }
};

export const entrySlug = (entry: Entry): EntrySlug => {
  if (isQuery(entry)) {
    return "queries";
  } else {
    return "dashboards";
  }
};

export const isDashboard = (x?: Entry): x is EntryDashboard => {
  return typeof x !== "undefined" && "slug" in x;
};

export const isQuery = (x?: Entry): x is EntryQuery => {
  return typeof x !== "undefined" && !("slug" in x);
};

export const isDashboardTrending = (d: EntryDashboard) => {
  return (
    (d.trending_scores?.score_1h ?? 0) >= 1 ||
    (d.trending_scores?.score_4h ?? 0) >= 2 ||
    (d.trending_scores?.score_24h ?? 0) >= 20
  );
};
