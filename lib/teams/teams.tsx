/* eslint @typescript-eslint/strict-boolean-expressions: off */

import { gql } from "@apollo/client";
import { useSession } from "gui/session/session";
import {
  FindSessionTeamPrivateInfoByIdDocument,
  FindSessionTeamPrivateInfoByIdQuery,
  FindSessionTeamPrivateInfoByIdQueryVariables,
  FindTeamByStripeIdDocument,
  FindTeamByStripeIdQuery,
  FindTeamByStripeIdQueryVariables,
  useFindTeamRoleQuery,
  useTeamMembersDetailsQuery,
} from "lib/types/graphql";
import { Session } from "../users/types";
import { apolloCore } from "../apollo/apollo";

export function useTeamHasPaidPlan(id: number | undefined) {
  const data = useTeamMembersDetails(id);
  return (
    Number(data?.teams_by_pk?.members_details?.service_tier_id) > 1 ?? false
  );
}

// Since hooks can't be called conditionally, this hook can be called
// even if owner is a user. Will however only fetch team if owner is a
// team.
//
// Returns the role of the logged-in user, if the user is a member of
// the team.
export function useTeamRole(owner?: {
  type: "team" | "user";
  id: number;
}): { role: string | undefined; loading: boolean } {
  const session = useSession();

  const result = useFindTeamRoleQuery({
    skip: !session?.user || owner?.type === "user",
    context: { session },
    variables: {
      user_id: session?.user?.id,
      team_id: owner?.id,
    },
  });

  if (!owner) {
    return { role: undefined, loading: result.loading };
  }

  const membership = result.data?.memberships[0];

  // Must have accepted the invite to be a true member
  if (membership?.private_details?.status === "invite_accepted") {
    return { role: membership.private_details.role, loading: result.loading };
  } else {
    return { role: undefined, loading: result.loading };
  }
}

function useTeamMembersDetails(id: number | undefined) {
  const session = useSession();
  const { data } = useTeamMembersDetailsQuery({
    skip: !session?.user?.id || !id,
    variables: { id: id! },
    context: { session },
  });
  return data;
}

export const callFindStripeCustomerIdByTeamId = async (
  session: Session,
  teamId: number
) => {
  const {
    data: { memberships_private_details },
  } = await callFindSessionTeamPrivateInfoById(session, Number(teamId));

  return memberships_private_details[0]?.team?.members_details
    ?.stripe_customer_id;
};

// Fetch info about team (session user must be admin of the team)
const callFindSessionTeamPrivateInfoById = async (
  session: Session,
  teamId: number
) =>
  apolloCore.query<
    FindSessionTeamPrivateInfoByIdQuery,
    FindSessionTeamPrivateInfoByIdQueryVariables
  >({
    query: FindSessionTeamPrivateInfoByIdDocument,
    variables: { teamId },
    context: { session },
    fetchPolicy: "no-cache",
  });

export const callFindTeamByStripeId = async (
  customerId: string,
  adminKey: string
) => {
  const { data } = await apolloCore.query<
    FindTeamByStripeIdQuery,
    FindTeamByStripeIdQueryVariables
  >({
    query: FindTeamByStripeIdDocument,
    variables: { stripe_customer_id: customerId },
    context: { adminKey },
    fetchPolicy: "no-cache",
  });

  return data.teams[0];
};

gql`
  query FindTeamByStripeId($stripe_customer_id: String!) {
    teams(where: { stripe_customer_id: { _eq: $stripe_customer_id } }) {
      id
      orb_customer_id
    }
  }
`;

gql`
  query FindSessionTeamPrivateInfoById($teamId: Int!) {
    memberships_private_details(where: { team: { id: { _eq: $teamId } } }) {
      team {
        members_details {
          stripe_customer_id
        }
      }
    }
  }
`;

gql`
  query TeamMembersDetails($id: Int!) {
    teams_by_pk(id: $id) {
      id
      members_details {
        id
        service_tier_id
      }
    }
  }
`;

gql`
  query FindTeamRole($user_id: Int, $team_id: Int) {
    memberships(
      where: { user_id: { _eq: $user_id }, team_id: { _eq: $team_id } }
    ) {
      id
      team_id
      private_details {
        role
        status
      }
    }
  }
`;

export const assertValidTeamHandle = (handle: string): boolean => {
  if (
    handle.length < 1 ||
    handle.length >= 42 ||
    !/^[a-zA-Z0-9_-]+$/.test(handle)
  ) {
    return false;
  }
  return true;
};
