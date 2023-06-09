import React from "react";
import useSWR from "swr";
import { CSRFContext } from "gui/csrf/csrf";
import { Session } from "lib/users/types";
import { SessionContext } from "gui/session/session";

// Run a fetcher function when the session and CSRF tokens are ready.
// The session argument will be undefined if the user is not logged in.
export const useTokenFetch = <T,>(
  keys: unknown[],
  fn: (csrf: string, session?: Session) => Promise<T>,
  options = {}
) => {
  const { session, sessionLoading } = React.useContext(SessionContext);
  const { csrf } = React.useContext(CSRFContext);
  const sessionRef = React.useRef(session);
  sessionRef.current = session;
  const fetcher = () => {
    if (csrf && !sessionLoading) {
      return fn(csrf, sessionRef.current);
    }
  };

  return useSWR([...keys, csrf, sessionLoading, sessionRef], fetcher, {
    refreshWhenHidden: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    shouldRetryOnError: false,
    ...options,
  });
};
