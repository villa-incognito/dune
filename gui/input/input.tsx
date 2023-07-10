/* eslint @typescript-eslint/strict-boolean-expressions: off */

import React from "react";
import cn from "classnames";
import styles from "gui/input/input.module.css";
import { Icon } from "gui/icon/icon";
import { InputHTMLAttributes } from "react";
import { SelectHTMLAttributes } from "react";
import { Size } from "gui/theme/theme";
import { TextareaHTMLAttributes } from "react";

interface Props {
  icon?: string;
  size?: Extract<Size, "xs" | "sm" | "lg">;
  border?: "none";
}

export const InputText = React.forwardRef<
  HTMLInputElement,
  Omit<InputHTMLAttributes<HTMLInputElement>, "size"> & Props
>((props, ref) => {
  const { icon, size, border, ...rest } = props;

  const className = cn(
    styles.input,
    icon && styles.icon,
    size && styles[size],
    border && styles[`border-${border}`],
    props.disabled && styles.disabled
  );

  return (
    <div className={className}>
      {icon && <Icon icon={icon} />}
      <input {...rest} ref={ref} />
    </div>
  );
});

export const InputTextArea = React.forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement> & Props
>((props, ref) => {
  const { icon, size, border, ...rest } = props;

  const className = cn(
    styles.textarea,
    icon && styles.icon,
    size && styles[size],
    border && styles[`border-${border}`],
    props.disabled && styles.disabled
  );

  return (
    <div className={className}>
      {icon && <Icon icon={icon} />}
      <textarea {...rest} ref={ref} />
    </div>
  );
});

export const InputSelect = React.forwardRef<
  HTMLSelectElement,
  Omit<SelectHTMLAttributes<HTMLSelectElement>, "size"> & Props
>((props, ref) => {
  const { icon, size, border, ...rest } = props;

  const className = cn(
    styles.select,
    icon && styles.icon,
    size && styles[size],
    border && styles[`border-${border}`],
    props.disabled && styles.disabled
  );

  return (
    <div className={className}>
      {icon && <Icon icon={icon} />}
      <select {...rest} ref={ref}>
        {props.children}
      </select>
      <div className={styles.action}>
        <Icon icon="caret-down-fill" aria-hidden />
      </div>
    </div>
  );
});

export const InputCheckbox = React.forwardRef<
  HTMLInputElement,
  Omit<InputHTMLAttributes<HTMLInputElement>, "size"> & Props
>((props, ref) => {
  const { icon, size, border, children, ...rest } = props;

  const className = cn(
    styles.checkbox,
    icon && styles.icon,
    size && styles[size],
    border && styles[`border-${border}`],
    props.disabled && styles.disabled,
    props.className
  );

  return (
    <label className={className}>
      <input {...rest} type="checkbox" ref={ref} />
      {children}
    </label>
  );
});
