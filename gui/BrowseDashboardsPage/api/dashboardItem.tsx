import { gql } from "@apollo/client";
import { DashboardItemFragment } from "lib/types/graphql";

export const dashboardItemGqlFragment = gql`
  fragment DashboardItem on dashboards {
    id
    name
    slug
    created_at
    updated_at
    tags
    user {
      id
      name
      profile_image_url
    }
    team {
      id
      handle
      profile_image_url
    }
    is_private

    dashboard_favorite_count_all @include(if: $include_favs_all_time) {
      favorite_count
    }
    dashboard_favorite_count_last_24h @include(if: $include_favs_last_24h) {
      favorite_count
    }
    dashboard_favorite_count_last_7d @include(if: $include_favs_last_7d) {
      favorite_count
    }
    dashboard_favorite_count_last_30d @include(if: $include_favs_last_30d) {
      favorite_count
    }

    trending_scores {
      score_1h
      score_4h
      score_24h
      updated_at
    }
  }
`;

export type DashboardType = {
  id: number;
  name: string;
  slug: string;
  created_at: string;
  updated_at: string;
  tags: string[];
  owner: {
    type: "user" | "team";
    id: number;
    handle: string;
    profile_image_url?: string;
  };
  is_private: boolean;
  favoriteCount: number;
  isTrending: boolean;
};

/* Selector: Transform dashboard result fragment to more usable data structure */
export function toDashboardType(
  dashboard: DashboardItemFragment
): DashboardType {
  return {
    id: dashboard.id,
    name: dashboard.name ?? "",
    slug: dashboard.slug,
    created_at: dashboard.created_at,
    updated_at: dashboard.updated_at,
    tags: dashboard.tags ?? [],
    owner: dashboard.team
      ? {
          type: "team",
          id: dashboard.team.id,
          handle: dashboard.team.handle,
          profile_image_url: dashboard.team.profile_image_url ?? undefined,
        }
      : {
          type: "user",
          id: dashboard.user?.id ?? 0,
          handle: dashboard.user?.name ?? "",
          profile_image_url: dashboard.user?.profile_image_url ?? undefined,
        },
    is_private: dashboard.is_private,
    favoriteCount:
      dashboard.dashboard_favorite_count_all?.favorite_count ??
      dashboard.dashboard_favorite_count_last_24h?.favorite_count ??
      dashboard.dashboard_favorite_count_last_7d?.favorite_count ??
      dashboard.dashboard_favorite_count_last_30d?.favorite_count ??
      0,
    isTrending:
      (dashboard.trending_scores?.score_1h ?? 0) >= 1 ||
      (dashboard.trending_scores?.score_4h ?? 0) >= 2 ||
      (dashboard.trending_scores?.score_24h ?? 0) >= 20,
  };
}
