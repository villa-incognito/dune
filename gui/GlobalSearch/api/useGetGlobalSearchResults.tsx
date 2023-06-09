import { gql } from "@apollo/client";
import { useGetGlobalSearchResultsQuery } from "lib/types/graphql";
import "./cache/populateCachedResults";

export default function useGetGlobalSearchResults(searchString: string) {
  return useGetGlobalSearchResultsQuery({
    variables: {
      query: { _ilike: `%${searchString}%` },
    },
    fetchPolicy: searchString === "" ? "cache-only" : "cache-first",
  });
}

gql`
  query GetGlobalSearchResults($query: String_comparison_exp!) {
    dashboard_favorite_count_all(
      where: { dashboard: { name: $query, is_archived: { _eq: false } } }
      order_by: [{ favorite_count: desc_nulls_last }, { dashboard_id: asc }]
      limit: 3
    ) {
      dashboard {
        id
        name
        slug
        user {
          id
          name
          profile_image_url
        }
        team {
          id
          name
          handle
          profile_image_url
        }
      }
    }

    query_favorite_count_all(
      where: {
        query: {
          name: $query
          is_archived: { _eq: false }
          is_temp: { _eq: false }
        }
      }
      order_by: [{ favorite_count: desc_nulls_last }, { query_id: asc }]
      limit: 3
    ) {
      query {
        id
        name

        user {
          id
          name
          profile_image_url
        }

        team {
          id
          handle
          name
          profile_image_url
        }
      }
    }

    user_received_stars(
      where: { user: { name: $query } }
      order_by: [{ sum: desc_nulls_last }, { id: asc }]
      limit: 3
    ) {
      user {
        id
        name
        profile_image_url
      }
    }

    teams(
      where: { _or: [{ handle: $query }, { name: $query }] }
      order_by: [{ id: asc }]
      limit: 3
    ) {
      id
      handle
      name
      profile_image_url
    }
  }
`;
