import styles from "./ScheduleBadge.module.css";
import { Badge, BadgeProps } from "components/Badge/Badge";
import { IconClockHistory } from "components/Icons/IconClockHistory";
import { toRateOption } from "shared/ScheduleExecutionModalContent/cron/optionsRate";
import { Tooltip } from "components/Tooltip/Tooltip";
import {
  getNextCronRun,
  getPreviousCronRun,
} from "shared/ScheduleExecutionModalContent/cron/cronUtils";
import { format } from "date-fns-tz";
import { toButtonText } from "shared/ScheduleExecutionModalContent/cron/optionsRate/toButtonText";

import type { QuerySchedule } from "gui/editor/ScheduleQueryExecution/useQuerySchedule";
import type { DashboardSchedule } from "gui/dashboard/ScheduleDashboardExecutionButton/useDashboardSchedule";

const QUERY_RUN_INTERVAL = 30 * 60_000; // 30 minutes

const ExecutionDescription = ({ run, title }: { run: Date; title: string }) => {
  return (
    <p>
      {title}: {format(run, "yyyy-MM-dd HH:mm")}
      &nbsp;-&nbsp;
      {format(new Date(run).getTime() + QUERY_RUN_INTERVAL, "HH:mm")}
    </p>
  );
};

interface Props {
  schedule: QuerySchedule | DashboardSchedule;
  size: BadgeProps["size"];
}

export const ScheduleBadge = ({ size, schedule }: Props) => {
  const rateOption = toRateOption(schedule.cronString);

  if (rateOption === undefined || schedule.cronString === undefined) {
    return null;
  }

  const previousRun = getPreviousCronRun(
    schedule.cronString,
    schedule.updatedAt
  );

  const nextRun = getNextCronRun(schedule.cronString);

  return (
    <div className={styles.scheduleBadge}>
      <Tooltip
        label={
          <div>
            {!!previousRun && (
              <ExecutionDescription
                run={previousRun}
                title={"Last execution"}
              />
            )}
            {!!nextRun && (
              <ExecutionDescription run={nextRun} title={"Next execution"} />
            )}
          </div>
        }
        position="below-align-right"
      >
        <div>
          <Badge size={size} color="brand-blue" variant="filled">
            <span className={styles.badgeLabel}>
              <span>{toButtonText(rateOption)}</span>
              <IconClockHistory />
            </span>
          </Badge>
        </div>
      </Tooltip>
    </div>
  );
};
