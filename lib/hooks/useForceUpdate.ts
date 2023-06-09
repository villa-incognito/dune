import { useReducer } from "react";

/*
 * `forceUpdate` hook by Dan Abramov
 * https://twitter.com/dan_abramov/status/1118301474876948480
 *
 * The `forceUpdate` function is a setter from `useReducer`, and will not
 * change between renders. (In other words, if it's used as a dependency
 * to another hook, it should never cause the other hook to rerender.)
 */
export function useForceUpdate() {
  return useReducer((x) => x + 1, 0)[1];
}
