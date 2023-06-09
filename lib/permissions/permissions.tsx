import { useSession } from "gui/session/session";
import { useTeamRole } from "lib/teams/teams";
import React from "react";

export function useHasAdminPermission(owner?: {
  type: "team" | "user";
  id: number;
}): boolean {
  return useHasRole(["admin"], owner);
}

export function useHasEditPermission(owner?: {
  type: "team" | "user";
  id: number;
}): boolean {
  return useHasRole(["admin", "editor"], owner);
}

export function useHasViewPermission(owner?: {
  type: "team" | "user";
  id: number;
}): boolean {
  return useHasRole(["admin", "editor", "view"], owner);
}

function useHasRole(
  roles: string[],
  owner?: {
    type: "team" | "user";
    id: number;
  }
): boolean {
  const previousResult = React.useRef<boolean>();
  const session = useSession();
  const { role: teamRole, loading } = useTeamRole(owner);

  if (!owner) {
    return false;
  }

  // To avoid flickering of button states, return the current result until we have established the new result (ie: loading is false)
  switch (owner.type) {
    case "user": {
      previousResult.current = session?.user?.id === owner.id;
      return previousResult.current;
    }

    case "team": {
      if (loading && previousResult.current) {
        return previousResult.current;
      }

      previousResult.current = roles.includes(teamRole ?? "viewer");

      return previousResult.current;
    }
  }
}
