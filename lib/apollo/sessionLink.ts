import * as globalSession from "../auth/session";
import { PromiseApolloLink } from "./link";

export const sessionLink = new PromiseApolloLink(async (operation, forward) => {
  const session = await globalSession.get();

  if (session !== null) {
    const context = operation.getContext();

    if (context.session !== undefined) {
      operation.setContext({
        ...context,

        // Since we do optimistic refreshing of the session in the React code,
        // the cached global session we got might be older
        //
        // TODO: Compare the two sessions and choose the newest
        session,
      });
    }
  }

  const result = await forward(operation);

  if (result.errors !== undefined) {
    for (const error of result.errors) {
      if (
        error.extensions?.code === "invalid-jwt" &&
        error.message.indexOf("JWTExpired") >= 0
      ) {
        // JWT has expired, so we'll update the session and retry
        const session = await globalSession.update();

        operation.setContext({
          ...operation.getContext(),
          session,
        });

        return await forward(operation);
      }
    }
  }

  return result;
});
