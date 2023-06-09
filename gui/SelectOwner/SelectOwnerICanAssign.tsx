import React from "react";
import { Maybe, useListOtherTeamMembersQuery } from "lib/types/graphql";
import * as Sentry from "@sentry/react";
import { useRequiredSessionWithUser } from "gui/session/session";
import { gql } from "@apollo/client";
import { useHasAdminPermission } from "lib/permissions/permissions";
import { useMyTeams } from "shared/teams/useMyTeams";
import { SelectBox } from "components/Input/SelectBox";

type Owner = {
  type: "team" | "user";
  id: number;
  handle: string;
};

type OwnerWithLabel = Owner & { label: string };

/**
 * Renders\* a <select> with <option>s being:
 * - yourself
 * - each team to which you can assign\*\* content (you are admin or editor)
 *
 * \*If the only option is yourself, this component renders nothing.
 * \*\*Assign: (1) create content for, or (2) transfer content to (from yourself
 * or another team)
 */
export default function SelectOwnerICanAssign(props: {
  initialOwner: Owner;
  owner: Owner;
  setOwner: (owner: Owner) => void;
}) {
  const session = useRequiredSessionWithUser();
  const teams = useListUserTeams();
  const teamMembers = useListTeamMembers(props.initialOwner);

  const owners: OwnerWithLabel[] = React.useMemo(
    () => [
      {
        type: "user" as const,
        id: session.user.id,
        handle: session.user.name,
        label: `You - @${session.user.name}`,
      },
      ...teams.map((team) => ({
        type: "team" as const,
        id: team.id,
        handle: team.handle,
        label: `Team - @${team.handle}`,
      })),
      ...teamMembers.map((member) => ({
        type: "user" as const,
        id: member.user.id,
        handle: member.user.name,
        label: `Team ${member.role ?? "member"} - @${member.user.name}`,
      })),
    ],
    [session, teams, teamMembers]
  );

  function setOwner(value: string) {
    const owner = owners.find((o) => o.handle === value);

    if (!owner) {
      Sentry.captureException(
        new Error(`setOwner called with value="${value}" that doesn't exist`)
      );
      return;
    }

    props.setOwner({
      type: owner.type,
      handle: owner.handle,
      id: owner.id,
    });
  }

  if (teams.length === 0) {
    return null;
  }

  return (
    <SelectBox
      size="M"
      type="contained"
      label="Owner"
      placeholder="Select owner"
      value={props.owner.handle}
      onChange={(event) => setOwner(event.target.value)}
    >
      {owners.map((owner) => (
        <option value={owner.handle} key={owner.handle}>
          {owner.label}
        </option>
      ))}
    </SelectBox>
  );
}

function isNonNullable<T>(value?: T | null): value is NonNullable<T> {
  return value !== undefined && value !== null;
}

function useListUserTeams() {
  const session = useRequiredSessionWithUser();

  return useMyTeams(session).filter((team) =>
    ["admin", "editor"].includes(team.membership.role)
  );
}

function useListTeamMembers(owner: { type: "team" | "user"; id: number }) {
  const session = useRequiredSessionWithUser();
  const hasAdminPermission = useHasAdminPermission(owner);

  const { data } = useListOtherTeamMembersQuery({
    context: { session },
    variables: {
      user_id: session.user.id,
      team_id: owner.id,
    },
    skip: !(owner.type === "team" && hasAdminPermission),
  });

  return React.useMemo(
    () =>
      data?.memberships_private_details
        .map((m) =>
          m.user
            ? {
                role: m.role as Maybe<string> | undefined,
                user: m.user,
              }
            : undefined
        )
        .filter(isNonNullable) ?? [],
    [data]
  );
}

gql`
  query ListOtherTeamMembers($user_id: Int!, $team_id: Int!) {
    memberships_private_details(
      where: {
        user_id: { _neq: $user_id }
        team_id: { _eq: $team_id }
        status: { _eq: "invite_accepted" }
      }
      order_by: { role: desc }
    ) {
      user {
        id
        name
      }
      role
    }
  }
`;
