/* eslint @typescript-eslint/strict-boolean-expressions: off */

import { useRequiredSessionWithUser } from "gui/session/session";
import { useGetTeamUsageQuery } from "lib/types/graphql";
import { gql } from "@apollo/client";
import { MAX_VALUE } from "long";
import { UsageType } from "../../../../shared/Usage/types";

interface TeamUsage {
  usage: UsageType;
  releaseVersion: string;
}

const MAX_VALUE_HIGH = MAX_VALUE.high;

export const useTeamUsage = (teamId: number): TeamUsage | null => {
  const session = useRequiredSessionWithUser();

  const { data: teamUsageData } = useGetTeamUsageQuery({
    variables: {
      teamId: teamId,
    },
    context: { session },
    fetchPolicy: "cache-and-network",
  });

  const membersDetails = teamUsageData?.team_members_details[0];

  const serviceTier = membersDetails?.service_tier;

  if (!serviceTier) {
    return null;
  }

  const maxCredits = teamUsageData?.team_billable_usage.credits_included;
  const usedCredits = teamUsageData?.team_billable_usage.credits_used ?? 0;
  const maxCreditsWithOverage =
    !!maxCredits &&
    membersDetails.max_overage_cents !== null &&
    !!serviceTier.nanocredits_cost_cents
      ? Math.floor(
          maxCredits +
            membersDetails.max_overage_cents /
              serviceTier.nanocredits_cost_cents /
              10 ** 9
        )
      : null;

  return {
    usage: {
      maxPrivateQueries: serviceTier.max_private_queries ?? MAX_VALUE_HIGH,
      maxPrivateDashboards:
        serviceTier.max_private_dashboards ?? MAX_VALUE_HIGH,
      maxCSVDownloads: teamUsageData?.team_billable_usage.max_csv_downloads,
      maxExecutions: teamUsageData?.team_billable_usage.max_query_executions,
      maxDatapoints: teamUsageData?.team_billable_usage.max_datapoints_read,
      maxCredits,
      maxCreditsWithOverage,
      usedCredits,
      extraCreditsCents:
        teamUsageData?.team_billable_usage?.extra_credits_cents ?? 0,
      maxExtraCreditsCents:
        teamUsageData?.team_billable_usage?.max_extra_credits_cents,
      usedExecutions: teamUsageData?.team_billable_usage?.query_executions ?? 0,
      usedCSVDownloads: teamUsageData?.team_billable_usage?.csv_downloads ?? 0,
      usedDatapoints: teamUsageData?.team_billable_usage?.datapoints_read ?? 0,
      privateDashboardsCount:
        teamUsageData?.dashboards_aggregate.aggregate?.count ?? 0,
      privateQueriesCount:
        teamUsageData?.queries_aggregate.aggregate?.count ?? 0,
      creditsOverageProtectionDisabled:
        membersDetails.max_overage_cents === null,
      executionsOverageProtectionDisabled:
        membersDetails.max_executions_overage_cost_cents === null,
    },
    releaseVersion: serviceTier.release_version,
  };
};

gql`
  query GetTeamUsage($teamId: Int!) {
    dashboards_aggregate(
      where: {
        is_private: { _eq: true }
        is_archived: { _eq: false }
        team_id: { _eq: $teamId }
      }
    ) {
      aggregate {
        count
      }
    }

    queries_aggregate(
      where: {
        is_private: { _eq: true }
        is_archived: { _eq: false }
        is_temp: { _eq: false }
        team_id: { _eq: $teamId }
      }
    ) {
      aggregate {
        count
      }
    }

    team_members_details(where: { id: { _eq: $teamId } }) {
      id
      max_overage_cents
      max_executions_overage_cost_cents
      service_tier {
        id
        name
        base_monthly_price_dollars_cents
        max_private_dashboards
        max_private_queries
        release_version
        nanocredits_cost_cents
      }
    }

    team_billable_usage(team_id: $teamId) {
      query_executions
      csv_downloads
      max_csv_downloads
      max_query_executions
      max_datapoints_read
      datapoints_read
      credits_included
      credits_used
      extra_credits_cents
      max_extra_credits_cents
    }
  }
`;
