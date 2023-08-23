import { gql } from "@apollo/client";
import { useMoveContentMutation } from "lib/types/graphql";
import { SessionWithUser } from "lib/users/types";
import * as Sentry from "@sentry/react";

export function useMoveContent() {
  const [callMoveContentMutation, moveContentResult] = useMoveContentMutation();

  function moveContent(
    session: SessionWithUser,
    args: {
      selectedDashboards: number[];
      selectedQueries: number[];
      folderId?: string;
    }
  ): Promise<void> {
    if (moveContentResult.loading) {
      return new Promise(() => {});
    }

    return new Promise((resolve) => {
      callMoveContentMutation({
        context: { session },
        variables: {
          dashboard_ids: args.selectedDashboards,
          query_ids: args.selectedQueries,
          target_folder_id: args.folderId,
        },
      }).then(
        () => {
          resolve();
        },
        (error) => {
          error.message =
            `Failed to move content to folder ${args.folderId}: ` +
            error.message;
          Sentry.captureException(error);
        }
      );
    });
  }

  return [moveContent, moveContentResult] as const;
}

gql`
  mutation MoveContent(
    $dashboard_ids: [Int!]!
    $query_ids: [Int!]!
    $target_folder_id: String
  ) {
    move_content(
      input: {
        dashboard_ids: $dashboard_ids
        query_ids: $query_ids
        target_folder_id: $target_folder_id
      }
    ) {
      ok
    }
  }
`;
