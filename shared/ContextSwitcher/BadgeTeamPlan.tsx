import { Badge } from "components/Badge/Badge";

import { formattedPlanName } from "lib/plans/plans";

import type { Team } from "shared/teams/useMyTeams";

interface Props {
  team: Team;
}

export function BadgeTeamPlan(props: Props) {
  const planDisplayName = formattedPlanName(props.team.service_tier.name);

  if (planDisplayName === "Free") {
    return null;
  }

  return (
    <Badge size="M" variant="filled" color="brand-orange">
      {planDisplayName}
    </Badge>
  );
}
