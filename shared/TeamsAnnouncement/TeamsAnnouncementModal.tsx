import { ModalWithQueue } from "components/Modal";
import modal from "components/Modal/ModalContent.module.css";
import { Button } from "components/Button/Button";
import React, { useState } from "react";
import { tryLocalStorageGetItem } from "lib/storage/storage";
import { AnchorButton } from "components/Button/AnchorButton";
import { useSession } from "gui/session/session";
import image from "./assets/create-and-collaborate.gif";
import styles from "./TeamsAnnouncementModal.module.css";
import { useTeamsAnnouncement } from "./hooks/useTeamsAnnouncement";
import { BLOG_POST_LINK } from "./constants";

const Content = ({ close }: { close: () => void }) => {
  return (
    <div className={modal.body}>
      <img src={image.src} className={styles.image} />
      <div className={modal.header}>
        <div className={modal.titleRow}>
          <h2>New features!</h2>
        </div>
        <p className={modal.description}>
          The best work happens in teams. Try out new features like Folders and
          Query Scheduler for improved efficiency and easier collaboration!
        </p>
      </div>
      <div className={modal.buttons}>
        <Button size="M" theme="primary" onClick={close}>
          Got it
        </Button>
        <AnchorButton
          size="M"
          theme="tertiary"
          href={BLOG_POST_LINK}
          target="_blank"
        >
          Learn more
        </AnchorButton>
      </div>
    </div>
  );
};

export const TeamsAnnouncementModal = () => {
  const session = useSession();
  const [isOpen, setIsOpen] = useState(
    tryLocalStorageGetItem("teamsAnnouncementModalDismissed") !== "true"
  );

  const isFeatureEnabled = useTeamsAnnouncement();

  const close = () => {
    setIsOpen(false);
    localStorage.setItem("teamsAnnouncementModalDismissed", "true");
  };

  if (!isFeatureEnabled || !session || !session.user) {
    return null;
  }

  return (
    <ModalWithQueue
      size="M"
      label="Teams Announcement"
      queueKey="teams-announcement"
      isOpen={isOpen}
      onDismiss={close}
      content={<Content close={close} />}
    />
  );
};
