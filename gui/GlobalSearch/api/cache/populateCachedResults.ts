import { apolloCore } from "lib/apollo/apollo";
import { GetGlobalSearchResultsDocument } from "lib/types/graphql";
import initialGlobalSearchResults from "./initialGlobalSearchResults.json";

apolloCore.writeQuery({
  query: GetGlobalSearchResultsDocument,
  variables: { query: { _ilike: `%%` } },
  data: initialGlobalSearchResults,
});
