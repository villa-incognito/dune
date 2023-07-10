/* eslint @typescript-eslint/strict-boolean-expressions: off */

import createStore from "zustand";
import { useSessionWithUser } from "gui/session/session";
import { useMyTeamsIfLoggedIn } from "shared/teams/useMyTeams";
import { useAndRemoveQueryParam } from "lib/hooks/queryParams";
import { useState, useEffect } from "react";

import { pick } from "lodash";

import { ActiveContext, getUserContext, getTeamContext } from "./ActiveContext";
export type { ActiveContext };

/* localStorage */
const LS_KEY = "ContextSwitcher.ActiveContextId";

interface SavedContext {
  type: "user" | "team";
  id: number;
}

function isValidType(type: any): type is "user" | "team" {
  return ["user", "team"].includes(type);
}
function isValidId(id: any): id is number {
  return typeof id === "number" && Number.isInteger(id) && id > 0;
}
function isValidSavedContext(json: any): json is SavedContext {
  return (
    // non-null object
    typeof json === "object" &&
    json !== null &&
    isValidType(json.type) &&
    isValidId(json.id)
  );
}

const ls = {
  getSavedContext(): SavedContext | undefined {
    try {
      const jsonString = localStorage.getItem(LS_KEY);

      if (!jsonString) {
        return undefined;
      }

      const json = JSON.parse(jsonString);

      /*
       * Backwards compatibility:
       *
       * If it's stored on the old format, assume it's a team. This will
       * make the hook try to find a team with a matching id. If there
       * isn't one, it will fall back to using the user.
       */
      if (isValidId(json)) {
        return { type: "team", id: json };
      }

      if (isValidSavedContext(json)) {
        return pick(json, ["type", "id"]); // Omit unknown properties
      } else {
        return undefined;
      }
    } catch (error) {
      return undefined;
    }
  },
  setSavedContext(ctx: SavedContext) {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(pick(ctx, ["type", "id"])));
    } catch (error) {
      /* Sometimes localStorage isn't enabled, ignore. */
    }
  },
};

/* Store */
interface State {
  savedContext: SavedContext | undefined;
}

const initialState: State = {
  savedContext: ls.getSavedContext(),
};

const store = createStore<State>(() => initialState);
const useStore = store;

/* Hooks */

export function useActiveContext(): ActiveContext | undefined {
  const session = useSessionWithUser();
  const teams = useMyTeamsIfLoggedIn(session);

  const { savedContext } = useStore();

  if (!session) {
    /*
     * If we don't have session, we won't have any teams either, so
     * there cannot be any active context.
     */
    return undefined;
  }

  const userContext = getUserContext(session);

  // If no activeContext in localStorage, default to user
  if (!savedContext) {
    return userContext;
  }

  switch (savedContext.type) {
    case "user":
      /*
       * If `user.id` doesn't match `savedContext.id`, we'll default to
       * the logged in user anyway.
       */
      return userContext;

    case "team": {
      if (!teams) {
        return undefined;
      }

      const team = teams.find((team) => team.id === savedContext.id);

      if (team) {
        return getTeamContext(team);
      } else {
        // Default to user
        return userContext;
      }
    }
  }
}

export function useInjectSavedContextFromQueryParams() {
  const [asUser] = useState(useAndRemoveQueryParam("as-user"));
  const [asTeamHandle] = useState(useAndRemoveQueryParam("as-team"));

  const session = useSessionWithUser();
  const userIdToSet = asUser !== null && session?.user.id;

  const teams = useMyTeamsIfLoggedIn(session);
  const teamIdToSet =
    !asUser && // In case both params are set, treat it as only ?asUser
    teams?.find((team) => team.handle === asTeamHandle)?.id;

  useEffect(() => {
    if (userIdToSet) {
      setActiveContext({ type: "user", id: userIdToSet });
    } else if (teamIdToSet) {
      setActiveContext({ type: "team", id: teamIdToSet });
    }
  }, [userIdToSet, teamIdToSet]);
}

/* Actions */
export function setActiveContext(savedContext: SavedContext) {
  store.setState({ savedContext });
  ls.setSavedContext(savedContext);
}
