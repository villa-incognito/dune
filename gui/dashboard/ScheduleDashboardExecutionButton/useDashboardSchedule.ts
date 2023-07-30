import {
  useDashboardSchedulesQuery,
  DashboardSchedulesDocument,
  DashboardSchedulesQuery,
} from "lib/types/graphql";

import type { SessionWithUser } from "lib/users/types";
import { gql, PureQueryOptions } from "@apollo/client";
import { apolloCore } from "lib/apollo/apollo";
import produce from "immer";

import {
  isValidCronString,
  CronString,
} from "shared/ScheduleExecutionModalContent/cron/cronUtils";
import { isDefined } from "lib/types/types";
import * as externalCustomerId from "lib/orb/utils/externalCustomerId";
import type { DuneEntity } from "lib/orb/utils/externalCustomerId";

import {
  isSupportedPublicPerformanceTierKey,
  SupportedPublicPerformanceTierKey,
} from "shared/SelectPerformance/useGetPerformanceTiers";

export interface DashboardSchedule {
  id: string;
  cronString: CronString;
  performanceTier: SupportedPublicPerformanceTierKey;
  updatedAt: string;
  owner: DuneEntity;
}

export function useDashboardSchedule(
  session: SessionWithUser,
  dashboard_id: number
): DashboardSchedule | undefined {
  const result = useDashboardSchedulesQuery({
    context: { session },
    variables: { dashboard_id },
  });

  const schedule = result.data?.dashboard_schedules?.cron_jobs?.[0];

  if (
    schedule &&
    isDefined(schedule.cron_expression) &&
    isValidCronString(schedule.cron_expression) &&
    isDefined(schedule.performance) &&
    isSupportedPublicPerformanceTierKey(schedule.performance) &&
    isDefined(schedule.owned_by_customer_id)
  ) {
    return {
      id: schedule.id,
      cronString: schedule.cron_expression,
      performanceTier: schedule.performance,
      owner: externalCustomerId.parse(schedule.owned_by_customer_id),
      updatedAt: schedule.metadata.updated_at,
    };
  } else {
    return undefined;
  }
}

export function getRefetchDashboardScheduleOptions(
  session: SessionWithUser,
  dashboard_id: number
): PureQueryOptions {
  return {
    context: { session },
    query: DashboardSchedulesDocument,
    variables: { dashboard_id },
  };
}

export function clearDashboardScheduleCache(dashboard_id: number) {
  mutateDashboardSchedulesCache(dashboard_id, (cached) => {
    cached.dashboard_schedules.cron_jobs = [];
  });
}

function mutateDashboardSchedulesCache(
  dashboard_id: number,
  mutate: (cached: DashboardSchedulesQuery) => void
) {
  const cached = apolloCore.cache.readQuery<DashboardSchedulesQuery>({
    query: DashboardSchedulesDocument,
    variables: { dashboard_id },
  });

  if (!cached) {
    return;
  }

  apolloCore.cache.writeQuery<DashboardSchedulesQuery>({
    query: DashboardSchedulesDocument,
    variables: { dashboard_id },
    data: produce(cached, mutate),
  });
}

gql`
  query DashboardSchedules($dashboard_id: Int!) {
    dashboard_schedules(dashboard_id: $dashboard_id) {
      dashboard_id
      cron_jobs {
        id
        cron_expression
        performance
        owned_by_customer_id
        metadata {
          updated_at
        }
      }
    }
  }
`;
