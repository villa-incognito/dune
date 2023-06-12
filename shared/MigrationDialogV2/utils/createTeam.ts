import { apolloCore } from "lib/apollo/apollo";
import { CreateTeamDocument } from "lib/types/graphql";
import { Session } from "lib/users/types";

export const createTeam = async (
  username: string,
  session: Session
): Promise<string> => {
  const handle = `${username}_team`;

  await apolloCore.mutate({
    mutation: CreateTeamDocument,
    context: { session },
    variables: {
      name: handle,
      handle,
    },
  });

  return handle;
};
