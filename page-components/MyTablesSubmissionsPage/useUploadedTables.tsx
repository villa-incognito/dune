import gql from "graphql-tag";
import { useSession } from "gui/session/session";
import { apolloCore } from "lib/apollo/apollo";
import { useIsFeatureEnabled } from "lib/hooks/useIsFeatureEnabled";
import { Session } from "lib/users/types";
import {
  UploadedTablesDocument,
  UploadedTablesQuery,
  UploadedTablesQueryVariables,
  useUploadedTablesQuery,
} from "lib/types/graphql";

export const callUploadedTables = (session: Session) =>
  apolloCore.query<UploadedTablesQuery, UploadedTablesQueryVariables>({
    query: UploadedTablesDocument,
    context: { session },
    fetchPolicy: "network-only",
  });

type UseUploadedTablesCountParams = {
  hasAuthoredFilter: boolean;
};
export const useUploadedTablesCount = ({
  hasAuthoredFilter,
}: UseUploadedTablesCountParams): number => {
  const session = useSession();
  const dataUploadEnabled = useIsFeatureEnabled("data-upload-v1");
  return (
    useUploadedTablesQuery({
      context: { session },
      skip: !dataUploadEnabled && !hasAuthoredFilter,
      fetchPolicy: "cache-first",
    }).data?.uploaded_tables.length ?? 0
  );
};

gql`
  query UploadedTables {
    uploaded_tables {
      file_name
      table_name
      status
    }
  }
`;
