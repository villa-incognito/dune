import React, { useState } from "react";
import { useRouter } from "next/router";
import {
  tryLocalStorageGetItem,
  tryLocalStorageSetItem,
} from "lib/storage/storage";
import styles from "./CookieNotification.module.css";
import { IconInformation } from "components/Icons/IconInformation";
import { Button } from "components/Button/Button";
import CookieModal from "./CookieModal";

const CURRENT_COOKIE = "cookieNotificationV2Dismissed";
const CURRENT_PERFORMANCE_COOKIE = "performanceCookiesAllowed";

export default function CookieNotification() {
  const [dismissed, setDismissed] = useState(
    tryLocalStorageGetItem(CURRENT_COOKIE) === "true"
  );
  const [visible, setVisible] = useState(true);
  const handleDismiss = (performanceCookiesAllowed: boolean) => {
    setDismissed(true);
    tryLocalStorageSetItem(CURRENT_COOKIE, "true");
    tryLocalStorageSetItem(
      CURRENT_PERFORMANCE_COOKIE,
      performanceCookiesAllowed.toString()
    );
    setVisible(false);
  };

  const screenshotMode = useRouter().query.ref === "screenshot";

  if (dismissed || !visible || screenshotMode) {
    return null;
  }

  return (
    <div className={styles.notification}>
      <div>
        <span className={styles.notificationIcon}>
          <IconInformation />
        </span>
        <p>
          We use cookies to improve your experience on our site. By using this
          website you agree to our{" "}
          <a href="/privacy" target="_blank">
            Cookie Policy
          </a>
          .
        </p>
        <div className={styles.notificationActions}>
          <CookieModal handleDismiss={handleDismiss} />
          <Button theme="primary" size="S" onClick={() => handleDismiss(true)}>
            Accept
          </Button>
        </div>
      </div>
    </div>
  );
}
