import { useSession } from "gui/session/session";
import { useActiveContext } from "shared/ContextSwitcher/store";
import styles from "./MigrationDialog.module.css";
import modalOverlay from "components/Modal/ModalOverlay.module.css";
import modal from "components/Modal/ModalContent.module.css";
import cn from "classnames";
import { IconButton } from "components/Button/IconButton";
import { IconCross } from "components/Icons/IconCross";
import { DialogOverlay, DialogContent } from "@reach/dialog";
import { useRef, useState } from "react";
import {
  tryLocalStorageGetItem,
  tryLocalStorageSetItem,
} from "lib/storage/storage";
import { AnchorButton } from "components/Button/AnchorButton";
import { useAnalytics } from "gui/analytics/analytics";

const VERSION = "v1";
const STORAGE_KEY = "migrationDialog";
const STORAGE_VIEWED_KEY = "migrationDialogViewed";
const TITLE = "Reminder";
const DESCRIPTION =
  "You're still on your old plan. Switch now to start using the new Dune!";
const CTA = "Migrate plan";

export function MigrationDialog() {
  const activeContext = useActiveContext();
  const { captureEvent } = useAnalytics();
  const session = useSession();
  const { serviceTierId } = session?.user?.private_info ?? {};

  // Event tracking
  const viewedRef = useRef(
    tryLocalStorageGetItem(STORAGE_VIEWED_KEY) === VERSION
  );

  const [dismissed, setDismissed] = useState(
    tryLocalStorageGetItem(STORAGE_KEY) === VERSION
  );
  const [isOpen, setIsOpen] = useState(!dismissed);

  const buttonRef = useRef<HTMLAnchorElement>(null);

  if (
    dismissed ||
    !isOpen ||
    !serviceTierId ||
    // Only show banner when the user is selected as activeContext
    activeContext?.type !== "user" ||
    activeContext.serviceTier.hasCustomPlan ||
    // Must know the user's serviceTierId
    !session?.user?.private_info?.serviceTierId ||
    // Only show if user on Thug Life or Elite
    (serviceTierId !== 3 && serviceTierId !== 4)
  ) {
    return null;
  }

  const trackClick = (action: string, serviceTierId: number) => {
    captureEvent(`Migration dialog: ${action}`, {
      serviceTierId,
      version: VERSION,
    });
  };

  const handleClose = (action: string) => {
    trackClick(action, serviceTierId);
    tryLocalStorageSetItem(STORAGE_KEY, VERSION);
    setIsOpen(false);
    setDismissed(true);
  };

  if (!viewedRef.current) {
    viewedRef.current = true;

    trackClick("view", serviceTierId);
    tryLocalStorageSetItem(STORAGE_VIEWED_KEY, VERSION);
  }

  return (
    <DialogOverlay
      isOpen={isOpen}
      className={modalOverlay.overlay}
      initialFocusRef={buttonRef}
    >
      <DialogContent
        className={cn(modal.contentWrapper, modal[`size-S`])}
        aria-label={"migration-dialog"}
      >
        <div className={cn(modal.body)}>
          <div className={modal.header}>
            <div className={modal.titleRow}>
              <h2 className={styles.title}>{TITLE}</h2>
              <IconButton
                size="XS"
                theme="ghost"
                onClick={() => handleClose("dismiss")}
              >
                <IconCross />
              </IconButton>
            </div>

            <p className={modal.description}>{DESCRIPTION}</p>
          </div>

          <div className={modal.buttons}>
            <AnchorButton
              size="M"
              theme="primary"
              href="/subscription/migrate"
              onClick={() => handleClose("migrate")}
              ref={buttonRef}
            >
              {CTA}
            </AnchorButton>
          </div>
        </div>
      </DialogContent>
    </DialogOverlay>
  );
}
