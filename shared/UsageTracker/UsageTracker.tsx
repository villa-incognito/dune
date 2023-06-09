import { IconGauge } from "components/Icons/IconGauge";
import styles from "./UsageTracker.module.css";
import { HoverPopover } from "components/HoverPopover/HoverPopover";
import { IconButton } from "components/Button/IconButton";
import { useActiveContext } from "shared/ContextSwitcher/store";
import { AnchorButton } from "components/Button/AnchorButton";
import { useTeamUsage } from "page-components/Settings/Teams/ManageTeam/SubscriptionTab/hooks/useTeamUsage";
import { useGetUserUsage } from "page-components/Settings/Subscription/v2/hooks/useGetUserUsage";
import { formattedPlanName } from "lib/plans/plans";
import {
  UsageItem,
  getUsagePercentage,
} from "page-components/Settings/shared/Usage/components/UsageItem";
import {
  useTeamUpcomingInvoice,
  useUserUpcomingInvoice,
} from "./useUpcomingInvoice";
import { formatDateMDY } from "lib/dates/dates";
import { useRequiredSessionWithUser } from "gui/session/session";
import { UsageType } from "page-components/Settings/shared/Usage/types";

export function UsageTracker() {
  const session = useRequiredSessionWithUser();
  const activeContext = useActiveContext();

  if (activeContext?.serviceTier.version !== "v2" || !session.user) {
    return null;
  }

  const currentPlanName = activeContext.serviceTier.name;

  switch (activeContext.type) {
    case "team":
      return (
        <TeamUsageTracker
          teamId={activeContext.id}
          currentPlanName={currentPlanName}
          teamHandle={activeContext.handle}
          canUpdateSubscription={activeContext.permissions.hasAdminAccess}
        />
      );
    case "user":
      return (
        <UserUsageTracker
          currentPlanName={currentPlanName}
          canUpdateSubscription={activeContext.permissions.hasAdminAccess}
        />
      );
  }
}

function UserUsageTracker(props: {
  currentPlanName: string;
  canUpdateSubscription: boolean;
}) {
  const usage = useGetUserUsage();
  const upcomingInvoice = useUserUpcomingInvoice();

  return (
    <CommonUsageTracker
      usage={usage ?? undefined}
      upcomingInvoice={upcomingInvoice}
      currentPlanName={props.currentPlanName}
      canUpdateSubscription={props.canUpdateSubscription}
      settingsLink="/settings/subscription"
    />
  );
}

function TeamUsageTracker(props: {
  teamId: number;
  teamHandle: string;
  currentPlanName: string;
  canUpdateSubscription: boolean;
}) {
  const { teamId, teamHandle, currentPlanName, canUpdateSubscription } = props;
  const usage = useTeamUsage(teamId)?.usage;
  const upcomingInvoice = useTeamUpcomingInvoice(
    teamId,
    !canUpdateSubscription
  );

  return (
    <CommonUsageTracker
      usage={usage}
      canUpdateSubscription={canUpdateSubscription}
      upcomingInvoice={upcomingInvoice}
      currentPlanName={currentPlanName}
      settingsLink={`/settings/teams/manage/${teamHandle}/subscription`}
    />
  );
}

function CommonUsageTracker(props: {
  usage?: UsageType;
  upcomingInvoice?: string;
  currentPlanName: string;
  settingsLink: string;
  canUpdateSubscription: boolean;
}) {
  const {
    usage,
    upcomingInvoice,
    currentPlanName,
    canUpdateSubscription,
    settingsLink,
  } = props;

  if (!usage) {
    return null;
  }

  const usagePercentage = getUsagePercentage(
    usage.usedCredits,
    usage.maxCredits
  );

  const content = () => (
    <div className={styles.usageTracker}>
      <h1>{formattedPlanName(currentPlanName || "")}</h1>
      <hr />

      <div className={styles.usage}>
        <UsageItem
          title="Credits"
          currentUsage={usage?.usedCredits ?? 0}
          maxUsage={usage?.maxCredits ?? 0}
          usagePerMonth
          tooltipLabel={<>Amount of used Dune credits, renews monthly.</>}
          className={styles.usageItem}
        />

        {canUpdateSubscription && (
          <>
            <AnchorButton
              theme={usagePercentage >= 100 ? "secondary" : "tertiary"}
              size="S"
              href={settingsLink}
            >
              {usagePercentage >= 100 ? "Add extra credits" : "Upgrade plan"}
            </AnchorButton>

            {upcomingInvoice && (
              <p>Your credits renew on {formatDateMDY(upcomingInvoice)}.</p>
            )}
          </>
        )}
      </div>
    </div>
  );

  return (
    <>
      <HoverPopover position="below-align-left" content={content}>
        <IconButton theme="ghost" size="M" className={styles.createButton}>
          <IconGauge />
        </IconButton>
      </HoverPopover>
    </>
  );
}
