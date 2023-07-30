import { useEffect, useState } from "react";
import { useSession } from "gui/session/session";
import { ModalWithQueue } from "components/Modal";
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
    <ModalWithQueue
      size="M"
      label="Onboarding Questions"
      queueKey="onboarding-questions"
      content={
        <Content
          session={session}
          userId={session.user.id}
          onDismiss={onDismiss}
          hasSkippedBefore={hasSkippedBefore}
        />
      }
      isOpen={isOpen}
      onDismiss={undefined}
    />
  );
}

function isOnboardingQsSkippedExpired(skippedOnboardingQs: string | null) {
  const currentDate = new Date();

  // if it was never set OR if date is in the past
  return (
    skippedOnboardingQs === null || new Date(skippedOnboardingQs) < currentDate
  );
}
