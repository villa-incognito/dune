/* eslint @typescript-eslint/strict-boolean-expressions: off */

import React from "react";
import cn from "classnames";
import styles from "./ButtonGroup.module.css";

export const ButtonGroup: React.FC<{
  as?: string;
  className?: string;
  right?: boolean;
  "aria-live"?: "polite";
}> = (props) => {
  const as = props.as ?? "div";

  const componentProps = {
    className: cn(styles.group, props.right && styles.right, props.className),
    "aria-live": props["aria-live"],
  };

  return React.createElement(as, componentProps, props.children);
};
