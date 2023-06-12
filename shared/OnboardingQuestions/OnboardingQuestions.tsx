import modal from "components/Modal/ModalContent.module.css";
import modalOverlay from "components/Modal/ModalOverlay.module.css";
import cn from "classnames";
import { useEffect, useState } from "react";
import { DialogContent, DialogOverlay } from "@reach/dialog";
import { useSession } from "gui/session/session";
import { Content } from "./Content";
import { useWindowSize } from "@reach/window-size";

export function OnboardingQuestions() {
  const session = useSession();
  const skippedOnboardingQsUntil =
    session?.user?.private_info?.onboarding_qs_skipped_until;
  const hasSkippedBefore = skippedOnboardingQsUntil !== null;
  const skippedExpired = isOnboardingQsSkippedExpired(skippedOnboardingQsUntil);

  const [isOpen, setIsOpen] = useState(skippedExpired);
  const isDesktop = useWindowSize().width > 999;

  useEffect(() => {
    setIsOpen(skippedExpired);
  }, [skippedExpired]);

  if (!session || !session.user || !isOpen || !isDesktop) {
    return null;
  }

  const onDismiss = () => {
    setIsOpen(false);
  };

  return (
    <>
      <DialogOverlay isOpen={isOpen} className={modalOverlay.overlay}>
        <DialogContent
          className={cn(modal.contentWrapper, modal[`size-M`])}
          aria-label="Onboarding Questions"
        >
          <Content
            session={session}
            userId={session.user.id}
            onDismiss={onDismiss}
            hasSkippedBefore={hasSkippedBefore}
          />
        </DialogContent>
      </DialogOverlay>
    </>
  );
}

function isOnboardingQsSkippedExpired(skippedOnboardingQs: string | null) {
  const currentDate = new Date();

  // if it was never set OR if date is in the past
  return (
    skippedOnboardingQs === null || new Date(skippedOnboardingQs) < currentDate
  );
}
