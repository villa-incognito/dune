import { httpPost } from "../http/http";

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

export async function update() {
  if (sessionRefreshPromise === null) {
    sessionRefreshPromise = httpPost<Session>("/api/auth/session");
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
