/* eslint @typescript-eslint/strict-boolean-expressions: off */

import styles from "./inputs.module.css";
import baseStyles from "./base.module.css";
import cn from "classnames";
import Row from "gui/layout/row";
import { Icon } from "gui/icon/icon";
import React from "react";
import { WidthType, FieldError } from "./utils";
import { InputHTMLAttributes, useState } from "react";
import uniqueId from "lodash/uniqueId";

interface TextInputBaseProps {
  label: string;
  icon?: string;
  value?: string;
  placeHolder: string;
  onChange: (value: string) => void;
  widthType?: WidthType;
  disabled?: boolean;
  inputType?: InputHTMLAttributes<Element>["type"];
  caption?: string;
  error?: string;
}

// The base input for forms with a stack on input fields.
// Small grey label that is close to the input field and
// an optional icon
// validation errors shown below field in red
export const TextInputBase: React.FC<TextInputBaseProps> = (props) => {
  const [errorId] = useState(uniqueId("text-input-err"));

  const className = cn(
    styles["text-input"],
    styles["text-input-base"],
    props.disabled && styles["disabled"],
    baseStyles[`width-type-${props.widthType || "standard"}`]
  );

  return (
    <label className={className}>
      <Row className={styles.label} gap="small" layout="baseline-aligned">
        {props.icon && (
          <Icon className={styles["label-icon"]} icon={props.icon}></Icon>
        )}
        <h3>{props.label}</h3>
      </Row>
      <input
        className={baseStyles.input}
        onChange={(e) => {
          props.onChange(e.target.value);
        }}
        placeholder={props.placeHolder}
        value={props.value || ""}
        readOnly={Boolean(props.disabled)}
        type={props.inputType}
        disabled={Boolean(props.disabled)}
        aria-describedby={errorId}
      >
        {props.children}
      </input>
      {props.caption && <div className={styles.caption}>{props.caption}</div>}
      {props.error && <FieldError id={errorId}>{props.error}</FieldError>}
    </label>
  );
};

interface TextInputWithHelperButtonProps {
  label: string;
  helperButtonText: string;
  helperButtonOnClick: () => void;
  placeHolder: string;
  onChange: (value: string) => void;
  value?: string;
  widthType?: WidthType;
  disabled?: boolean;
  inputType?: InputHTMLAttributes<Element>["type"];
  error?: string;
  caption?: string;
}

// Small grey label that is close to the input field
// - can add a text button that shows to the right of the label
// - validation errors shown below field in red
export const TextInputWithHelperButton: React.FC<TextInputWithHelperButtonProps> = (
  props
) => {
  const [errorId] = useState(uniqueId("text-input-err"));
  const className = cn(
    styles["text-input"],
    styles["text-input-base"],
    props.disabled && styles["disabled"],
    baseStyles[`width-type-${props.widthType || "standard"}`]
  );

  return (
    <label className={className}>
      <div className={styles["label-with-helper-button"]}>
        <h3>{props.label}</h3>
        <a
          className={styles["helper-button"]}
          onClick={props.helperButtonOnClick}
        >
          {props.helperButtonText}
        </a>
      </div>
      <input
        className={baseStyles.input}
        onChange={(e) => {
          props.onChange(e.target.value);
        }}
        type={props.inputType}
        value={props.value || ""}
        placeholder={props.placeHolder}
        readOnly={Boolean(props.disabled)}
        disabled={Boolean(props.disabled)}
        aria-describedby={errorId}
      >
        {props.children}
      </input>
      {props.error && <FieldError id={errorId}>{props.error}</FieldError>}
      {props.caption && (
        <caption className={styles.caption}>{props.caption}</caption>
      )}
    </label>
  );
};
