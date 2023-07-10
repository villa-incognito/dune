/* eslint @typescript-eslint/strict-boolean-expressions: off */

import cn from "classnames";
import styles from "../Usage.module.css";
import { formatNumber } from "lib/intl/number";
import React from "react";
import { Tooltip } from "components/Tooltip/Tooltip";
import { IconInformation } from "components/Icons/IconInformation";

const ProgressBar = (props: {
  percentage: number;
  overageProtectionDisabled?: boolean;
  reachedProtectionLimit?: boolean;
}) => {
  // default to true if overageProtection is enabled
  const { reachedProtectionLimit = !props.overageProtectionDisabled } = props;
  const isOverLimit = props.percentage >= 100;
  const isCloseToLimit = props.percentage >= 80;

  return (
    <div>
      <div
        className={cn(
          styles.progressBarContainer,
          !isOverLimit && !isCloseToLimit && styles.green,
          // yellow bar
          ((isCloseToLimit && !isOverLimit) ||
            (isOverLimit && props.overageProtectionDisabled) ||
            (isOverLimit &&
              !props.overageProtectionDisabled &&
              !reachedProtectionLimit)) &&
            styles.yellow,
          // red bar
          isOverLimit &&
            !props.overageProtectionDisabled &&
            reachedProtectionLimit &&
            styles.red
        )}
      >
        <div style={{ width: `${props.percentage}%` }} />
      </div>
    </div>
  );
};

const getFormattedMaxUsage = (maxUsage?: number | null, decimals = 0) => {
  if (maxUsage === null || maxUsage === undefined) {
    return "∞";
  }

  return roundNumber(maxUsage, decimals);
};

const roundNumber = (value: number, maxDecimals = 0) => {
  if (!maxDecimals) {
    return formatNumber(Math.ceil(value));
  }

  return value.toFixed(maxDecimals).replace(/\.0+$/, "");
};

export const getUsagePercentage = (
  currentUsage: UsageProps["currentUsage"],
  maxUsage: UsageProps["maxUsage"]
) => {
  if (maxUsage === 0) {
    return 100;
  }

  if (!maxUsage) {
    return 0;
  }

  return (currentUsage / maxUsage) * 100;
};

export interface UsageProps {
  currentUsage: number;
  maxUsage?: number | null;
  maxUsageWithOverage?: number | null;
  overageProtectionDisabled?: boolean;
  reachedProtectionLimit?: boolean;
}

interface UsageItemProps {
  title: string;
  tooltipLabel: string | React.ReactNode;
  usagePerMonth?: boolean;
  usageThisMonth?: boolean;
  maxDecimals?: number;
  tooltipStyle?: React.CSSProperties;
  className?: string;
  prefix?: string;
}

export const UsageItem = (props: UsageProps & UsageItemProps) => (
  <div className={props.className}>
    <div className={styles.usageInfo}>
      <div>
        {props.title}
        <Tooltip
          style={props.tooltipStyle}
          label={
            <span className={styles.tooltipLabel}>{props.tooltipLabel}</span>
          }
          position="above-center"
        >
          <div className={styles.icon}>
            <IconInformation />
          </div>
        </Tooltip>
      </div>
      <span>
        {props.prefix}
        {roundNumber(props.currentUsage, props.maxDecimals)}/{props.prefix}
        {getFormattedMaxUsage(props.maxUsage)}
        {props.usagePerMonth ? " per month" : ""}
        {props.usageThisMonth ? " this month" : ""}
      </span>
    </div>
    <ProgressBar
      overageProtectionDisabled={props.overageProtectionDisabled}
      reachedProtectionLimit={props.reachedProtectionLimit}
      percentage={getUsagePercentage(props.currentUsage, props.maxUsage)}
    />
  </div>
);
