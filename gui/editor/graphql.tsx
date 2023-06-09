import {
  CancelExecutionMutation,
  ContextOwner,
  CreateQueryDocument,
  CreateQueryMutation,
  CreateQueryMutationVariables,
  UpdateQueryDocument,
  UpdateQueryMutation,
  UpdateQueryMutationVariables,
} from "lib/types/graphql";
import { CancelExecutionMutationVariables } from "lib/types/graphql";
import { DeleteVisualizationMutation } from "lib/types/graphql";
import { DeleteVisualizationMutationVariables } from "lib/types/graphql";
import { EditorQuery } from "gui/editor/state";
import { EditVisualMutation } from "lib/types/graphql";
import { EditVisualMutationVariables } from "lib/types/graphql";
import { ExportCsvQuery } from "lib/types/graphql";
import { ExportCsvQueryVariables } from "lib/types/graphql";
import { ForkQueryV1Mutation } from "lib/types/graphql";
import { ForkQueryV1MutationVariables } from "lib/types/graphql";
import { InsertVisualMutation } from "lib/types/graphql";
import { InsertVisualMutationVariables } from "lib/types/graphql";
import { NoId } from "lib/types/types";
import { Parameter } from "lib/parameters/types";
import { PartialId } from "lib/types/types";
import { Queries_Constraint } from "lib/types/graphql";
import { Queries_Update_Column } from "lib/types/graphql";
import { Query } from "lib/entries/graphql";
import { QueryVisual } from "lib/visuals/types";
import { Session } from "lib/users/types";
import { TransferQueriesDocument } from "lib/types/graphql";
import { TransferQueriesMutation } from "lib/types/graphql";
import { TransferQueriesMutationVariables } from "lib/types/graphql";
import { UpdateQueryCodeMutation } from "lib/types/graphql";
import { UpdateQueryCodeMutationVariables } from "lib/types/graphql";
import { UpsertQueryMutation } from "lib/types/graphql";
import { UpsertQueryMutationVariables } from "lib/types/graphql";
import { Visualization } from "lib/visuals/graphql";
import { Visualizations_Constraint } from "lib/types/graphql";
import { Visualizations_Update_Column } from "lib/types/graphql";
import { apolloCore } from "lib/apollo/apollo";
import { createQueryResultsVisual } from "gui/editor/visuals-new";
import { gql } from "@apollo/client";
import { EntryNew, EntryQuery } from "lib/entries/types";
import { GraphQLError } from "graphql";

export const callUpsertQuery = async (query: EditorQuery, session: Session) => {
  // New queries are always created with is_temp set to true.
  const is_temp = "id" in query ? query.is_temp : true;

  // Make sure we have a valid query id before proceeding.
  if ("id" in query && typeof query.id !== "number") {
    throw new Error(`invalid query id: ${query.id}`);
  }

  // Create the default query results table
  // when the query is saved for the first time.
  const visuals: PartialId<QueryVisual>[] = [...(query.visualizations ?? [])];
  if (visuals.length === 0) {
    visuals.push(createQueryResultsVisual());
  }

  const variables = {
    object: {
      id: "id" in query ? query.id : undefined,
      schedule: query.schedule || null,
      dataset_id: query.dataset_id,
      name: query.name,
      query: query.query,
      user_id: query.owner.type === "user" ? query.owner.id : null,
      team_id: query.owner.type === "team" ? query.owner.id : null,
      description: query.description,
      is_archived: query.is_archived,
      is_temp,
      is_private: query.is_private,
      tags: query.tags,
      parameters: query.parameters,
      visualizations: {
        data: visuals.map((v) => ({
          id: v.id,
          type: v.type,
          name: v.name,
          options: v.options ?? {},
        })),
        on_conflict: {
          constraint: Visualizations_Constraint.VisualizationsPkey,
          update_columns: [
            Visualizations_Update_Column.Name,
            Visualizations_Update_Column.Options,
          ],
        },
      },
    },
    on_conflict: {
      constraint: Queries_Constraint.QueriesPkey,
      update_columns: [
        Queries_Update_Column.DatasetId,
        Queries_Update_Column.Name,
        Queries_Update_Column.Description,
        Queries_Update_Column.Query,
        Queries_Update_Column.Schedule,
        Queries_Update_Column.IsArchived,
        Queries_Update_Column.IsTemp,
        Queries_Update_Column.IsPrivate,
        Queries_Update_Column.Tags,
        Queries_Update_Column.Parameters,
      ],
    },
  };

  const res = await apolloCore.mutate<
    UpsertQueryMutation,
    UpsertQueryMutationVariables
  >({
    mutation: upsertQuery,
    variables: { ...variables, session_id: session.user!.id! },
    context: { session },
    fetchPolicy: "no-cache",
  });

  if (!res.data?.insert_queries_one?.id) {
    throw new Error("Query creation failed");
  }

  return res.data.insert_queries_one.id;
};

export async function callUpsertQuery2(query: EditorQuery, session: Session) {
  if (!("id" in query)) {
    return await callCreateQuery(query, session);
  } else {
    return await callUpdateQuery(query, session);
  }
}

async function callCreateQuery(query: EntryNew<EntryQuery>, session: Session) {
  const variables = {
    query: {
      name: query.name,
      description: query.description,
      is_temp: true,
      is_private: query.is_private,
      dataset_id: query.dataset_id,
      query: query.query,
      parameters: query.parameters,
      user_id: query.owner.type === "user" ? query.owner.id : null,
      team_id: query.owner.type === "team" ? query.owner.id : null,
    },
  };

  const result = await apolloCore.mutate<
    CreateQueryMutation,
    CreateQueryMutationVariables
  >({
    mutation: CreateQueryDocument,
    variables,
    context: { session },
    fetchPolicy: "no-cache",
  });

  if (!result.data?.create_query.query_id) {
    throw new Error("Query creation failed");
  }

  return result.data.create_query.query_id;
}

async function callUpdateQuery(query: EntryQuery, session: Session) {
  const variables = {
    query: {
      id: query.id,
      name: query.name,
      description: query.description,
      is_temp: query.is_temp,
      is_private: query.is_private,
      is_archived: query.is_archived,
      dataset_id: query.dataset_id,
      query: query.query,
      parameters: query.parameters,
      tags: query.tags,
      version: query.version,
      schedule: query.schedule,
      user_id: query.owner.type === "user" ? query.owner.id : null,
      team_id: query.owner.type === "team" ? query.owner.id : null,
    },
  };

  const result = await apolloCore.mutate<
    UpdateQueryMutation,
    UpdateQueryMutationVariables
  >({
    mutation: UpdateQueryDocument,
    variables,
    context: { session },
    fetchPolicy: "no-cache",
  });

  if (!result.data?.update_query.query_id) {
    throw new Error("Query update failed");
  }

  return result.data.update_query.query_id;
}

type CustomGraphQLError<T> = Omit<GraphQLError, "extensions"> & {
  extensions: T;
};

export type QueryHasChangedError = {
  key: "query_has_changed";
  queryEvent: {
    id: string;
    queryVersion: number;
    user: {
      id: number;
      name: string;
    };
  };
};

export const isQueryHasChangedError = (
  error: GraphQLError | undefined
): error is CustomGraphQLError<QueryHasChangedError> =>
  error?.extensions?.key === "query_has_changed";

export const callEditVisualisation = async (
  id: number,
  visual: NoId<QueryVisual>,
  session: Session
) => {
  return await apolloCore.mutate<
    EditVisualMutation,
    EditVisualMutationVariables
  >({
    mutation: editVisual,
    variables: {
      id,
      type: visual.type,
      options: visual.options,
      name: visual.name,
    },
    context: { session },
    fetchPolicy: "no-cache",
  });
};

export const callInsertVisualisation = async (
  queryId: number,
  visual: Omit<QueryVisual, "id" | "created_at" | "query_details">,
  session: Session
) => {
  return await apolloCore.mutate<
    InsertVisualMutation,
    InsertVisualMutationVariables
  >({
    mutation: insertVisual,
    variables: {
      visual: {
        query_id: queryId,
        name: visual.name,
        type: visual.type,
        options: visual.options,
      },
    },
    context: { session },
    fetchPolicy: "no-cache",
  });
};

export const callCancelExecution = async (
  executionId: string,
  queryId: number,
  parameters: Parameter[],
  session: Session
) => {
  return await apolloCore.mutate<
    CancelExecutionMutation,
    CancelExecutionMutationVariables
  >({
    mutation: cancelExecution,
    variables: {
      execution_id: executionId,
      query_id: queryId,
      parameters: parameters,
    },
    context: { session },
    fetchPolicy: "no-cache",
  });
};

/*
 * This mutation creates the temporary query under the logged in user,
 * and does not create a query event for Version history.
 *
 * Only used when the user runs a subset of the code of a query, by
 * selecting some of the code and clicking "Run selection".
 *
 * When clicking the Fork button to create a fork of an existing query,
 * we use another mutation.
 */
export const callForkQueryV1 = async (query: number, session: Session) => {
  return await apolloCore.mutate<
    ForkQueryV1Mutation,
    ForkQueryV1MutationVariables
  >({
    mutation: forkQuery,
    variables: { session_id: session.user!.id, query_id: query },
    context: { session },
    fetchPolicy: "no-cache",
  });
};

export const callUpdateQueryCode = async (
  query: number,
  code: string,
  session: Session
) => {
  return await apolloCore.mutate<
    UpdateQueryCodeMutation,
    UpdateQueryCodeMutationVariables
  >({
    mutation: updateQueryCode,
    variables: { query_id: query, code },
    context: { session },
    fetchPolicy: "no-cache",
  });
};

export const callDeleteVisualization = async (
  visual: number,
  session?: Session
) => {
  return await apolloCore.mutate<
    DeleteVisualizationMutation,
    DeleteVisualizationMutationVariables
  >({
    mutation: deleteVisualization,
    variables: { visual_id: visual },
    context: { session },
    fetchPolicy: "no-cache",
  });
};

interface ExportCSVProps {
  executionId: string;
  queryId: number;
  parameters: Parameter[];
  downloadFor: ContextOwner;
  session: Session;
}

export const callExportCsv = async (props: ExportCSVProps) => {
  return await apolloCore.mutate<ExportCsvQuery, ExportCsvQueryVariables>({
    mutation: exportCsv,
    variables: {
      execution_id: props.executionId,
      query_id: props.queryId,
      parameters: props.parameters,
      downloadFor: props.downloadFor,
    },
    context: { session: props.session },
    fetchPolicy: "no-cache",
  });
};

export const callTransferQueries = async (
  queryIds: number[],
  owner: { type: "team" | "user"; id: number },
  session: Session
) => {
  const res = await apolloCore.mutate<
    TransferQueriesMutation,
    TransferQueriesMutationVariables
  >({
    mutation: TransferQueriesDocument,
    variables: {
      query_ids: queryIds,
      team_id: owner.type === "team" ? owner.id : null,
      user_id: owner.type === "user" ? owner.id : null,
    },
    context: { session },
  });

  if (res.errors && res.errors.length > 0) {
    throw new Error("Could not transfer query: " + res.errors[0].message);
  }
};

const insertVisual = gql`
  mutation InsertVisual($visual: visualizations_insert_input!) {
    insert_visualizations_one(object: $visual) {
      ...Visualization
    }
  }
  ${Visualization}
`;

const upsertQuery = gql`
  mutation UpsertQuery(
    $session_id: Int!
    $object: queries_insert_input!
    $on_conflict: queries_on_conflict!
    $favs_last_24h: Boolean! = false
    $favs_last_7d: Boolean! = false
    $favs_last_30d: Boolean! = false
    $favs_all_time: Boolean! = true
  ) {
    insert_queries_one(object: $object, on_conflict: $on_conflict) {
      ...Query
      favorite_queries(where: { user_id: { _eq: $session_id } }, limit: 1) {
        created_at
      }
    }
  }
  ${Query}
`;

gql`
  mutation CreateQuery($query: CreateQueryInput!) {
    create_query(query: $query) {
      query_id
    }
  }
`;

gql`
  mutation UpdateQuery($query: UpdateQueryInput!) {
    update_query(query: $query) {
      query_id
    }
  }
`;

const editVisual = gql`
  mutation EditVisual(
    $id: Int!
    $options: jsonb!
    $name: String!
    $type: visualization_types!
  ) {
    update_visualizations_by_pk(
      pk_columns: { id: $id }
      _set: { options: $options, name: $name, type: $type }
    ) {
      id
      type
      name
      options
      created_at
    }
  }
`;

const cancelExecution = gql`
  mutation CancelExecution(
    $execution_id: String!
    $query_id: Int!
    $parameters: [Parameter!]!
  ) {
    cancel_execution(
      execution_id: $execution_id
      query_id: $query_id
      parameters: $parameters
    ) {
      execution_id
    }
  }
`;

const forkQuery = gql`
  mutation ForkQueryV1($session_id: Int!, $query_id: Int!) {
    fork_query(user_id: $session_id, query_id: $query_id) {
      query_id
    }
  }
`;

const updateQueryCode = gql`
  mutation UpdateQueryCode($query_id: Int!, $code: String!) {
    update_queries_by_pk(
      pk_columns: { id: $query_id }
      _set: { query: $code }
    ) {
      id
    }
  }
`;

const exportCsv = gql`
  query ExportCSV(
    $execution_id: String!
    $query_id: Int!
    $parameters: [Parameter!]!
    $downloadFor: ContextOwner!
  ) {
    export_csv(
      execution_id: $execution_id
      query_id: $query_id
      parameters: $parameters
      downloadFor: $downloadFor
    ) {
      url
    }
  }
`;

const deleteVisualization = gql`
  mutation DeleteVisualization($visual_id: Int!) {
    delete_visualizations_by_pk(id: $visual_id) {
      id
    }
  }
`;

gql`
  query ListDatasets {
    datasets(order_by: { name: asc }) {
      id
      name
      type
    }
  }
`;

gql`
  query ListSchemas(
    $dataset_id: Int!
    $query: [blockchain_schemas_bool_exp!]!
    $offset: Int!
    $limit: Int!
  ) {
    blockchain_schemas(
      where: { dataset_id: { _eq: $dataset_id }, _and: $query }
      order_by: [{ schema: asc }, { table: asc }]
      distinct_on: [schema, table]
      offset: $offset
      limit: $limit
    ) {
      schema
      table
    }
  }
`;

gql`
  query ListColumns(
    $dataset_id: Int!
    $schema: String!
    $table: String!
    $limit: Int!
  ) {
    blockchain_schemas(
      where: {
        dataset_id: { _eq: $dataset_id }
        schema: { _eq: $schema }
        table: { _eq: $table }
      }
      order_by: { column_name: asc }
      limit: $limit
    ) {
      column_name
      data_type
    }
  }
`;

gql`
  mutation TransferQueries($query_ids: [Int!]!, $team_id: Int, $user_id: Int) {
    transfer_queries(
      query_ids: $query_ids
      team_id: $team_id
      user_id: $user_id
    ) {
      ok
      query {
        id
        id
        team {
          id
          name
          handle
          profile_image_url
        }
        user {
          id
          name
          profile_image_url
        }
      }
    }
  }
`;

gql`
  mutation PatchQuerySettings(
    $id: Int!
    $name: String
    $user_id: Int
    $team_id: Int
    $is_private: Boolean
    $is_archived: Boolean
    $description: String
    $code: String
    $tags: jsonb
  ) {
    # QuerySettings only contains attributes on the query
    # that require custom business logic in a hasura action.
    # For benign attributes of the query use the update_queries
    # mutation below
    patch_query_settings(
      query_settings: {
        name: $name
        id: $id
        is_archived: $is_archived
        is_private: $is_private
        team_id: $team_id
        user_id: $user_id
      }
    ) {
      query {
        id
        name
        is_private
        is_archived
        user_id
        team_id
      }
    }

    update_queries(
      where: { id: { _eq: $id } }
      _set: { description: $description, tags: $tags, query: $code }
    ) {
      returning {
        id
        description
        tags
        query
      }
    }
  }
`;

gql`
  mutation RestoreQuery($query_event_id: String!) {
    restore_query(query_event_id: $query_event_id) {
      query_id
    }
  }
`;

gql`
  input UpsertQueryEventMetadataInput {
    name: String
    description: String
  }

  mutation UpsertQueryEventMetadata(
    $query_event_id: String!
    $metadata: UpsertQueryEventMetadataInput!
  ) {
    upsert_query_event_metadata(
      query_event_id: $query_event_id
      metadata: $metadata
    ) {
      query_event_id
      user_id
      name
      description
      created_at
      updated_at
    }
  }
`;

gql`
  query GetQueryEvent($query_event_id: String!) {
    get_query_event(query_event_id: $query_event_id) {
      id
      user_id
      query_version
      from
      to
      type
      created_at
      metadata {
        name
        description
      }
    }
  }
`;
