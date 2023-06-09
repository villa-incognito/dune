import { gql, QueryResult } from "@apollo/client";
import { logger } from "lib/logger/browser";

import { useSession } from "gui/session/session";
import {
  useGetPendingUserUpdatesQuery,
  GetPendingUserUpdatesQuery,
} from "lib/types/graphql";

interface PendingDowngrade {
  update_type: "subscription_downgrade";
  service_tier_name: string | undefined;
  service_tier_id: number | undefined;
  update_date: string;
}

type PendingSubscriptionUpdateType = PendingDowngrade;

export function usePendingUserSubscriptionUpdate(
  skip = false
): Pick<
  QueryResult<PendingSubscriptionUpdateType | undefined>,
  "data" | "loading" | "error"
> & {
  refetch: () => void;
} {
  const session = useSession();

  const { data, loading, refetch, error } = useGetPendingUserUpdatesQuery({
    skip: skip || !session?.user,
    context: { session },
    fetchPolicy: "cache-and-network",
    onError: (error) => {
      logger.error(error);
    },
  });

  return {
    data: toPendingSubscriptionUpdateType(data),
    loading,
    refetch,
    error,
  };
}

gql`
  query GetPendingUserUpdates {
    pending_user_subscription_updates {
      update_date
      user_service_tier {
        id
        name
      }
      update_type
    }
  }
`;

function toPendingSubscriptionUpdateType(
  data: GetPendingUserUpdatesQuery | undefined
): PendingSubscriptionUpdateType | undefined {
  const pendingUpdate = data?.pending_user_subscription_updates[0];

  if (!pendingUpdate) {
    return undefined;
  }

  switch (pendingUpdate.update_type) {
    case "subscription_downgrade":
      return {
        update_type: pendingUpdate.update_type,
        service_tier_name: pendingUpdate.user_service_tier?.name,
        service_tier_id: pendingUpdate.user_service_tier.id,
        update_date: pendingUpdate.update_date,
      };

    default:
      return undefined;
  }
}
