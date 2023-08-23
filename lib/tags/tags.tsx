import { assertUnreachable } from "src/utils/assertUnreachable";
import { EntrySlug } from "lib/entries/types";
import { Nullable, removeNullable } from "lib/types/types";
import {
  ListPopularDashboardTagsDocument,
  ListPopularDashboardTagsQuery,
  ListPopularDashboardTagsQueryVariables,
  ListPopularQueryTagsDocument,
  ListPopularQueryTagsQuery,
  ListPopularQueryTagsQueryVariables,
  PopularDashboardTagFragment,
} from "lib/types/graphql";
import { PopularQueryTagFragment } from "lib/types/graphql";
import { Session } from "lib/users/types";
import { Tag } from "lib/tags/types";
import { apolloCore } from "lib/apollo/apollo";

export const fetchTags = async (
  slug: EntrySlug,
  limit: number,
  offset: number
): Promise<Tag[]> => {
  const res = await callGetPopularEntryTags(slug, limit, offset);

  return removeNullable(res) ?? [];
};

const callGetPopularEntryTags = (
  slug: EntrySlug,
  limit: number,
  offset: number
) => {
  switch (slug) {
    case "queries":
      return callGetPopularQueryTags(limit, offset);
    case "dashboards":
      return callGetPopularDashboardTags(limit, offset);
    default:
      assertUnreachable(slug);
  }
};

// Fetch popular dashboard tags from the backend.
const callGetPopularDashboardTags = async (
  limit: number,
  offset: number,
  session?: Session,
  apiKey?: string
): Promise<PopularDashboardTagFragment[]> => {
  const res = await apolloCore.query<
    ListPopularDashboardTagsQuery,
    ListPopularDashboardTagsQueryVariables
  >({
    query: ListPopularDashboardTagsDocument,
    variables: { limit, offset },
    context: { session, apiKey },
    fetchPolicy: "no-cache",
  });

  return res.data.popular_dashboard_tags;
};

// Fetch popular queries tags from the backend.
const callGetPopularQueryTags = async (
  limit: number,
  offset: number,
  session?: Session,
  apiKey?: string
): Promise<PopularQueryTagFragment[]> => {
  const res = await apolloCore.query<
    ListPopularQueryTagsQuery,
    ListPopularQueryTagsQueryVariables
  >({
    query: ListPopularQueryTagsDocument,
    variables: { limit, offset },
    context: { session, apiKey },
    fetchPolicy: "no-cache",
  });

  return res.data.popular_query_tags;
};

export const formatTagsList = (tags: Nullable<string[]>): string => {
  return parseTagsList(tags?.join(", ") ?? "").join(", ");
};

export const parseTagsList = (input: string): string[] => {
  return input
    .trim()
    .split(",")
    .map((t) => t.trim().replace(/[ ]+/g, " "))
    .filter(Boolean);
};
