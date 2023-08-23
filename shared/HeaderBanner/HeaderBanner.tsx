import { JoinedForWorkButNoTeamBanner } from "./JoinedForWorkBanner/JoinedForWorkBanner";
import { useShouldShowJoinedForWorkButNoTeamBanner } from "./JoinedForWorkBanner/useShouldShowJoinedForWorkButNoTeamBanner";
import { MigrationBanner } from "./MigrationBanner/MigrationBanner";
import { useShowMigrationBanner } from "./MigrationBanner/useShowMigrationBanner";

export const HeaderBanner: React.FC = () => {
  const showMigrationBanner = useShowMigrationBanner();
  const showJoinedForWorkBanner = useShouldShowJoinedForWorkButNoTeamBanner();
  if (showMigrationBanner === "show") {
    return <MigrationBanner />;
  }
  if (
    showJoinedForWorkBanner === "show" &&
    showMigrationBanner === "dont-show"
  ) {
    return <JoinedForWorkButNoTeamBanner />;
  }
  return null;
};
