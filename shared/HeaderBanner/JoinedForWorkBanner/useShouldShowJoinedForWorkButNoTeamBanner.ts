import { useSessionWithUser } from "gui/session/session";
import { useIsFeatureEnabled } from "src/hooks/useIsFeatureEnabled";
import { useListUserMembershipsQuery } from "lib/types/graphql";

export const useShouldShowJoinedForWorkButNoTeamBanner = ():
  | "show"
  | "dont-show"
  | "loading" => {
  const session = useSessionWithUser();
  const isFlagEnabled = useIsFeatureEnabled(
    "prompt-joined-for-work-but-not-team-banner"
  );
  const result = useListUserMembershipsQuery({
    skip: session?.user?.id === undefined,
    context: { session },
    variables: {
      user_id: session?.user?.id,
      user_email: session?.email,
    },
  });

  if (result.loading || result.error !== undefined) {
    return "loading";
  }

  if (session === undefined || !isFlagEnabled) {
    return "dont-show";
  }

  const userHasNoTeams = () => {
    return (
      result.data !== null &&
      result.data !== undefined &&
      result.data.memberships_private_details.length === 0
    );
  };
  const userSignedUpMoreThan7DaysAgo = () => {
    const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000;
    return (
      Date.now() - new Date(session.user.created_at).valueOf() > sevenDaysInMs
    );
  };
  const userJoinedForJob = () => {
    return session.user.onboarding_questions?.brings_to_dune === "job";
  };

  if (
    userJoinedForJob() &&
    userHasNoTeams() &&
    userSignedUpMoreThan7DaysAgo()
  ) {
    return "show";
  }
  return "dont-show";
};
