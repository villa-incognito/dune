/* eslint @typescript-eslint/strict-boolean-expressions: off */

import styles from "./Badge.module.css";
import cn from "classnames";

import { forwardRef } from "react";

import type { ReactNode } from "react";

interface Props {
  // Height:
  //    12px  16px  20px
  size: "S" | "M" | "L";
  variant: "filled" | "outlined";
  color:
    | "neutral"
    | "success"
    | "brand-blue"
    | "brand-orange"
    | "info"
    | "error"
    | "warning";
  // iconOnly should be set to true if badge only contains an icon.
  // Makes the badge square.
  iconOnly?: boolean;

  children: ReactNode;
}

export type { Props as BadgeProps };

// Demo: https://dune.com/ui/Badge
export const Badge = forwardRef<HTMLSpanElement, Props>((props, ref) => {
  const { size, color, variant } = props;

  return (
    <span
      className={cn(
        styles.badge,
        props.iconOnly && styles.iconOnly,
        styles[`size-${size}`],

        styles[`color-${color}`],
        styles[variant]
      )}
      ref={ref}
    >
      {props.children}
    </span>
  );
});
