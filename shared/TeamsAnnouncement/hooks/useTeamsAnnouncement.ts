import { useIsFeatureEnabled } from "lib/hooks/useIsFeatureEnabled";

export const useTeamsAnnouncement = () => {
  return (
    useIsFeatureEnabled("teams-announcement") &&
    new Date() > new Date("2023-07-17T00:00:00.000Z") &&
    new Date() < new Date("2023-07-26T00:00:00.000Z")
  );
};
