import { Badge } from "components/Badge/Badge";

import { formattedPlanName } from "lib/plans/plans";

import type { SessionWithUser } from "lib/users/types";

interface Props {
  session: SessionWithUser;
}

export function BadgeUserPlan(props: Props) {
  const planDisplayName = formattedPlanName(
    props.session.user.user_service_tier.name
  );

  if (planDisplayName === "Free") {
    return null;
  }

  return (
    <Badge size="M" variant="filled" color="brand-orange">
      {planDisplayName}
    </Badge>
  );
}
