import {
  ApolloClient,
  ApolloLink,
  HttpLink,
  InMemoryCache,
} from "@apollo/client";
import { offsetLimitPagination } from "@apollo/client/utilities";

import { sessionLink } from "./sessionLink";
import { authLink } from "./authLink";
import { retryLink, fetchWithErrors } from "./retryLink";

/**
 * apollocoreQueryExplorer is the Client used for the query explorer
 * (It works differently for paging of queries, so that you can `fetchMore()`)
 */

const apolloQueryExplorerCache = new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        queries: offsetLimitPagination(["where", "order"]),
      },
    },
  },
});

export function createApolloCoreQueryExplorer(host?: string) {
  return new ApolloClient({
    link: ApolloLink.from([
      sessionLink,
      authLink,
      retryLink,
      new HttpLink({
        uri: `${host}/v1/graphql`,
        fetch: fetchWithErrors,
      }),
    ]),
    cache: apolloQueryExplorerCache,
  });
}
