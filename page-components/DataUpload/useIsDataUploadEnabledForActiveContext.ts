import { useIsFeatureEnabled } from "lib/hooks/useIsFeatureEnabled";
import { useActiveContext } from "shared/ContextSwitcher/store";

export function useIsDataUploadEnabledForActiveContext() {
  const activeContext = useActiveContext();

  const dataUploadEnabledForUser = useIsFeatureEnabled("data-upload-v1");

  if (!activeContext) {
    return false;
  }

  switch (activeContext.type) {
    case "user":
      return dataUploadEnabledForUser;
    case "team":
      return activeContext.serviceTier.hasPaidPlanSubscription;
  }
}
