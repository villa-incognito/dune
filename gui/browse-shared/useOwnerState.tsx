import useQueryParamState from "lib/queryParamState/useQueryParamState";
import { resetPagination } from "./usePaginationState";

interface Owner {
  type: "user" | "team";
  handle: string;
}

/*
 * Sync owner with two query params:
 * - ?user=arne   <--> { type: "user", handle: "arne" }
 * - ?team=potato <--> { type: "team", handle: "potato" }
 * - neither      <--> undefined
 */
export default function useOwnerState() {
  return useQueryParamState<Owner | undefined>(
    // Get owner from query
    function getOwner(query) {
      const { user, team } = query;

      if (typeof user === "string") {
        return { type: "user", handle: user } as const;
      }
      if (typeof team === "string") {
        return { type: "team", handle: team } as const;
      }
      return undefined;
    },

    // Get query from owner
    // (Only let one of the params have a value)
    function getQuery(owner) {
      if (owner) {
        switch (owner.type) {
          case "user":
            return {
              user: owner.handle,
              team: undefined,
            };
          case "team":
            return {
              user: undefined,
              team: owner.handle,
            };
        }
      }
      return {
        user: undefined,
        team: undefined,
      };
    },

    { onChangeTransform: resetPagination }
  );
}
