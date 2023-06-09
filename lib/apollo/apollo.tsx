import { disableFragmentWarnings } from "@apollo/client";
import posthog from "posthog-js";

import { createCoreApolloClient } from "./apolloCore";
import { createApolloCoreQueryExplorer } from "./apolloCoreQueryExplorer";
import { createApolloCoreHack } from "./apolloCoreHack";

// Disable warnings about duplicate GraphQL fragments
// in the generated lib/types/graphql.tsx file.
disableFragmentWarnings();

// Use hasura as host by default

export let apolloCore = createCoreApolloClient(
  process.env.NEXT_PUBLIC_DUNE_HSR_CORE_URL
);

export let apolloCoreQueryExplorer = createApolloCoreQueryExplorer(
  process.env.NEXT_PUBLIC_DUNE_HSR_CORE_URL
);

export let apolloCoreHack = createApolloCoreHack(
  process.env.NEXT_PUBLIC_DUNE_APP_API_URL
);

// Switch over to apisix host if the feature flag is enabled

posthog.onFeatureFlags(() => {
  const coreHost = posthog.isFeatureEnabled("apisix", { send_event: false })
    ? process.env.NEXT_PUBLIC_APISIX_DUNE_GQL_CORE_URL
    : process.env.NEXT_PUBLIC_DUNE_HSR_CORE_URL;
  apolloCore = createCoreApolloClient(coreHost);
  apolloCoreQueryExplorer = createApolloCoreQueryExplorer(coreHost);

  const coreHackHost = posthog.isFeatureEnabled("apisix", { send_event: false })
    ? process.env.NEXT_PUBLIC_APISIX_DUNE_APP_API_URL
    : process.env.NEXT_PUBLIC_DUNE_APP_API_URL;
  apolloCoreHack = createApolloCoreHack(coreHackHost);
});
