import { ScheduleBadge } from "./ScheduleBadge";
import { toRateOption } from "shared/ScheduleExecutionModalContent/cron/optionsRate";
import { useRequiredSessionWithUser } from "gui/session/session";
import { useDashboardSchedule } from "gui/dashboard/ScheduleDashboardExecutionButton/useDashboardSchedule";
import type { BadgeProps } from "components/Badge/Badge";

interface Props {
  dashboardId: number;
  size: BadgeProps["size"];
}

export function DashboardScheduleBadge({ dashboardId, size }: Props) {
  const session = useRequiredSessionWithUser();
  const dashboardSchedule = useDashboardSchedule(session, dashboardId);
  const rateOption =
    dashboardSchedule && toRateOption(dashboardSchedule.cronString);

  if (rateOption === undefined || dashboardSchedule === undefined) {
    return null;
  }

  return <ScheduleBadge size={size} schedule={dashboardSchedule} />;
}
