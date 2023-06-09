import {
  FindSessionUserDocument,
  FindSessionUserQuery,
  FindUserByOrbCustomerIdDocument,
  FindUserByOrbCustomerIdQuery,
  FindUserByOrbCustomerIdQueryVariables,
  FindUserByStripeIdDocument,
  FindUserByStripeIdQuery,
  FindUserByStripeIdQueryVariables,
} from "lib/types/graphql";
import { FindSessionUserQueryVariables } from "lib/types/graphql";
import { Session } from "lib/users/types";
import { SessionUserFragment } from "lib/types/graphql";
import { apolloCore } from "lib/apollo/apollo";
import { removeEmpty } from "lib/types/types";
import { removeNullable } from "lib/types/types";
import * as Sentry from "@sentry/react";
import { mustEnvVar } from "lib/env/env";

export const deletedUsername = "deleted";

export const callFindUserByStripeId = async (
  customerId: string,
  adminKey: string
): Promise<SessionUserFragment | undefined> => {
  const res = await apolloCore.query<
    FindUserByStripeIdQuery,
    FindUserByStripeIdQueryVariables
  >({
    query: FindUserByStripeIdDocument,
    variables: { customerId },
    context: { adminKey },
    fetchPolicy: "no-cache",
  });

  return removeNullable(removeEmpty(res.data.users[0]));
};

// Fetch info about the user that owns the current session.
export const callFindSessionUser = async (
  session: Session
): Promise<SessionUserFragment | undefined> => {
  const res = await apolloCore.query<
    FindSessionUserQuery,
    FindSessionUserQueryVariables
  >({
    query: FindSessionUserDocument,
    variables: { sub: session.sub },
    context: { session },
    fetchPolicy: "no-cache",
  });

  if (res.error) {
    Sentry.captureException(res.error.message);
    throw new Error(res.error.message);
  }

  return removeEmpty(res.data.users[0]);
};

export async function findUserByOrbCustomerId(customerId: string) {
  const adminKey = mustEnvVar("DUNE_HSR_CORE_ADMIN_SECRET");

  const res = await apolloCore.query<
    FindUserByOrbCustomerIdQuery,
    FindUserByOrbCustomerIdQueryVariables
  >({
    query: FindUserByOrbCustomerIdDocument,
    variables: { customerId },
    context: { adminKey },
    fetchPolicy: "no-cache",
  });

  return res.data.users[0];
}
