// These constants are exported here by themselves to avoid
// webpack throwing errors when trying to import code from
// cognito.tsx that will run on the browser where access to
// libraries like `net` and `tls` are not available.
// See https://github.com/vercel/next.js/issues/7755

export const cookieIdToken = "auth-id-token";
export const cookieRefresh = "auth-refresh";
export const cookieUser = "auth-user";
export const cookieId = "auth-id";
