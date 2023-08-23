import { EntryUser } from "lib/entries/types";
import { EntryFilter } from "lib/entries/types";
import { EntryPage } from "lib/entries/types";
import { EntriesRequestFilters } from "lib/entries/types";
import { EntrySlug } from "lib/entries/types";
import { FullDashboard } from "lib/entries/types";
import { Session } from "lib/users/types";
import { fetchAuthoredDashboardsWithVisualizationWidgets } from "lib/entries/entries";
import { fetchAuthoredQueries } from "lib/entries/entries";
import { fetchDashboard } from "lib/entries/entries";
import { fetchDashboards } from "lib/entries/entries";
import { fetchFavoriteDashboards } from "lib/entries/entries";
import { fetchFavoriteQueries } from "lib/entries/entries";
import { fetchUsers } from "lib/entries/entries";
import { fetchQueries } from "lib/entries/entries";
import { fetchQuery } from "lib/entries/entries";
import { fetchRelatedDashboards } from "lib/entries/entries";
import { useTokenFetch } from "src/hooks/useTokenFetch";

export const useEntryQuery = (query?: number, apiKey?: string) => {
  return useTokenFetch(
    ["useEntryQuery", query, apiKey],
    async (_csrf: string, session?: Session) => {
      if (typeof query === "number") {
        return fetchQuery(query, session, apiKey);
      }
    }
  );
};

export const useFullDashboard = (
  user?: string,
  slug?: string,
  apiKey?: string
) => {
  return useTokenFetch(
    ["useFullDashboard", user, slug, apiKey],
    async (_csrf: string, session?: Session) => {
      if (typeof user === "string" && typeof slug === "string") {
        return fetchDashboard(user, slug, session, apiKey);
      }
    }
  );
};

export const useRelatedDashboards = (dashboard: FullDashboard) => {
  return useTokenFetch(
    ["useRelatedDashboards", dashboard.slug],
    async (_csrf: string, session?: Session) => {
      return fetchRelatedDashboards(dashboard, session);
    }
  );
};

export const useUsers = (entriesRequestFilters: EntriesRequestFilters) => {
  return useTokenFetch<EntryPage<EntryUser>>(
    [JSON.stringify(entriesRequestFilters)],
    (_csrf: string, session?: Session) => {
      return fetchUsers(entriesRequestFilters, session);
    }
  );
};

export const useEntries = (
  slug: EntrySlug,
  entriesRequestFilters: EntriesRequestFilters,
  filter?: EntryFilter
) => {
  return useTokenFetch(
    [slug, filter, JSON.stringify(entriesRequestFilters)],
    async (_csrf: string, session?: Session) => {
      switch (filter) {
        case "authored":
          switch (slug) {
            case "queries":
              return fetchAuthoredQueries(entriesRequestFilters, session);
            case "dashboards":
              return fetchAuthoredDashboardsWithVisualizationWidgets(
                entriesRequestFilters,
                session
              );
          }
          break;

        case "favorite":
          switch (slug) {
            case "queries":
              return fetchFavoriteQueries(entriesRequestFilters, session);
            case "dashboards":
              return fetchFavoriteDashboards(entriesRequestFilters, session);
          }
          break;

        default:
          switch (slug) {
            case "queries":
              return fetchQueries(entriesRequestFilters, session);
            case "dashboards":
              return fetchDashboards(entriesRequestFilters, session);
          }
      }
    }
  );
};
