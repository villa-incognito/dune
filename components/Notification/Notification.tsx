import {
  ControlledNotification,
  ControlledNotificationProps,
} from "./ControlledNotification";

import { useState } from "react";

export type NotificationProps = Omit<
  ControlledNotificationProps,
  "isOpen" | "setIsOpen"
>;

export function Notification(props: NotificationProps) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <ControlledNotification {...props} isOpen={isOpen} setIsOpen={setIsOpen} />
  );
}
