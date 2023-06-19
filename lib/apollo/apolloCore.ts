import {
  ApolloClient,
  ApolloLink,
  HttpLink,
  InMemoryCache,
} from "@apollo/client";
import { offsetLimitPagination } from "@apollo/client/utilities";
import { GetQueryEventsResponse } from "lib/types/graphql";

import { sessionLink } from "./sessionLink";
import { authLink } from "./authLink";
import { retryLink, fetchWithErrors } from "./retryLink";

/**
 * apolloCore is the main apollo client
 */

const apolloCoreCache = new InMemoryCache({
  typePolicies: {
    users: {
      fields: {
        private_info: {
          merge(existing, incoming, { mergeObjects }) {
            return mergeObjects(existing, incoming);
          },
        },
      },
    },
    Query: {
      fields: {
        get_query_events: {
          keyArgs: ["query_id"],
          merge(
            existing: GetQueryEventsResponse,
            incoming: GetQueryEventsResponse,
            { args }
          ) {
            const merged = existing?.results ? existing.results.slice(0) : [];

            if (incoming.results) {
              if (args) {
                // Assume an offset of 0 if args.offset omitted.
                const { offset = 0 } = args;
                for (let i = 0; i < incoming.results.length; ++i) {
                  merged[offset + i] = incoming.results[i];
                }
              } else {
                // It's unusual (probably a mistake) for a paginated field not
                // to receive any arguments, so you might prefer to throw an
                // exception here, instead of recovering by appending incoming
                // onto the existing array.
                // eslint-disable-next-line prefer-spread
                merged.push.apply(merged, incoming.results);
              }
            }

            return { ...incoming, results: merged };
          },
        },
        blockchain_schemas: offsetLimitPagination(["where"]),
        arrakis_schemas: offsetLimitPagination(["where"]),
        // Apollo throws a warning when merging arrays (https://go.apollo.dev/c/merging-non-normalized-objects)
        view_queue_positions: {
          merge(_existing, incoming) {
            return incoming;
          },
        },
        pending_user_subscription_updates: {
          merge(_existing, incoming) {
            return incoming;
          },
        },
        team_billable_usage: {
          keyArgs: ["team_id"],
          merge(existing, incoming, { mergeObjects }) {
            return mergeObjects(existing, incoming);
          },
        },
        billable_usage: {
          merge(existing, incoming, { mergeObjects }) {
            return mergeObjects(existing, incoming);
          },
        },
      },
    },
  },
});

export function createCoreApolloClient(
  host?: string,
  cache: InMemoryCache = apolloCoreCache
) {
  return new ApolloClient({
    connectToDevTools: process.env.NODE_ENV === "development",
    link: ApolloLink.from([
      sessionLink,
      authLink,
      retryLink,
      new HttpLink({
        uri: `${host}/v1/graphql`,
        fetch: fetchWithErrors,
      }),
    ]),
    cache,
  });
}
