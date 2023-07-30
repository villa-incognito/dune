import { useSession } from "gui/session/session";
import { MigrationDialogV2 } from "shared/MigrationDialogV2/MigrationDialogV2";
import { OnboardingQuestions } from "shared/OnboardingQuestions/OnboardingQuestions";
import { TeamsAnnouncementModal } from "../TeamsAnnouncement/TeamsAnnouncementModal";

// This component is used to prompt users with different dialogs
export function PromptDialogs() {
  const session = useSession();

  if (!session) {
    return null;
  }

  // If the user is on Thug Life or Elite, show the migration dialog
  // Otherwise, show the onboarding questions
  if (
    session.user?.private_info?.serviceTierId === 3 ||
    session.user?.private_info?.serviceTierId === 4
  ) {
    return <MigrationDialogV2 persistInStorage />;
  } else {
    return (
      <>
        <OnboardingQuestions />
        <TeamsAnnouncementModal />
      </>
    );
  }
}
