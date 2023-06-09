import styles from "./Notification.module.css";
import cn from "classnames";
import { IconButton } from "components/Button/IconButton";
import { IconWarning } from "components/Icons/IconWarning";
import { IconCross } from "components/Icons/IconCross";
import { IconCheckmark } from "components/Icons/IconCheckmark";
import { IconInformation } from "components/Icons/IconInformation";

import type { ReactNode } from "react";

interface Props {
  // Appearance:
  //      blue     gray        red       yellow      green
  level: "info" | "neutral" | "error" | "warning" | "success";

  // Content
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;

  // Options
  dismissable?: boolean; // default: true
  onDismiss?: () => void;
  showIcon?: boolean; // default: true

  // Controlled open state
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export function ControlledNotification(props: Props) {
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
      {showIcon && <NotificationIcon level={props.level} />}

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

function NotificationIcon(props: Pick<Props, "level">) {
  switch (props.level) {
    case "info":
    case "neutral":
      return <IconInformation />;
    case "error":
    case "warning":
      return <IconWarning />;
    case "success":
      return <IconCheckmark />;
  }
}
