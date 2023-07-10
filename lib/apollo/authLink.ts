/* eslint @typescript-eslint/strict-boolean-expressions: off */

import { setContext } from "@apollo/client/link/context";
import { isServerSide } from "lib/env/env";

// The auth middleware sets authentication headers:
//
// * If we are on the backend with an admin key, use that key in a header.
// * If we have an API key, send the key instead of any user session info.
// * If we have a user session, send its token in the Authorization header.
// * If we have no keys and no session, send an empty API key header.
//
export const authLink = setContext((_, { headers, ...context }) => {
  const authHeaders: Record<string, string> = {};
  // In order to bypass Cloudflare's bot protection we set a shared secret
  // in the header for requests coming from our server.
  if (isServerSide()) {
    if (process.env.CLOUDFLARE_SHARED_SECRET) {
      authHeaders["x-cloudflare-secret"] = process.env.CLOUDFLARE_SHARED_SECRET;
    }
  } else {
    const urlParams = new URLSearchParams(window.location.search);
    const cloudflareSecret = urlParams.get("cloudflare-secret");
    if (cloudflareSecret) {
      authHeaders["x-cloudflare-secret"] = cloudflareSecret;
    }
  }
  if (context.adminKey) {
    authHeaders["X-Hasura-Admin-Secret"] = context.adminKey;
  } else if (context.apiKey) {
    authHeaders["X-Hasura-Api-Key"] = context.apiKey;
  } else if (context.session?.token) {
    authHeaders["Authorization"] = `Bearer ${context.session.token}`;
  } else {
    authHeaders["X-Hasura-Api-Key"] = "";
  }
  if (context.session?.accessToken) {
    authHeaders["X-Dune-Access-Token"] = context.session?.accessToken;
  }
  return {
    ...context,
    headers: { ...headers, ...authHeaders },
  };
});
