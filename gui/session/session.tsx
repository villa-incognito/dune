import React from "react";
import { parseCookies } from "nookies";
import useSWR from "swr";
import { CSRFContext } from "gui/csrf/csrf";
import { Session, SessionWithUser } from "lib/users/types";
import { callFindSessionUser } from "lib/users/users";
import { HTTPError, httpPost } from "lib/http/http";
import { logger } from "lib/logger/browser";
import { tryLocalStorageListen } from "lib/storage/storage";
import { tryLocalStorageSetItem } from "lib/storage/storage";
import { cookieUser } from "lib/cognito/constants";
import * as Sentry from "@sentry/react";
import * as globalSession from "../../lib/auth/session";

export interface SessionContextValue {
  sessionLoading: boolean;
  session?: Session;
  logout: () => void;
  refresh: () => Promise<Boolean>;
}

// SessionContext holds the session object for current user.
// The session is undefined while fetching and when there is no session.
//
// On the server we treat the session as always loading to match the initial
// HTML. For example, the header user menu should be hidden during SSR.
//
export const SessionContext = React.createContext<SessionContextValue>(
  {} as never
);

export const SessionProvider: React.FC = (props) => {
  const { csrf } = React.useContext(CSRFContext);

  const { data, error, revalidate, mutate } = useSWR(
    "session-context-data",
    fetchSession,
    fetchOptions
  );

  React.useCallback(() => {
    const onSession = (session: globalSession.Session) => {
      mutate({ session });
    };

    globalSession.addListener(onSession);
    return () => globalSession.removeListener(onSession);
  }, []);

  // Perform a global logout, notify other tabs, and reload the page.
  const logout = React.useCallback(() => {
    httpPost("/api/auth", { csrf, action: "logout" })
      .then(() => triggerLogoutTabSync())
      .then(() => window.location.reload())
      .catch(logger.warn);
  }, [csrf]);

  // Setup storage event listeners that sync logouts across tabs.
  React.useEffect(() => {
    tryLocalStorageListen(handleLogoutTabSync);
  }, []);

  let session: Session | undefined;

  if (error) {
    /* eslint-disable no-console */
    if (error instanceof SessionUserNotFoundError) {
      // When the session user is not found it means that a user exists in Cognito but not in Hasura.
      // This is a weird state to be in. We handle this by setting the session to undefined.
      // This will treat all pages as if they are being accessed by an unauthenticated user.
      console.error("Session user not found");
      session = undefined;

      Sentry.captureException(error);
    } else if (error instanceof UserUnauthenticatedError) {
      // If a user is not authenticated then return an undefined session.
      // This will allow pages to treat the session as if there is no logged in user.
      console.error("User not authenticated");
      session = undefined;
    } else {
      // We treat all other errors as potentially ephemeral errors.
      // This means we will simply log the error and wait for the next refetch to try again
      console.error(error);
      session = data?.session;

      Sentry.captureException(error);
    }
  } else {
    session = data?.session;
  }

  const value = {
    sessionLoading: !data && !error,
    session: session,
    logout,
    refresh: revalidate,
  };

  return (
    <SessionContext.Provider value={value}>
      {props.children}
    </SessionContext.Provider>
  );
};

// Use session. undefined until session is fetched
export const useSession = (): Session | undefined => {
  const { session } = React.useContext(SessionContext);

  return session;
};

export const useSessionWithUser = (): SessionWithUser | undefined => {
  const { session } = React.useContext(SessionContext);

  if (!session?.user) {
    return undefined;
  }

  // This cast is guaranteed to be safe since we've already made
  // sure that user is present in the session object
  return session as SessionWithUser;
};

// For a lot of the hooks, a new session should not trigger a new request
// but whenever a new request is made, it should use the latest session.
// To solve this problem we wrap the session inside a ref which will always pass
// the shallow equality checks but when the `current` property is accessed it will
// refer to the latest session.
export const useSessionRef = (): React.MutableRefObject<
  Session | undefined
> => {
  const { session } = React.useContext(SessionContext);
  const s = React.useRef(session);
  React.useEffect(() => {
    s.current = session;
  }, [session]);
  return s;
};

// Get the session or throw if the user is not logged in.
// Useful when the session check happens further up the tree.
export const useRequiredSession = (): Session => {
  const { session } = React.useContext(SessionContext);

  if (!session) {
    throw new Error(`missing required session`);
  }

  return session;
};

export const useRequiredSessionWithUser = (): SessionWithUser => {
  const session = useRequiredSession();

  if (!session?.user) {
    throw new Error(`missing required SessionWithUser`);
  }

  // This cast is guaranteed to be safe since we've already made
  // sure that user is present in the session object
  return session as SessionWithUser;
};

// Check if the current user has a paid plan.
// A paid user is any user that belongs to a service tier that is not community (id === 1)
export const useSessionHasPaidPlan = (): boolean => {
  const { session } = React.useContext(SessionContext);
  switch (session?.user?.private_info?.service_tier) {
    case 1:
      return false;
    default:
      return true;
  }
};

// Check if watermarks should be shown for the current user.
export const useSessionShowWatermark = (): boolean => {
  const { session } = React.useContext(SessionContext);

  if (!session || !session.user?.user_service_tier) {
    return true;
  }

  // Since remove_watermark will be true if it can be removed
  // we need to return the negation of that to show the watermark
  return !session.user.user_service_tier.remove_watermark;
};

// shouldFetchSession will return false if the `auth-user` cookie is not present
function shouldFetchSession(): boolean {
  const cookies = parseCookies();
  return cookies[cookieUser] !== undefined;
}

class SessionUserNotFoundError extends Error {
  constructor(cognitoID: string) {
    super(`Session User not found: ${cognitoID}`);
  }
}
class UserUnauthenticatedError extends Error {}

// Fetch the Session object and permissions list for the current user.
// Returns `{ session: undefined }` if the user is logged out so that
// we can distinguish between pending data and logged out users.
const fetchSession = async () => {
  let session: Session | undefined;
  const emptySession = { session: undefined };
  if (!shouldFetchSession()) {
    return emptySession;
  }

  try {
    session = await globalSession.fetchSessionWithRetry();
  } catch (err: any) {
    if (err instanceof HTTPError && err.statusCode === 401) {
      throw new UserUnauthenticatedError();
    } else {
      throw err;
    }
  }

  if (session) {
    session.user = await callFindSessionUser(session);
    if (!session.user) {
      throw new SessionUserNotFoundError(session.sub);
    }
  }

  return { session };
};

// Handle logouts in other tabs by refreshing the page.
const handleLogoutTabSync = (event: StorageEvent) => {
  if (event.key === "auth-logout") {
    window.location.reload();
  }
};

// Trigger a page refresh in all other open tabs.
const triggerLogoutTabSync = () => {
  tryLocalStorageSetItem("auth-logout", new Date().toISOString());
};

// Options for the session fetch.
const fetchOptions = {
  refreshInterval: 60 * 1000 * 4, // 4 minutes. JWTs expire after 5 minutes.
  refreshWhenHidden: true,
  revalidateOnFocus: false,
  revalidateOnReconnect: true,
};
