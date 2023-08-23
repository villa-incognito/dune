import { usePosthog } from "gui/analytics/analytics";
import { useForceUpdate } from "src/hooks/useForceUpdate";
import { useEffect } from "react";

import type { PostHog } from "posthog-js";

/*
 * Feature flags are managed in PostHog. We have separate sets of
 * feature flags for [prod][] and [dev][].
 *
 * After adding a new feature flag, add the name of the new feature flag
 * to the `FeatureFlag` type. This type makes it easier to avoid
 * misspelling them.
 *
 * [prod]: https://metrics.dune.com/feature_flags
 * [dev]: https://metrics.dev.dune.com/feature_flags
 */
type FeatureFlag =
  | "show-refresh-button"
  | "apisix"
  | "feature-flag-test"
  | "disabled-flag"
  | "show-migrate-button"
  | "query-refresh"
  | "dashboard-refresh"
  | "matviews"
  | "data-upload-v1"
  | "prompt-joined-for-work-but-not-team-banner"
  | "teams-announcement";

// Use this hook to find out if the logged in user has access to a feature
// TEMPORARILY IGNORE THAT THIS FUNCTION IS UNUSED:
// ts-unused-exports:disable-next-line
export function useIsFeatureEnabled(feature: FeatureFlag): boolean {
  const posthog = usePosthog();
  const forceUpdate = useForceUpdate();

  useEffect(forceUpdateWhenReady(posthog, forceUpdate), [posthog, forceUpdate]);

  if (!posthog) {
    return false;
  }
  if (!areFlagsLoaded) {
    return false;
  }

  return posthog.isFeatureEnabled(feature, { send_event: false });
}

/*
 * Inner util to rerun `useIsFeatureEnabled` when feature flags are
 * loaded.
 *
 * We can't check if feature flags are enabled before they are loaded.
 * And even if we could, we would have to recheck if a feature is
 * enabled after the flags are loaded.
 *
 * The state can live in a variable at the top level, because we don't
 * need to subscribe to it – intead we do a forceUpdate (to rerender the
 * outer hook) when the flags get loaded.
 */
let areFlagsLoaded = false;

const forceUpdateWhenReady = (
  posthog: PostHog | undefined,
  forceUpdate: () => void
) => () => {
  if (!posthog) {
    return;
  }

  if (areFlagsLoaded) {
    // We already know that flags are loaded, so we don't need to check
    // again.
    return;
  }

  let mounted = true;

  // This callback is called immediately if feature flags are already
  // loaded
  posthog.onFeatureFlags(() => {
    areFlagsLoaded = true;
    if (mounted) forceUpdate();
  });

  return () => void (mounted = false);
};
