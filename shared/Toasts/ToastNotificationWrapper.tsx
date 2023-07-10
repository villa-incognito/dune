/* eslint @typescript-eslint/strict-boolean-expressions: off */

import styles from "./ToastNotificationsWrapper.module.css";

import { ControlledNotification } from "components/Notification/ControlledNotification";

import {
  useToastNotifications,
  removeToastNotification,
} from "./toastNotificationStore";

export function ToastNotificationWrapper() {
  const notifications = useToastNotifications();

  return (
    <div className={styles.wrapper}>
      {notifications.map((notification, i, a) => (
        <div
          key={notification.id}
          className={styles.toast}
          ref={setElementStyles(a.length - i)}
        >
          <div className={styles.content}>
            <ControlledNotification
              {...notification.props}
              isOpen
              setIsOpen={(open) => {
                if (!open) {
                  removeToastNotification(notification.id);
                }
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

const setElementStyles = (toastNo: number) => (node: HTMLDivElement | null) => {
  if (!node) {
    return;
  }

  const contentNode: any = node.childNodes[0];

  if (!contentNode) {
    return;
  }

  const height = contentNode.getBoundingClientRect().height;

  node.setAttribute(
    "style",
    `--toast-no: ${toastNo};
     --content-height: ${height / 10}rem;`
  );
};
