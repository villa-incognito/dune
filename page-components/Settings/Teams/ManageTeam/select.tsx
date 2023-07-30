/* eslint @typescript-eslint/strict-boolean-expressions: off */

import styles from "./select.module.css";
import cn from "classnames";
import React from "react";
import { WidthType } from "gui/form/utils";
import { TooltipOld } from "components/TooltipOld/TooltipOld";

interface SelectBaseProps {
  id: string;
  value: string;
  options: { key: string; display?: string }[];
  onChange: (value: string) => void;
  label?: string;
  caption?: string | React.ReactElement;
  widthType?: WidthType;
  disabled?: boolean;
  className?: string;
  tooltipContent?: string | React.ReactNode;
}

export const SelectBase: React.FC<SelectBaseProps> = (props) => {
  const className = cn(
    styles.select,
    props.disabled && styles.disabled,
    styles["select-wrapper"],
    styles[`width-type-${props.widthType || "standard"}`],
    props.className ?? null
  );

  return (
    <div>
      {props.label && (
        <label htmlFor={props.id} className={styles.label}>
          <h3>{props.label}</h3>
        </label>
      )}
      <TooltipOld
        color="gray"
        hidden={!props.disabled || !props.tooltipContent}
        label={props.tooltipContent}
      >
        <div className={className}>
          <select
            disabled={props.disabled}
            id={props.id}
            value={props.value}
            onChange={(e) => {
              props.onChange(e.target.value);
            }}
          >
            {props.options.map((opt) => (
              <option key={opt.key} value={opt.key}>
                {opt.display || opt.key}
              </option>
            ))}
          </select>
        </div>
      </TooltipOld>
      {props.caption && <div className={styles.caption}>{props.caption}</div>}
    </div>
  );
};
