import cn from "classnames";
import modalContent from "components/Modal/ModalContent.module.css";
import modal from "components/Modal/ModalContent.module.css";
import styles from "./SelectPlan.module.css";
import { IconMagicWand } from "components/Icons/IconMagicWand";
import { IconClockHistory } from "components/Icons/IconClockHistory";
import { IconDatabase } from "components/Icons/IconDatabase";
import { IconPeopleThree } from "components/Icons/IconPeopleThree";
import { PlansSection } from "./PlansSection";
import { DialogContent } from "@reach/dialog";
import React from "react";

interface Props {
  onMigrate: (plan: string) => void;
  trackClick: (action: string) => void;
  close: () => void;
}

export const SelectPlan = ({ onMigrate, trackClick, close }: Props) => (
  <DialogContent
    className={cn(modalContent["size-XL"])}
    aria-label="migration-dialog"
  >
    <div className={cn(modal.body)}>
      <div className={styles.container}>
        <div className={modal.header}>
          <div className={modal.titleRow}>
            <h1>Choose a new plan for a more powerful Dune</h1>
          </div>
          <p className={modal.description}>
            Simplify workflows with features designed for automation and
            collaboration.
          </p>
        </div>
      </div>
      <ul className={styles.infoBox}>
        <li>
          <IconMagicWand />
          <span>Use Natural Language Queries to enhance productivity</span>
        </li>
        <li>
          <IconClockHistory />
          <span>Automate queries with Scheduled Queries</span>
        </li>
        <li>
          <IconDatabase />
          <span>
            Upload and integrate your off chain data for better insights
          </span>
        </li>
        <li>
          <IconPeopleThree />
          <span>Create and collaborate with teams of any size</span>
        </li>
      </ul>
      <PlansSection
        onMigrate={onMigrate}
        close={close}
        trackClick={trackClick}
      />
    </div>
  </DialogContent>
);
