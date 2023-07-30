import modalOverlay from "./ModalOverlay.module.css";
import modalContent from "./ModalContent.module.css";
import cn from "classnames";

import { DialogContent, DialogOverlay } from "@reach/dialog";

import type { ReactElement } from "react";

export interface ModalWithoutTriggerProps {
  size: "S" | "M" | "L";
  label: string;
  content: ReactElement;

  isOpen: boolean;
  // Can be undefined if you don't want to close on Escape or click outside
  onDismiss: (() => void) | undefined;
}

export function ModalWithoutTrigger(props: ModalWithoutTriggerProps) {
  const { size, label, content, isOpen, onDismiss } = props;

  return (
    <DialogOverlay
      isOpen={isOpen}
      onDismiss={onDismiss}
      className={modalOverlay.overlay}
    >
      <DialogContent
        className={cn(
          modalContent.contentWrapper,
          modalContent[`size-${size}`]
        )}
        aria-label={label}
      >
        {content}
      </DialogContent>
    </DialogOverlay>
  );
}
