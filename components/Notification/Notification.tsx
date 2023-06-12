import { ControlledNotification } from "./ControlledNotification";

import type { ReactNode } from "react";

import { useState } from "react";

export interface Props {
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
}

export function Notification(props: Props) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <ControlledNotification {...props} isOpen={isOpen} setIsOpen={setIsOpen} />
  );
}
