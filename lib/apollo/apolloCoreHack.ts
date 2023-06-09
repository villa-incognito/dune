import {
  ApolloClient,
  ApolloLink,
  HttpLink,
  InMemoryCache,
} from "@apollo/client";

import { sessionLink } from "./sessionLink";
import { authLink } from "./authLink";
import { retryLink, fetchWithErrors } from "./retryLink";

/**
 * The CoreHack client for the work around api that bypasses hasura
 */

const apolloCoreHackCache = new InMemoryCache();

export function createApolloCoreHack(host?: string) {
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
    cache: apolloCoreHackCache,
  });
}
