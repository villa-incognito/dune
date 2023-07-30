/* eslint @typescript-eslint/strict-boolean-expressions: off */

import { Notification } from "components/Notification";
import styles from "./PlansSection.module.css";
import { IconLoading } from "components/Icons/IconLoading";
import React from "react";
import { useRequiredSessionWithUser } from "gui/session/session";
import {
  Team_Service_Tiers,
  useGetTeamServiceTierInfoByNameQuery,
  User_Service_Tiers,
} from "lib/types/graphql";
import { formattedPlanName } from "lib/plans/plans";
import { Button } from "components/Button/Button";
import cn from "classnames";
import { AnchorButton } from "components/Button/AnchorButton";
import { IconCoins } from "components/Icons/IconCoins";
import { Badge } from "components/Badge/Badge";

const v2Plan: Record<number, string> = {
  3: "plus",
  4: "premium",
};

interface PlanCardProps {
  plan: Pick<
    Team_Service_Tiers | User_Service_Tiers,
    | "id"
    | "name"
    | "description"
    | "base_monthly_price_dollars_cents"
    | "csv_downloads_per_month"
    | "max_private_dashboards"
    | "max_private_queries"
    | "max_query_event_retention_days"
    | "release_version"
    | "included_query_executions"
    | "included_nanocredits"
  >;
  type: "compare" | "migrate";
  onClick?: (plan: string) => void;
}

const PlanCard = ({ plan, type, onClick }: PlanCardProps) => {
  const credits =
    plan.release_version === "v1"
      ? Math.round((plan.included_query_executions ?? 0) * 10)
      : Math.round(plan.included_nanocredits / 10 ** 9);

  const clickHandler = () => {
    if (onClick) {
      onClick(plan.name);
    }
  };

  return (
    <div className={cn(styles.planCard, styles[type])}>
      <h2>
        <span>{formattedPlanName(plan.name)}</span>
        <div className={styles.planBadge}>
          {type === "compare" ? (
            <Badge size="L" variant="filled" color="neutral">
              Current
            </Badge>
          ) : (
            <Badge size="L" variant="filled" color="brand-blue">
              Recommended
            </Badge>
          )}
        </div>
      </h2>
      <p className={styles.secondary}>{plan.description}</p>
      <div className={styles.price}>
        <h2>${plan.base_monthly_price_dollars_cents / 100}</h2>
        <sub>/mo</sub>
      </div>
      <hr />
      <ul>
        <li>
          <strong>{credits}</strong> Credits{" "}
          {plan.release_version === "v1" ? (
            `(${credits / 10} Medium executions)`
          ) : (
            <IconCoins />
          )}
        </li>
        <li>
          <strong>{plan.csv_downloads_per_month}</strong> CSV exports
        </li>
        <li>
          <strong>{plan.max_private_dashboards}</strong> Private dashboards
        </li>
        <li>
          <strong>{plan.max_private_queries}</strong> Private queries
        </li>
        <li>
          <strong>{plan.max_query_event_retention_days} Days</strong> version
          history
        </li>
      </ul>
      {type === "compare" && (
        <AnchorButton
          theme="tertiary"
          size="M"
          href="/subscription/migrate"
          onClick={clickHandler}
        >
          Compare all plans
        </AnchorButton>
      )}

      {type === "migrate" && (
        <Button size="M" theme="secondary" onClick={clickHandler}>
          Migrate to {formattedPlanName(plan.name)}
        </Button>
      )}
    </div>
  );
};

interface Props {
  onMigrate?: (plan: string) => void;
  close: () => void;
  trackClick: (action: string) => void;
}

export const PlansSection = ({ onMigrate, close, trackClick }: Props) => {
  const session = useRequiredSessionWithUser();
  const userServiceTier = session?.user?.user_service_tier;
  const recommendedPlanFn = useGetTeamServiceTierInfoByNameQuery({
    variables: {
      service_tier_name: v2Plan[userServiceTier?.id] ?? "plus",
    },
    context: { session },
    fetchPolicy: "cache-first",
  });

  const recommendedPlan = recommendedPlanFn.data?.team_service_tiers[0];
  const isLoading =
    recommendedPlanFn.loading || recommendedPlanFn.error || !recommendedPlan;

  return (
    <section className={styles.container}>
      <div className={styles.plans}>
        {isLoading && (
          <div className={styles.loading}>
            <IconLoading />
          </div>
        )}
        {!!recommendedPlan && (
          <>
            <PlanCard
              plan={userServiceTier}
              type="compare"
              onClick={() => {
                trackClick("compare_plans");
                close();
              }}
            />
            <PlanCard
              plan={recommendedPlan}
              type="migrate"
              onClick={onMigrate}
            />
          </>
        )}
      </div>
      <Notification
        level="info"
        title="Migrate to a new plan and bring your existing queries, dashboards and api keys with you."
        dismissable={false}
      />
    </section>
  );
};
