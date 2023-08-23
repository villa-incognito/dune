/* eslint @typescript-eslint/strict-boolean-expressions: off */

import styles from "./Notification.module.css";
import cn from "classnames";
import { IconButton } from "components/Button/IconButton";
import { IconWarning } from "components/Icons/IconWarning";
import { IconCross } from "components/Icons/IconCross";
import { IconCheckmark } from "components/Icons/IconCheckmark";
import { IconInformation } from "components/Icons/IconInformation";

import type { ReactNode } from "react";

export interface ControlledNotificationProps {
  // Appearance:
  //      blue     gray        red       yellow      green       brand-orange
  level: "info" | "neutral" | "error" | "warning" | "success" | "brand-orange";

  // Content
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;

  // Options
  dismissable?: boolean; // default: true
  onDismiss?: () => void;
  showIcon?: boolean; // default: true
  customIcon?: ReactNode; // overrides NotificationIcon

  // Controlled open state
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export function ControlledNotification(props: ControlledNotificationProps) {
  const { isOpen, setIsOpen, dismissable = true, showIcon = true } = props;

  if (!isOpen) {
    return null;
  }

  const onDismiss = () => {
    setIsOpen(false);

    if (props.onDismiss) {
      props.onDismiss();
    }
  };

  return (
    <div className={cn(styles.notification, styles[props.level])}>
      {props.customIcon ||
        (showIcon && <NotificationIcon level={props.level} />)}

      {dismissable && (
        <IconButton
          theme="ghost"
          size="XS"
          className={styles.dismiss}
          onClick={onDismiss}
        >
          <IconCross />
        </IconButton>
      )}

      <div className={styles.content}>
        <div className={styles.title}>{props.title}</div>
        {props.description && (
          <div className={styles.description}>{props.description}</div>
        )}
        {props.actions && (
          <div className={cn(styles.actions, styles[props.level])}>
            {props.actions}
          </div>
        )}
      </div>
    </div>
  );
}

function NotificationIcon(props: Pick<ControlledNotificationProps, "level">) {
  switch (props.level) {
    case "info":
    case "neutral":
    case "brand-orange":
      return <IconInformation />;
    case "error":
    case "warning":
      return <IconWarning />;
    case "success":
      return <IconCheckmark />;
  }
}
