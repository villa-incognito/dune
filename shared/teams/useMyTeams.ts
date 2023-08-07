/* eslint @typescript-eslint/strict-boolean-expressions: off */

import {
  useListUserMembershipsQuery,
  ListUserMembershipsDocument,
  ListUserMembershipsQuery,
  ListUserMembershipsQueryVariables,
} from "lib/types/graphql";
import { useSession } from "gui/session/session";

import type { Session, SessionWithUser } from "lib/users/types";
import type { Teams, Team_Service_Tiers } from "lib/types/graphql";
import { gql } from "@apollo/client";
import { apolloCore } from "lib/apollo/apollo";

export type Team = Pick<
  Teams,
  "id" | "name" | "handle" | "profile_image_url"
> & {
  service_tier: Pick<
    Team_Service_Tiers,
    | "id"
    | "name"
    | "release_version"
    | "is_public"
    | "csv_downloads_per_month"
    | "included_datapoints"
    | "included_nanocredits"
    | "max_folders"
  >;
  membership: {
    role: string;
    status: string;
  };
};

export function useMyTeams(session: SessionWithUser): Array<Team> {
  return useMyTeamsQuery(session).list;
}

export function useMyTeamsQuery(
  session: SessionWithUser
): { list: Array<Team>; loading: boolean; error: boolean } {
  const result = useListUserMembershipsQuery({
    context: { session },
    variables: {
      user_id: session.user.id,
      user_email: session.email,
    },
  });

  const teams =
    result.data?.memberships_private_details
      .map(({ team, role, status }) => ({
        ...team,
        membership: { role, status },
      }))
      .filter((team): team is Team => !!team)
      .filter((team) => team.membership.status === "invite_accepted") ?? [];

  return {
    list: teams,
    loading: result.loading,
    error: Boolean(result.error),
  };
}

export function useMyTeamsIfLoggedIn(
  session: Session | undefined
): undefined | Array<Team> {
  const result = useListUserMembershipsQuery({
    skip: !session?.user?.id,
    context: { session },
    variables: {
      user_id: session?.user?.id,
      user_email: session?.email,
    },
  });

  if (!result.data) {
    return undefined;
  }

  return result.data.memberships_private_details
    .map(({ team, role, status }) => ({
      ...team,
      membership: { role, status },
    }))
    .filter((team): team is Team => !!team)
    .filter((team) => team.membership.status === "invite_accepted");
}

// Includes invites that have not yet been accepted
export function useMyTeamsAndInvites({
  fetchPolicy,
}: {
  fetchPolicy: "cache-and-network" | "cache-first";
}) {
  const session = useSession();

  return useListUserMembershipsQuery({
    skip: !session || !session.user,
    variables: { user_id: session?.user?.id, user_email: session?.email },
    context: { session },
    fetchPolicy,
  });
}

export function refetchMyTeams(session: SessionWithUser) {
  return apolloCore.query<
    ListUserMembershipsQuery,
    ListUserMembershipsQueryVariables
  >({
    context: { session },
    query: ListUserMembershipsDocument,
    variables: { user_id: session.user.id, user_email: session.email },
    fetchPolicy: "network-only",
  });
}

gql`
  query ListUserMemberships($user_id: Int, $user_email: String) {
    memberships_private_details(
      where: {
        _or: [
          { user_id: { _eq: $user_id } }
          # Sometimes a user is invited to a team by email before they have an account
          { email: { _eq: $user_email } }
        ]
      }
      order_by: [{ status: desc }, { role: desc }]
    ) {
      id
      role
      status
      team {
        id
        name
        handle
        profile_image_url
        service_tier {
          id
          name
          release_version
          is_public
          csv_downloads_per_month
          included_datapoints
          included_nanocredits
          max_folders
        }
      }
    }
  }
`;
