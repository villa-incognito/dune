import { QueryResult, gql } from "@apollo/client";
import { ListFoldersQuery, useListFoldersQuery } from "lib/types/graphql";
import { SessionWithUser } from "lib/users/types";
import { useActiveContext } from "shared/ContextSwitcher/store";

export function useListFolders(
  session: SessionWithUser,
  { freetextFilterDebounced }: { freetextFilterDebounced?: string } = {}
): QueryResult<ListFoldersQuery> {
  const activeContext = useActiveContext();
  const teamId = activeContext?.type === "team" ? activeContext.id : undefined;

  return useListFoldersQuery({
    skip: !activeContext,
    context: { session },
    variables: {
      input: {
        // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
        filter_by: freetextFilterDebounced
          ? { name: freetextFilterDebounced }
          : undefined,
        offset: 0,
        limit: 50,
        team_id: teamId,
      },
    },
    fetchPolicy: "cache-first",
  });
}

gql`
  query ListFolders($input: GetFoldersInput!) {
    get_folders(input: $input) {
      results {
        id
        name
        description
        path
        color
        icon
        content_count
      }
    }
  }
`;
