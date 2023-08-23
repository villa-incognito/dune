import { useIsFeatureEnabled } from "src/hooks/useIsFeatureEnabled";
import { useActiveContext } from "shared/ContextSwitcher/store";

type Enablement = "enabled" | "requires_upgrade" | "not_enabled";

export function useIsDataUploadEnabledForActiveContext(): Enablement {
  const activeContext = useActiveContext();

  const dataUploadEnabledForUser = useIsFeatureEnabled("data-upload-v1");

  if (!activeContext) {
    return "not_enabled";
  }

  switch (activeContext.type) {
    case "user":
      return dataUploadEnabledForUser ? "enabled" : "requires_upgrade";
    case "team":
      return activeContext.serviceTier.hasPaidPlanSubscription
        ? "enabled"
        : "requires_upgrade";
  }
}
