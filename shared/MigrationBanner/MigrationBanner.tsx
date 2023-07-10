/* eslint @typescript-eslint/strict-boolean-expressions: off */

import { AnchorButton } from "components/Button/AnchorButton";
import { IconButton } from "components/Button/IconButton";
import { IconCross } from "components/Icons/IconCross";
import { IconRocketLaunch } from "components/Icons/IconRocketLaunch";
import { useSession } from "gui/session/session";
import {
  tryLocalStorageGetItem,
  tryLocalStorageSetItem,
} from "lib/storage/storage";
import React, { useRef, useState } from "react";
import { useActiveContext } from "shared/ContextSwitcher/store";
import { addToastNotification } from "shared/Toasts/toastNotificationStore";
import styles from "./MigrationBanner.module.css";
import { useHasPendingDowngradeToFreeTier } from "page-components/Settings/Subscription/hooks/useHasPendingDowngradeToFreeTier";
import { useAnalytics } from "gui/analytics/analytics";
import { Button } from "components/Button/Button";
import { MigrationDialogV2 } from "../MigrationDialogV2/MigrationDialogV2";

const STORAGE_DISMISSED_KEY = "migrationNotificationDismissed";
const STORAGE_VIEWED_KEY = "migrationNotificationViewed";
const VERSION = "v3";

const WithContext = (
  BaseComponent: React.FC<{
    serviceTierId: number;
    fromServiceTier?: number | null;
  }>
) => () => {
  const activeContext = useActiveContext();
  const session = useSession();
  const { serviceTierId, fromServiceTier } = session?.user?.private_info ?? {};

  if (
    !serviceTierId ||
    // Only show banner when the user is selected as activeContext
    activeContext?.type !== "user" ||
    activeContext.serviceTier.hasCustomPlan ||
    // Must know the user's serviceTierId
    !session?.user?.private_info?.serviceTierId
  ) {
    return null;
  }

  return (
    <BaseComponent
      serviceTierId={serviceTierId}
      fromServiceTier={fromServiceTier}
    />
  );
};

export const MigrationBanner = WithContext(
  ({ serviceTierId, fromServiceTier }) => {
    const hasPendingSubscriptionDowngradeToFreeTier = useHasPendingDowngradeToFreeTier();
    const { captureEvent } = useAnalytics();

    // Event tracking
    const viewedRef = useRef(
      tryLocalStorageGetItem(STORAGE_VIEWED_KEY) === VERSION
    );
    const [dismissed, setDismissed] = useState(
      Number(serviceTierId) > 2
        ? tryLocalStorageGetItem(STORAGE_DISMISSED_KEY) === VERSION
        : // Hide from users who have dismissed the banner before
          Boolean(tryLocalStorageGetItem(STORAGE_DISMISSED_KEY))
    );

    const canDismiss = ![3, 4].includes(serviceTierId);

    if (dismissed && canDismiss) {
      return null;
    }

    // Do not show banner if user is now on free tier
    // and before was on a paid plan
    if (
      serviceTierId === 1 &&
      (fromServiceTier === 3 || fromServiceTier === 4)
    ) {
      return null;
    }

    // Do not show banner if user has a pending downgrade to free tier
    if (hasPendingSubscriptionDowngradeToFreeTier) {
      return null;
    }

    const isV2MigrationBanner = serviceTierId > 1; // all legacy user plans

    const description = getDescription(
      serviceTierId,
      fromServiceTier ?? undefined
    );

    // Do not show banner if there is no description
    if (!description) {
      return null;
    }

    const trackClick = (action: string, serviceTierId: number) => {
      captureEvent(`Migration banner: ${action}`, {
        serviceTierId,
        version: VERSION,
      });
    };

    if (!viewedRef.current) {
      viewedRef.current = true;

      trackClick("view", serviceTierId);
      tryLocalStorageSetItem(STORAGE_VIEWED_KEY, VERSION);
    }

    const onDismiss = () => {
      setDismissed(true);
      tryLocalStorageSetItem(STORAGE_DISMISSED_KEY, VERSION);

      trackClick("dismiss", serviceTierId);

      if (serviceTierId === 3 || serviceTierId === 4) {
        addToastNotification({
          level: "neutral",
          title: "Migration prompt dismissed.",
          description:
            "You can manually migrate your plan until July 24th from your subscription account settings.",
        });
      }
    };

    return (
      <div className={styles.banner}>
        <div className={styles.description}>
          <IconRocketLaunch />
          {description}
        </div>
        <div className={styles.actions}>
          {!isV2MigrationBanner && (
            <AnchorButton
              size="S"
              theme="tertiary"
              href="/blog/new-paid-experience"
              onClick={() => trackClick("learn more", serviceTierId)}
            >
              Learn more
            </AnchorButton>
          )}
          <CustomActions
            serviceTierId={serviceTierId}
            fromServiceTier={fromServiceTier ?? undefined}
            trackClick={trackClick}
          />
          {canDismiss && (
            <IconButton theme="ghost" size="S" onClick={onDismiss}>
              <IconCross />
            </IconButton>
          )}
        </div>
      </div>
    );
  }
);

const getDescription = (serviceTierId: number, fromServiceTier?: number) => {
  switch (serviceTierId) {
    case 1: // Free
      if (fromServiceTier === 2) {
        return (
          <>
            We launched new subscription plans - your account is now free to use
            with flexible credits.
          </>
        );
      } else {
        return (
          <>
            We launched new subscription plans - your account is still free, but
            now with added features and benefits.
          </>
        );
      }
    case 2: // Analyzooor
    case 3: // Thug life
    case 4: // Elite
      return (
        <>
          This is the final month on your current plan. Opt-in before July 24th
          to access Plus and Premium benefits now!
        </>
      );
    default:
      return null;
  }
};

const ActionButton = ({
  onClick,
  trackClick,
}: {
  onClick?: () => void;
  trackClick: () => void;
}) => (
  <Button
    size="S"
    theme="secondary"
    onClick={() => {
      trackClick();

      if (onClick) {
        onClick();
      }
    }}
  >
    Migrate
  </Button>
);

function CustomActions(props: {
  serviceTierId: number;
  fromServiceTier?: number;
  trackClick: (action: string, serviceTierId: number) => void;
}) {
  const { serviceTierId, fromServiceTier, trackClick } = props;

  switch (serviceTierId) {
    case 1:
      if (fromServiceTier === 2) {
        return (
          <AnchorButton size="S" theme="primary" href="/settings/subscription">
            Subscription settings
          </AnchorButton>
        );
      }
      return null;
    case 3:
    case 4:
      return (
        <MigrationDialogV2>
          <ActionButton
            trackClick={() => trackClick("migrate", serviceTierId)}
          />
        </MigrationDialogV2>
      );
    default:
      return null;
  }
}
