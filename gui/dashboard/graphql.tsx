import { Dashboards_Constraint } from "lib/types/graphql";
import { Dashboards_Update_Column } from "lib/types/graphql";
import { FullDashboard } from "lib/entries/types";
import { Session } from "lib/users/types";
import { UpsertDashboardMutation } from "lib/types/graphql";
import { UpsertDashboardMutationVariables } from "lib/types/graphql";
import { Text_Widgets_Constraint } from "lib/types/graphql";
import { Text_Widgets_Update_Column } from "lib/types/graphql";
import { Visualization_Widgets_Constraint } from "lib/types/graphql";
import { Visualization_Widgets_Update_Column } from "lib/types/graphql";
import { Param_Widgets_Constraint } from "lib/types/graphql";
import { Param_Widgets_Update_Column } from "lib/types/graphql";
import { apolloCore } from "lib/apollo/apollo";
import { generateSlug } from "lib/links/slugs";
import { gql } from "@apollo/client";

type Owner = Pick<FullDashboard["owner"], "type" | "id">;

export const callUpsertDashboard = async (
  dashboard: Omit<Partial<FullDashboard>, "owner"> & { owner: Owner },
  session: Session
): Promise<string> => {
  const text_widgets = dashboard.text_widgets ?? [];
  const visualization_widgets = dashboard.visualization_widgets ?? [];
  const param_widgets = dashboard.param_widgets ?? [];

  if (!dashboard.name) {
    throw new Error("missing dashboard name");
  }

  const variables = {
    object: {
      id: "id" in dashboard ? dashboard.id : undefined,
      slug: dashboard.slug ?? generateSlug(dashboard.name),
      name: dashboard.name,
      tags: dashboard.tags,
      user_id: dashboard.owner.type === "user" ? dashboard.owner.id : null,
      team_id: dashboard.owner.type === "team" ? dashboard.owner.id : null,
      is_archived: dashboard.is_archived,
      is_private: dashboard.is_private,
      text_widgets: {
        data: text_widgets.map((w) => ({
          id: w.id,
          text: w.text,
          options: w.options,
        })),
        on_conflict: {
          constraint: Text_Widgets_Constraint.TextWidgetsPkey,
          update_columns: [
            Text_Widgets_Update_Column.Text,
            Text_Widgets_Update_Column.Options,
          ],
        },
      },
      visualization_widgets: {
        data: visualization_widgets.map((w) => ({
          id: w.id,
          visualization_id: w.visualization.id,
          options: w.options,
        })),
        on_conflict: {
          constraint: Visualization_Widgets_Constraint.VisualizationWidgetsPkey,
          update_columns: [Visualization_Widgets_Update_Column.Options],
        },
      },
      param_widgets: {
        data: param_widgets.map((w) => ({
          id: w.id,
          key: w.key,
          visualization_widget_id: w.visualization_widget_id,
          query_id: w.query_id,
          options: w.options,
        })),
        on_conflict: {
          constraint: Param_Widgets_Constraint.ParamWidgetsPkey,
          update_columns: [Param_Widgets_Update_Column.Options],
        },
      },
    },
    on_conflict: {
      constraint: Dashboards_Constraint.DashboardsPkey,
      update_columns: [
        Dashboards_Update_Column.Name,
        Dashboards_Update_Column.Tags,
        Dashboards_Update_Column.IsArchived,
        Dashboards_Update_Column.IsPrivate,
      ],
    },
  };

  const res = await apolloCore.mutate<
    UpsertDashboardMutation,
    UpsertDashboardMutationVariables
  >({
    mutation: upsertDashboard,
    variables: { ...variables },
    context: { session },
    fetchPolicy: "no-cache",
  });

  if (!res.data?.insert_dashboards_one?.slug) {
    throw new Error("dashboard creation failed");
  }

  return res.data?.insert_dashboards_one?.slug;
};

const upsertDashboard = gql`
  mutation UpsertDashboard(
    $object: dashboards_insert_input!
    $on_conflict: dashboards_on_conflict!
  ) {
    insert_dashboards_one(object: $object, on_conflict: $on_conflict) {
      slug
    }
  }
`;

gql`
  mutation PatchDashboardSettings(
    $id: Int!
    $name: String
    $user_id: Int
    $team_id: Int
    $is_private: Boolean
    $slug: String
    $tags: jsonb
  ) {
    # DashboardSettings only contains attributes on the dashboard
    # that require custom business logic in a hasura action.
    # For benign attributes of the dashboard use the update_dashboards
    # mutation below
    patch_dashboard_settings(
      dashboard_settings: {
        name: $name
        id: $id
        is_private: $is_private
        team_id: $team_id
        user_id: $user_id
        slug: $slug
      }
    ) {
      dashboard {
        id
        name
        is_private
        user_id
        team_id
        slug
      }
    }
    update_dashboards(where: { id: { _eq: $id } }, _set: { tags: $tags }) {
      returning {
        id
        tags
      }
    }
  }
`;
