import { SessionContext } from "gui/session/session";
import { useContext } from "react";
import { useActiveContext } from "shared/ContextSwitcher/store";
import { useGetTeamPendingUpdatesQuery } from "lib/types/graphql";

export const useShowMigrationBanner = (): "show" | "dont-show" | "loading" => {
  const activeContext = useActiveContext();
  const { session, sessionLoading } = useContext(SessionContext);

  const { data, loading } = useGetTeamPendingUpdatesQuery({
    skip: !session || !activeContext || activeContext.type !== "team",
    context: { session },
    variables: {
      teamId: activeContext?.id as number,
    },
    fetchPolicy: "cache-and-network",
  });

  if (sessionLoading || loading) {
    return "loading";
  }

  if (!session && !sessionLoading) {
    return "dont-show";
  }

  const pendingUpdate = data?.pending_team_subscription_updates[0];

  if (
    pendingUpdate?.update_type === "forced_migration" &&
    pendingUpdate?.service_tier.id === activeContext?.serviceTier.id
  ) {
    return "show";
  }
  return "dont-show";
};
