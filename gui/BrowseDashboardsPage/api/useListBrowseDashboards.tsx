import { deletedUsername } from "lib/users/users";
import { QueryResult } from "@apollo/client";
import { logger } from "lib/logger/browser";

import {
  ApiParams,
  getListBrowseDashboardsVariables,
} from "./listBrowseDashboards";

import {
  useListBrowseDashboardsQuery,
  ListBrowseDashboardsQuery,
} from "lib/types/graphql";

export type HookResult = QueryResult<ListBrowseDashboardsQuery>;

export default function useListBrowseDashboards(
  apiParams: ApiParams
): HookResult {
  const { owner } = apiParams.filter;
  if (owner && owner.type === "user" && owner.handle === deletedUsername) {
    delete apiParams.filter.owner;
  }

  return useListBrowseDashboardsQuery({
    variables: getListBrowseDashboardsVariables(apiParams),
    fetchPolicy: "cache-first",
    onError: logger.error,
  });
}
