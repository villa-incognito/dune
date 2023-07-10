/* eslint @typescript-eslint/strict-boolean-expressions: off */

import cn from "classnames";
import styles from "../Subscription.module.css";
import { Maybe } from "lib/types/graphql";
import { TooltipOld } from "components/TooltipOld/TooltipOld";
import { Icon } from "gui/icon/icon";
import { formatNumber } from "lib/intl/number";
import { MAX_VALUE } from "long";
import React from "react";

export const MAX_VALUE_HIGH = MAX_VALUE.high;

const QUERY_EXECUTIONS_QUOTA_REACHED_TOOLTIP_MESSAGE = (
  <>
    <p>
      You have used up 100% of your quota. Additional query executions will be
      charged
    </p>
    <p>
      at an additional fee if the extra query executions limit toggle is not
      enabled.
    </p>
  </>
);

const APP_PLAN_QUOTA_REACHED_TOOLTIP_MESSAGE = (
  <>
    <p>You have used up 100% of your quota.</p>
    <p>
      You can increase your quota by upgrading your plan on dune.com/pricing.
    </p>
  </>
);

const DATAPOINTS_REACHED_TOOLTIP_MESSAGE =
  "You have used up 100% of your quota. Additional datapoints will be charged at an additional fee.";

function getUsagePercentage(value: number, max: number) {
  const res = (value / max) * 100;

  if (res === Infinity) {
    return 100;
  }

  // If the max is very high the percentage will be very small and
  // will look like 0 in the progress bar, so return 2, so it shows a small progress.
  if (res > 0 && res < 2) {
    return 2;
  }

  return res;
}

const ProgressBar = (props: {
  percentage: number;
  label?: React.ReactNode;
  greyedOut?: boolean;
  className?: string;
}) => {
  const { percentage, greyedOut, label } = props;

  const style = {
    "--progress": `${percentage}%`,
    "--bar-color": greyedOut
      ? `var(--gray-200)`
      : percentage >= 100
      ? `var(--danger-red)`
      : `var(--blue-500)`,
  } as React.CSSProperties;

  const Progress = () => {
    return (
      <div className={cn(styles.progressbar, props.className)} style={style}>
        <div
          style={
            {
              "--bar-background-color": greyedOut
                ? `var(--gray-200)`
                : percentage >= 100
                ? `var(--danger-red)`
                : `var(--blue-200)`,
            } as React.CSSProperties
          }
        />
      </div>
    );
  };

  return percentage >= 100 && label ? (
    <TooltipOld label={label} color="gray">
      <div>
        <Progress />
      </div>
    </TooltipOld>
  ) : (
    <Progress />
  );
};

export const ExecutionsSection = (props: {
  currentPlanMaxExecutions: Maybe<number> | undefined;
  usageExecutions: number;
}) => {
  const { currentPlanMaxExecutions, usageExecutions } = props;

  const percentage = getUsagePercentage(
    usageExecutions,
    currentPlanMaxExecutions ?? Infinity
  );

  return (
    <div className={styles.usageItem}>
      <div>
        Executions
        <p>
          {usageExecutions}/{currentPlanMaxExecutions ?? `unlimited`} monthly
        </p>
      </div>
      <ProgressBar
        percentage={percentage}
        label={QUERY_EXECUTIONS_QUOTA_REACHED_TOOLTIP_MESSAGE}
      />
    </div>
  );
};

export const CSVDownloadsSection = (props: {
  currentPlanMaxDownloads: Maybe<number> | undefined;
  usageDownloads: number;
}) => {
  const { currentPlanMaxDownloads, usageDownloads } = props;

  const percentage = getUsagePercentage(
    usageDownloads,
    currentPlanMaxDownloads ?? Infinity
  );

  return (
    <div className={styles.usageItem}>
      {(currentPlanMaxDownloads === null ||
        Boolean(currentPlanMaxDownloads)) && (
        <>
          <div>
            CSV Downloads
            <p>
              {usageDownloads}/{currentPlanMaxDownloads ?? `unlimited`} monthly
            </p>
          </div>
          <ProgressBar
            percentage={percentage}
            label={APP_PLAN_QUOTA_REACHED_TOOLTIP_MESSAGE}
          />
        </>
      )}
      {currentPlanMaxDownloads === 0 && (
        <>
          <div className={styles.greyedOut}>
            CSV Downloads
            <ProgressBar percentage={100} greyedOut={true} />
          </div>
          <div className={styles.upgradeInfo}>
            <TooltipOld
              label="CSV downloads are available on Thug Life, Elite and Enterprise plans."
              color="gray"
            >
              <div>
                <Icon icon="info-circle" />
              </div>
            </TooltipOld>
            <i>Upgrade to get CSV downloads</i>
          </div>
        </>
      )}
    </div>
  );
};

export const PrivateQueriesSection = (props: {
  currentPlanMaxQueries: number;
  privateQueriesCount: number;
}) => {
  const { currentPlanMaxQueries, privateQueriesCount } = props;

  const percentage = getUsagePercentage(
    privateQueriesCount,
    currentPlanMaxQueries
  );

  return (
    <div className={styles.usageItem}>
      {currentPlanMaxQueries > 0 && (
        <>
          <div>
            Private Queries
            <p>
              {privateQueriesCount}/
              {currentPlanMaxQueries === MAX_VALUE_HIGH
                ? `∞`
                : currentPlanMaxQueries}
            </p>
          </div>
          <ProgressBar
            percentage={percentage}
            label={APP_PLAN_QUOTA_REACHED_TOOLTIP_MESSAGE}
          />
        </>
      )}
      {currentPlanMaxQueries === 0 && (
        <>
          <div className={styles.greyedOut}>
            Private Queries
            <ProgressBar percentage={100} greyedOut={true} />
          </div>
          <div className={styles.upgradeInfo}>
            <TooltipOld
              label="Private queries are available on Thug Life, Elite and Enterprise plans."
              color="gray"
            >
              <div>
                <Icon icon="info-circle" />
              </div>
            </TooltipOld>
            <i>Upgrade to get private queries</i>
          </div>
        </>
      )}
    </div>
  );
};

export const PrivateDashboardsSection = (props: {
  currentPlanMaxDashboards: number;
  privateDashboardsCount: number;
}) => {
  const { currentPlanMaxDashboards, privateDashboardsCount } = props;

  const percentage = getUsagePercentage(
    privateDashboardsCount,
    currentPlanMaxDashboards
  );

  return (
    <div className={styles.usageItem}>
      {currentPlanMaxDashboards > 0 && (
        <>
          <div>
            Private Dashboards
            <p>
              {privateDashboardsCount}/
              {currentPlanMaxDashboards === MAX_VALUE_HIGH
                ? `∞`
                : currentPlanMaxDashboards}
            </p>
          </div>
          <ProgressBar
            percentage={percentage}
            label={APP_PLAN_QUOTA_REACHED_TOOLTIP_MESSAGE}
          />
        </>
      )}
      {currentPlanMaxDashboards === 0 && (
        <>
          <div className={styles.greyedOut}>
            Private Dashboards
            <ProgressBar percentage={100} greyedOut={true} />
          </div>
          <div className={styles.upgradeInfo}>
            <TooltipOld
              label="Private dashboards are available on Thug Life, Elite and Enterprise plans."
              color="gray"
            >
              <div>
                <Icon icon="info-circle" />
              </div>
            </TooltipOld>
            <i>Upgrade to get private dashboards</i>
          </div>
        </>
      )}
    </div>
  );
};

export const DatapointsSection = (props: {
  currentPlanMaxDatapoints: Maybe<number> | undefined;
  usageDatapoints: number;
}) => {
  const { currentPlanMaxDatapoints, usageDatapoints } = props;

  const percentage = getUsagePercentage(
    usageDatapoints,
    currentPlanMaxDatapoints ?? Infinity
  );

  return (
    <div className={styles.usageItem}>
      <div>
        Datapoints
        <p>
          {formatNumber(usageDatapoints)}/
          {currentPlanMaxDatapoints
            ? formatNumber(currentPlanMaxDatapoints)
            : `unlimited`}{" "}
          monthly
        </p>
      </div>
      <ProgressBar
        percentage={percentage}
        label={DATAPOINTS_REACHED_TOOLTIP_MESSAGE}
      />
    </div>
  );
};
