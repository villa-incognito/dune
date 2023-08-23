import React, { useState } from "react";
import styles from "./Banner.module.css";
import { IconButton } from "components/Button/IconButton";
import { IconCross } from "components/Icons/IconCross";
import {
  tryLocalStorageGetItem,
  tryLocalStorageSetItem,
} from "lib/storage/storage";

export const BannerCTAs: React.FC = (props) => {
  return <div className={styles.ctas}>{props.children}</div>;
};

interface BannerProps {
  dismissable?: boolean;
  onUrlRegex?: RegExp;
  onDismiss?: () => void;
  id?: string;
}

export const Banner: React.FC<BannerProps> = (props) => {
  const { dismissable = false, id, onUrlRegex, onDismiss = () => {} } = props;
  // need an id to store in localstorage. Therefore it is not dismissable if there is no id
  const isDismissable = dismissable && id !== undefined;
  const [dismissed, setDismissed] = useState(
    isDismissable ? tryLocalStorageGetItem(id) === "dismissed" : false
  );

  if (dismissed) {
    return null;
  }
  if (onUrlRegex !== undefined && !onUrlRegex.test(window.location.pathname)) {
    return null;
  }

  const onDismissClicked = () => {
    setDismissed(true);
    if (id !== undefined) {
      tryLocalStorageSetItem(id, "dismissed");
    }
    onDismiss();
  };

  return (
    <div className={styles.banner}>
      {props.children}
      {isDismissable && (
        <IconButton
          theme="ghost"
          size="XS"
          className={styles.dismiss}
          onClick={onDismissClicked}
        >
          <IconCross />
        </IconButton>
      )}
    </div>
  );
};
