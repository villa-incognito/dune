import { User } from "lib/users/graphql";
import { gql } from "@apollo/client";
import { Visualization } from "lib/visuals/graphql";

const Team = gql`
  fragment Team on teams {
    id
    name
    handle
    profile_image_url
  }
`;

const EntryDashboard = gql`
  fragment EntryDashboard on dashboards {
    id
    name
    slug
    is_private
    is_archived
    created_at
    updated_at
    tags
    user {
      ...User
    }
    team {
      ...Team
    }

    dashboard_favorite_count_all @include(if: $favs_all_time) {
      favorite_count
    }
    dashboard_favorite_count_last_24h @include(if: $favs_last_24h) {
      favorite_count
    }
    dashboard_favorite_count_last_7d @include(if: $favs_last_7d) {
      favorite_count
    }
    dashboard_favorite_count_last_30d @include(if: $favs_last_30d) {
      favorite_count
    }

    trending_scores {
      score_1h
      score_4h
      score_24h
      updated_at
    }
  }
  ${User}
  ${Team}
`;

const EntryDashboardWithVizWidgets = gql`
  fragment EntryDashboardWithVizWidgets on dashboards {
    id
    name
    slug
    is_private
    is_archived
    created_at
    updated_at
    user {
      ...User
    }
    team {
      ...Team
    }
    visualization_widgets {
      id
      visualization {
        ...Visualization
      }
    }
  }
  ${User}
  ${Team}
  ${Visualization}
`;

const Dashboard = gql`
  fragment Dashboard on dashboards {
    id
    name
    slug
    is_private
    is_archived
    created_at
    updated_at
    tags
    user {
      ...User
    }
    team {
      ...Team
    }
    forked_dashboard {
      slug
      name
      user {
        name
      }
      team {
        handle
      }
    }
    text_widgets {
      id
      created_at
      updated_at
      text
      options
    }
    visualization_widgets {
      id
      created_at
      updated_at
      options
      visualization {
        ...Visualization
      }
    }
    param_widgets {
      id
      key
      visualization_widget_id
      query_id
      dashboard_id
      options
      created_at
      updated_at
    }
    dashboard_favorite_count_all {
      favorite_count
    }

    trending_scores {
      score_1h
      score_4h
      score_24h
      updated_at
    }
  }
  ${User}
  ${Team}
  ${Visualization}
`;

const QueryFavorites = gql`
  fragment QueryFavorites on queries {
    query_favorite_count_all @include(if: $favs_all_time) {
      favorite_count
    }
    query_favorite_count_last_24h @include(if: $favs_last_24h) {
      favorite_count
    }
    query_favorite_count_last_7d @include(if: $favs_last_7d) {
      favorite_count
    }
    query_favorite_count_last_30d @include(if: $favs_last_30d) {
      favorite_count
    }
  }
`;

const QueryUsers = gql`
  fragment QueryUsers on queries {
    user {
      ...User
    }
    team {
      id
      name
      handle
      profile_image_url
    }
  }
  ${User}
`;

const QueryTeams = gql`
  fragment QueryTeams on queries {
    team {
      ...Team
    }
  }
  ${Team}
`;

const QueryVisualizations = gql`
  fragment QueryVisualizations on queries {
    visualizations {
      id
      type
      name
      options
      created_at
    }
  }
`;

const QueryForked = gql`
  fragment QueryForked on queries {
    forked_query {
      id
      name
      user {
        name
      }
      team {
        handle
      }
    }
  }
`;

const BaseQuery = gql`
  fragment BaseQuery on queries {
    id
    dataset_id
    name
    description
    query
    version
    matview_id
    is_private
    is_temp
    is_archived
    created_at
    updated_at
    schedule
    tags
    parameters
  }
`;

export const Query = gql`
  fragment Query on queries {
    ...BaseQuery
    ...QueryVisualizations
    ...QueryForked
    ...QueryUsers
    ...QueryTeams
    ...QueryFavorites
  }
  ${BaseQuery}
  ${QueryVisualizations}
  ${QueryForked}
  ${QueryUsers}
  ${QueryTeams}
  ${QueryFavorites}
`;

const ParametrizedQuery = gql`
  fragment ParametrizedQuery on queries {
    ...BaseQuery
    ...QueryVisualizations @skip(if: $exclude_visualizations)
    ...QueryForked @skip(if: $exclude_forks)
    ...QueryUsers @skip(if: $exclude_users)
    ...QueryTeams @skip(if: $exclude_teams)
    ...QueryFavorites @skip(if: $exclude_favorites)
  }
  ${BaseQuery}
  ${QueryVisualizations}
  ${QueryForked}
  ${QueryUsers}
  ${QueryTeams}
  ${QueryFavorites}
`;

export const findDashboard = gql`
  query FindDashboard(
    $session_filter: Int_comparison_exp!
    $user: String!
    $slug: String!
  ) {
    dashboards(
      where: {
        slug: { _eq: $slug }
        _or: [
          { user: { name: { _eq: $user } } }
          { team: { handle: { _eq: $user } } }
        ]
      }
    ) {
      ...Dashboard
      favorite_dashboards(where: { user_id: $session_filter }, limit: 1) {
        created_at
      }
    }
  }
  ${Dashboard}
`;

gql`
  query FindDashboardMetadata($owner_handle: String!, $slug: String!) {
    dashboards(
      where: {
        slug: { _eq: $slug }
        _or: [
          { user: { name: { _eq: $owner_handle } } }
          { team: { handle: { _eq: $owner_handle } } }
        ]
      }
    ) {
      name
    }
  }
`;

gql`
  query FindQueryMetadata($id: Int!) {
    queries_by_pk(id: $id) {
      name
      description
    }
  }
`;

export const findQuery = gql`
  query FindQuery(
    $session_filter: Int_comparison_exp!
    $id: Int!
    $favs_last_24h: Boolean! = false
    $favs_last_7d: Boolean! = false
    $favs_last_30d: Boolean! = false
    $favs_all_time: Boolean! = true
  ) {
    queries(where: { id: { _eq: $id } }) {
      ...Query
      favorite_queries(where: { user_id: $session_filter }, limit: 1) {
        created_at
      }
    }
  }
  ${Query}
`;

export const listDashboards = gql`
  query ListDashboards(
    $session_filter: Int_comparison_exp!
    $filter_custom: [dashboards_bool_exp!]!
    $tags: jsonb_comparison_exp!
    $query: String_comparison_exp!
    $limit: Int!
    $offset: Int!
    $order: [dashboards_order_by!]
    $favs_last_24h: Boolean! = false
    $favs_last_7d: Boolean! = false
    $favs_last_30d: Boolean! = false
    $favs_all_time: Boolean! = false
  ) {
    dashboards(
      where: {
        is_archived: { _eq: false }
        tags: $tags
        name: $query
        _and: $filter_custom
      }
      limit: $limit
      offset: $offset
      order_by: $order
    ) {
      ...EntryDashboard
      favorite_dashboards(where: { user_id: $session_filter }, limit: 1) {
        created_at
      }
    }
    dashboards_aggregate(
      where: {
        is_archived: { _eq: false }
        tags: $tags
        name: $query
        _and: $filter_custom
      }
    ) {
      aggregate {
        count
      }
    }
  }
  ${EntryDashboard}
`;

gql`
  query ListDashboardsWithVisualizationWidgets(
    $author_name: String!
    $query: String_comparison_exp!
  ) {
    dashboards(
      where: {
        _or: [
          { user: { name: { _eq: $author_name } } }
          { team: { memberships: { user: { name: { _eq: $author_name } } } } }
        ]
        is_archived: { _eq: false }
        name: $query
      }
    ) {
      ...EntryDashboardWithVizWidgets
    }
  }
  ${EntryDashboardWithVizWidgets}
`;

export const listFavoriteDashboards = gql`
  query ListFavoriteDashboards(
    $session_id: Int!
    $query: String_comparison_exp!
    $limit: Int!
    $offset: Int!
    $order: [dashboards_order_by!]
    $favs_last_24h: Boolean! = false
    $favs_last_7d: Boolean! = false
    $favs_last_30d: Boolean! = false
    $favs_all_time: Boolean! = false
  ) {
    dashboards(
      where: {
        favorite_dashboards: { user_id: { _eq: $session_id } }
        is_archived: { _eq: false }
        name: $query
      }
      limit: $limit
      offset: $offset
      order_by: $order
    ) {
      ...EntryDashboard
      favorite_dashboards(where: { user_id: { _eq: $session_id } }, limit: 1) {
        created_at
      }
    }
    dashboards_aggregate(
      where: {
        favorite_dashboards: { user_id: { _eq: $session_id } }
        is_archived: { _eq: false }
        name: $query
      }
    ) {
      aggregate {
        count
      }
    }
  }
  ${EntryDashboard}
`;

export const listQueries = gql`
  query ListQueries(
    $session_filter: Int_comparison_exp!
    $filter_custom: [queries_bool_exp!]!
    $tags: jsonb_comparison_exp!
    $query: String_comparison_exp!
    $is_archived: Boolean!
    $limit: Int!
    $offset: Int!
    $order: [queries_order_by!]
    $favs_last_24h: Boolean! = false
    $favs_last_7d: Boolean! = false
    $favs_last_30d: Boolean! = false
    $favs_all_time: Boolean! = false
    $exclude_favorites: Boolean! = false
    $exclude_forks: Boolean! = false
    $exclude_users: Boolean! = false
    $exclude_teams: Boolean! = false
    $exclude_visualizations: Boolean! = false
  ) {
    queries(
      where: {
        is_archived: { _eq: $is_archived }
        is_temp: { _eq: false }
        tags: $tags
        name: $query
        _and: $filter_custom
      }
      limit: $limit
      offset: $offset
      order_by: $order
    ) {
      ...ParametrizedQuery
      favorite_queries(where: { user_id: $session_filter }, limit: 1) {
        created_at
      }
    }
    queries_aggregate(
      where: {
        is_archived: { _eq: $is_archived }
        is_temp: { _eq: false }
        tags: $tags
        name: $query
        _and: $filter_custom
      }
    ) {
      aggregate {
        count
      }
    }
  }
  ${ParametrizedQuery}
`;

export const listFavoriteQueries = gql`
  query ListFavoriteQueries(
    $session_id: Int!
    $query: String_comparison_exp!
    $limit: Int!
    $offset: Int!
    $order: [queries_order_by!]
    $favs_last_24h: Boolean! = false
    $favs_last_7d: Boolean! = false
    $favs_last_30d: Boolean! = false
    $favs_all_time: Boolean! = false
    $exclude_favorites: Boolean! = false
    $exclude_forks: Boolean! = false
    $exclude_users: Boolean! = false
    $exclude_teams: Boolean! = false
    $exclude_visualizations: Boolean! = false
  ) {
    queries(
      where: {
        favorite_queries: { user_id: { _eq: $session_id } }
        is_archived: { _eq: false }
        is_temp: { _eq: false }
        name: $query
      }
      limit: $limit
      offset: $offset
      order_by: $order
    ) {
      ...ParametrizedQuery
      favorite_queries(where: { user_id: { _eq: $session_id } }, limit: 1) {
        created_at
      }
    }
    queries_aggregate(
      where: {
        favorite_queries: { user_id: { _eq: $session_id } }
        is_archived: { _eq: false }
        is_temp: { _eq: false }
        name: $query
      }
    ) {
      aggregate {
        count
      }
    }
  }
  ${ParametrizedQuery}
`;

export const listUsers = gql`
  query ListUsers($query: String_comparison_exp!, $limit: Int!, $offset: Int!) {
    user_received_stars(
      where: { user: { name: $query } }
      order_by: [{ sum: desc_nulls_last }, { user: { id: asc } }]
      limit: $limit
      offset: $offset
    ) {
      sum

      user {
        id
        name
        profile_image_url
        created_at

        queries(order_by: { created_at: asc_nulls_last }, limit: 1) {
          created_at
        }
      }
    }

    user_received_stars_aggregate(where: { user: { name: $query } }) {
      aggregate {
        count
      }
    }
  }
`;

export const insertFavoriteDashboard = gql`
  mutation InsertFavoriteDashboard($session_id: Int!, $dashboard_id: Int!) {
    insert_favorite_dashboards_one(
      object: { user_id: $session_id, dashboard_id: $dashboard_id }
    ) {
      id
    }
  }
`;

export const insertFavoriteQuery = gql`
  mutation InsertFavoriteQuery($session_id: Int!, $query_id: Int!) {
    insert_favorite_queries_one(
      object: { user_id: $session_id, query_id: $query_id }
    ) {
      id
    }
  }
`;

export const deleteFavoriteDashboard = gql`
  mutation DeleteFavoriteDashboard($session_id: Int!, $dashboard_id: Int!) {
    delete_favorite_dashboards(
      where: {
        user_id: { _eq: $session_id }
        dashboard_id: { _eq: $dashboard_id }
      }
    ) {
      affected_rows
    }
  }
`;

export const deleteFavoriteQuery = gql`
  mutation DeleteFavoriteQuery($session_id: Int!, $query_id: Int!) {
    delete_favorite_queries(
      where: { user_id: { _eq: $session_id }, query_id: { _eq: $query_id } }
    ) {
      affected_rows
    }
  }
`;
