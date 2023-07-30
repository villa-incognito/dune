/* eslint @typescript-eslint/strict-boolean-expressions: off */

import { useSession } from "gui/session/session";
import React from "react";
import { useActiveContext } from "shared/ContextSwitcher/store";
import styles from "./MigrationBanner.module.css";
import { useGetTeamPendingUpdatesQuery } from "lib/types/graphql";
import { IconRocketLaunch } from "components/Icons/IconRocketLaunch";

export const MigrationBanner = () => {
  const activeContext = useActiveContext();
  const session = useSession();

  const { data } = useGetTeamPendingUpdatesQuery({
    skip: !session || !activeContext || activeContext.type !== "team",
    context: { session },
    variables: {
      teamId: activeContext?.id as number,
    },
    fetchPolicy: "cache-and-network",
  });

  const pendingUpdate = data?.pending_team_subscription_updates[0];

  if (
    pendingUpdate?.update_type === "forced_migration" &&
    pendingUpdate?.service_tier.id === activeContext?.serviceTier.id
  ) {
    return (
      <div className={styles.banner}>
        <div className={styles.description}>
          <IconRocketLaunch />
          Welcome to your new {activeContext?.name} plan! Start accessing
          premium features and enjoy a more powerful Dune experience.
        </div>
      </div>
    );
  }

  return null;
};
