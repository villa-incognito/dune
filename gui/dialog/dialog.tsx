/* eslint @typescript-eslint/strict-boolean-expressions: off */

import React from "react";
import cn from "classnames";
import styles from "gui/dialog/dialog.module.css";
import { DialogContent } from "@reach/dialog";
import { DialogOverlay } from "@reach/dialog";
import { Icon } from "gui/icon/icon";
import { Size } from "gui/theme/theme";
import { Button } from "../../components/Button/Button";

function stopPropagation(e: React.MouseEvent<HTMLElement>) {
  e.stopPropagation();
}

export interface DialogProps {
  label: string;
  isOpen: boolean;
  onDismiss: () => void;
  className?: string;
  size?: Extract<Size, "xs" | "sm" | "md" | "lg">;
}

export const Dialog: React.FC<DialogProps> = (props) => {
  const className = cn(
    styles.content,
    props.size && styles[props.size],
    props.className
  );

  // Make sure props.onDismiss is called without args.
  const onDismiss = () => {
    props.onDismiss();
  };

  return (
    <DialogOverlay
      isOpen={props.isOpen}
      onDismiss={onDismiss}
      className={styles.overlay}
      onMouseDown={stopPropagation}
    >
      <DialogContent className={className} aria-label={props.label}>
        {props.children}
      </DialogContent>
    </DialogOverlay>
  );
};

export const DialogButton: React.FC<{
  label: string;
  size?: DialogProps["size"];
  disabled?: boolean;
  children: (onDismiss: () => void) => React.ReactNode;
}> = (props) => {
  const [dialog, setDialog] = React.useState(false);
  const onDialog = () => setDialog((prev) => !prev);

  return (
    <>
      <Button
        onClick={onDialog}
        disabled={props.disabled}
        size="M"
        theme="tertiary"
      >
        {props.label}
      </Button>
      <Dialog {...props} isOpen={dialog} onDismiss={onDialog} size={props.size}>
        {props.children(onDialog)}
      </Dialog>
    </>
  );
};

export const DialogButtonPlain: React.FC<{
  label: string;
  icon?: string;
  iconAndLabel?: boolean;
  className?: string;
  size?: DialogProps["size"];
  children: (onDismiss: () => void) => React.ReactNode;
}> = (props) => {
  const [dialog, setDialog] = React.useState(false);
  const onDialog = () => setDialog((prev) => !prev);

  return (
    <>
      <button type="button" onClick={onDialog} className={props.className}>
        {props.icon ? <Icon icon={props.icon} /> : null}
        {props.iconAndLabel || !props.icon ? props.label : null}
      </button>
      <Dialog {...props} isOpen={dialog} onDismiss={onDialog} size={props.size}>
        {props.children(onDialog)}
      </Dialog>
    </>
  );
};
