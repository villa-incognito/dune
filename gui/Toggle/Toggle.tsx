/* eslint @typescript-eslint/strict-boolean-expressions: off */

import React from "react";
import styles from "./Toggle.module.css";
import cn from "classnames";
import { VisuallyHidden } from "@reach/visually-hidden";
import { Icon } from "gui/icon/icon";

interface Props {
  label: React.ReactNode;
  description?: React.ReactNode;
  enabled: boolean | undefined;
  disabled?: boolean;
  setEnabled: (enabled: boolean) => void;
  loading?: boolean;
  ariaLabel?: string;
}

export function Toggle(props: Props) {
  const toggle = () => props.setEnabled(!props.enabled);

  return (
    <label className={cn(styles.label, props.disabled && styles.disabled)}>
      {typeof props.enabled === "boolean" && (
        /*
         * Hide actual checkbox while indeterminate to:
         *
         * 1. Disable toggling until we can determine the value
         * 2. Prevent React warning about controlled/uncontrolled
         *    component when switching from undefined to true/false
         * 3. Avoid giving wrong info (when checked is undefined it is
         *    considered unchecked)
         */
        <VisuallyHidden>
          <input
            type="checkbox"
            checked={props.enabled}
            onChange={toggle}
            disabled={props.disabled}
            aria-label={props.ariaLabel}
          />
        </VisuallyHidden>
      )}

      <div
        aria-hidden="true"
        className={cn(
          styles.toggle,
          props.enabled && styles.on,
          props.enabled === undefined && styles.indeterminate
        )}
      >
        <div className={styles.circle} />
      </div>

      <div className={styles.text}>
        {props.label}
        <div className={styles.description}>{props.description}</div>
      </div>

      {props.loading && <Icon icon="running" className={styles.loading} />}
    </label>
  );
}
