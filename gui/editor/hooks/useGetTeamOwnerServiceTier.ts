import { gql } from "@apollo/client";
import { useRequiredSessionWithUser } from "gui/session/session";
import { useGetTeamServiceTierQuery } from "lib/types/graphql";

interface Context {
  type: "user" | "team";
  id: number;
}

export function useGetTeamOwnerServiceTier(context?: Context) {
  const session = useRequiredSessionWithUser();
  const teamResult = useGetTeamServiceTierQuery({
    skip: !context || context.type !== "team",
    context: { session },
    fetchPolicy: "cache-first",
    variables: { teamId: context!.id },
  });

  return teamResult.data?.team_members_details[0].service_tier;
}

gql`
  query GetTeamServiceTier($teamId: Int!) {
    team_members_details(where: { id: { _eq: $teamId } }) {
      id
      service_tier {
        id
        release_version
      }
    }
  }
`;
