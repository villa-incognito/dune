import { httpPost, withRetry } from "../http/http";

export type Session = {
  sub: string;
  name: string;
  email: string;
  token: string;
  accessToken: string;
};

export type SessionListener = (session: Session) => void;

let session: Session | null = null;
let sessionRefreshPromise: Promise<Session> | null = null;
const listeners: Set<SessionListener> = new Set();

export function addListener(listener: SessionListener) {
  listeners.add(listener);
}

export function removeListener(listener: SessionListener) {
  listeners.delete(listener);
}

export function fetchSessionWithRetry() {
  return withRetry(
    () =>
      httpPost<Session>(
        // add timestamp as query param so that a semi-unique id for the request
        // will propogate through cloudflare and vercel. This is to help
        // understand why we are getting 524 errors.
        `/api/auth/session?t=${Date.now()}`,
        // If the request takes longer than 10s something has gone wrong.
        // Abort and try again.
        { timeoutMs: 10000 }
      ),
    { maxRetries: 3, retryIntervalMs: 1000 }
  );
}

export async function update() {
  if (sessionRefreshPromise === null) {
    sessionRefreshPromise = fetchSessionWithRetry();
    session = await sessionRefreshPromise;
    sessionRefreshPromise = null;

    for (const listener of listeners) {
      listener(session);
    }

    return session;
  } else {
    return await sessionRefreshPromise;
  }
}

export async function get() {
  if (sessionRefreshPromise !== null) {
    return await sessionRefreshPromise;
  }

  return session;
}
