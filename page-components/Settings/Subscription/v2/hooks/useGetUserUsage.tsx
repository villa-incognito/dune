import { gql } from "@apollo/client";
import { useRequiredSessionWithUser } from "gui/session/session";
import { MAX_VALUE_HIGH } from "gui/SettingsPage/Subscription/UsageSection/components";
import { useGetUserUsageQuery } from "lib/types/graphql";

export const useGetUserUsage = () => {
  const session = useRequiredSessionWithUser();

  const { data: userUsageData } = useGetUserUsageQuery({
    context: { session },
    variables: { id: session?.user?.id ?? NaN },
    fetchPolicy: "cache-and-network",
  });

  const apiServiceTier = session.user?.api_user_service_tier;
  const serviceTier = userUsageData?.users_by_pk?.service_tier;
  const user = userUsageData?.users_by_pk;

  if (!user || !serviceTier) {
    return null;
  }

  const maxCredits = userUsageData?.billable_usage?.credits_included;
  const usedCredits = userUsageData?.billable_usage?.credits_used ?? 0;
  const maxOverageCents = user.private_info?.max_overage_cents;
  const maxCreditsWithOverage =
    !!maxCredits &&
    maxOverageCents !== null &&
    !!serviceTier.nanocredits_cost_cents
      ? Math.floor(
          maxCredits +
            maxOverageCents / serviceTier.nanocredits_cost_cents / 10 ** 9
        )
      : null;

  return {
    maxPrivateQueries: serviceTier.max_private_queries ?? MAX_VALUE_HIGH,
    maxPrivateDashboards: serviceTier.max_private_dashboards ?? MAX_VALUE_HIGH,
    maxCSVDownloads: serviceTier.csv_downloads_per_month,
    maxExecutions: serviceTier.included_query_executions,
    maxDatapoints: apiServiceTier?.included_datapoints,
    maxCredits,
    maxCreditsWithOverage,
    usedCredits,
    extraCreditsCents: userUsageData?.billable_usage?.extra_credits_cents ?? 0,
    maxExtraCreditsCents:
      userUsageData?.billable_usage?.max_extra_credits_cents,
    usedExecutions: userUsageData?.billable_usage?.query_executions ?? 0,
    usedCSVDownloads: userUsageData?.billable_usage?.csv_downloads ?? 0,
    usedDatapoints: userUsageData?.billable_usage?.datapoints_read ?? 0,
    privateDashboardsCount:
      userUsageData?.dashboards_aggregate.aggregate?.count ?? 0,
    privateQueriesCount: userUsageData?.queries_aggregate.aggregate?.count ?? 0,
    creditsOverageProtectionDisabled:
      user.private_info?.max_overage_cents === null,
    executionsOverageProtectionDisabled:
      user.max_executions_overage_cost_cents === null,
  };
};

gql`
  query GetUserUsage($id: Int!) {
    users_by_pk(id: $id) {
      id
      max_executions_overage_cost_cents
      private_info {
        max_overage_cents
      }
      service_tier: user_service_tier {
        id
        max_private_queries
        max_private_dashboards
        csv_downloads_per_month
        included_query_executions
        nanocredits_cost_cents
      }
    }

    dashboards_aggregate(
      where: {
        is_private: { _eq: true }
        is_archived: { _eq: false }
        team_id: { _is_null: true }
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
        team_id: { _is_null: true }
      }
    ) {
      aggregate {
        count
      }
    }

    billable_usage {
      query_executions
      csv_downloads
      datapoints_read
      credits_used
      credits_included
      extra_credits_cents
      max_extra_credits_cents
    }
  }
`;
