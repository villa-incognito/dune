import { apolloCore } from "lib/apollo/apollo";
import runOnce from "lib/runOnce";
import fetchServerTimeUnixMs from "lib/now/fetchServerTimeUnixMs";

import {
  ApiParams,
  getListBrowseDashboardsVariables,
} from "./listBrowseDashboards";

import {
  ListBrowseDashboardsDocument,
  ListBrowseDashboardsQuery,
  ListBrowseDashboardsQueryVariables,
} from "lib/types/graphql";

export interface ListBrowseDashboardsCacheDataItem {
  variables: ListBrowseDashboardsQueryVariables;
  data: ListBrowseDashboardsQuery;
}

export async function getListBrowseDashboardsToPopulateCache(
  apiParams: ApiParams
): Promise<ListBrowseDashboardsCacheDataItem> {
  const variables = getListBrowseDashboardsVariables(apiParams);

  const { data } = await apolloCore.query<
    ListBrowseDashboardsQuery,
    ListBrowseDashboardsQueryVariables
  >({
    query: ListBrowseDashboardsDocument,
    variables,
  });

  return {
    variables,
    data,
  };
}

export function populateListBrowseDashboardsCache(
  cacheData: ListBrowseDashboardsCacheDataItem[]
) {
  cacheData.forEach(({ variables, data }) => {
    apolloCore.writeQuery({
      query: ListBrowseDashboardsDocument,
      variables,
      data,
    });
  });
}

export function evictListBrowseDashboardsCache(
  cacheData: ListBrowseDashboardsCacheDataItem[]
) {
  apolloCore.cache.evict({ id: "ROOT_QUERY", fieldName: "dashboards" });
  apolloCore.cache.evict({
    id: "ROOT_QUERY",
    fieldName: "dashboards_aggregate",
  });
  apolloCore.cache.gc();
}

export function usePopulateListBrowseDashboardsCache(
  cacheData: ListBrowseDashboardsCacheDataItem[],
  { expiresAt }: { expiresAt: number }
) {
  runOnce("usePopulateListBrowseDashboardsCache", () => {
    populateListBrowseDashboardsCache(cacheData);

    fetchServerTimeUnixMs().then((now: number) => {
      if (now > expiresAt) {
        evictListBrowseDashboardsCache(cacheData);
      }
    });
  });
}
