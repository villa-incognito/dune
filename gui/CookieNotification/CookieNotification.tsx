import { useState } from "react";
import { useRouter } from "next/router";
import { IconCross } from "components/Icons/IconCross";
import {
  tryLocalStorageGetItem,
  tryLocalStorageSetItem,
} from "lib/storage/storage";
import styles from "./CookieNotification.module.css";
import { IconInformation } from "components/Icons/IconInformation";
import { IconButton } from "components/Button/IconButton";

export default function CookieNotification() {
  const [dismissed, setDismissed] = useState(
    tryLocalStorageGetItem("cookieNotificationDismissed") === "true"
  );
  const [visible, setVisible] = useState(true);

  const handleDismiss = () => {
    setDismissed(true);
    tryLocalStorageSetItem("cookieNotificationDismissed", "true");
    setVisible(false);
  };

  const screenshotMode = useRouter().query.ref === "screenshot";

  if (dismissed || !visible || screenshotMode) {
    return null;
  }

  return (
    <div className={styles.notification}>
      <div>
        <IconInformation />
        <p>
          We use necessary cookies to perform the services and prevent attacks.
          For more information, please see our{" "}
          <a href="/privacy" target="_blank">
            Cookies Policy
          </a>
          .
        </p>
        <IconButton theme="ghost" size="XS" onClick={handleDismiss}>
          <IconCross />
        </IconButton>
      </div>
    </div>
  );
}
