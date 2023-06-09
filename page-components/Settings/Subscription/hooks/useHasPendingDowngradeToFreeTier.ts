import { usePendingUserSubscriptionUpdate } from "gui/SettingsPage/Subscription/hooks/usePendingUserSubscriptionUpdate";

export function useHasPendingDowngradeToFreeTier(loadingState = true) {
  const pendingUserSubscriptionUpdateRequest = usePendingUserSubscriptionUpdate();

  if (pendingUserSubscriptionUpdateRequest.loading) {
    return loadingState;
  }

  return (
    pendingUserSubscriptionUpdateRequest.data?.update_type ===
      "subscription_downgrade" &&
    pendingUserSubscriptionUpdateRequest.data?.service_tier_id === 1
  );
}
