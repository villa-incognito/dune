/* eslint @typescript-eslint/strict-boolean-expressions: off */

import styles from "./styles/SelectBox.module.css";
import cn from "classnames";
import { ReactNode, forwardRef, useMemo } from "react";
import { Warning as IconWarning } from "phosphor-react";
import uniqueId from "lodash/uniqueId";

type Size = "S" | "M" | "L";

type Type = "contained" | "outlined";

interface Props {
  size: Size;
  type: Type;
  placeholder: string;
  onChange: (event?: any) => void;
  value: string;
  name: string;
  children: ReactNode; // This should be the options for the select
  label?: ReactNode; // This can come with only text, but with an icon as well
  disabled?: boolean;
  hint?: ReactNode; // This can come with only text, but with an icon as well
  error?: string;
}

export const SelectBox = forwardRef<HTMLSelectElement, Props>((props, ref) => {
  const {
    size,
    type,
    placeholder,
    label,
    value,
    hint,
    error,
    onChange,
    disabled,
    children,
    name,
    ...nativeProps
  } = props;

  const selectBoxId = useMemo(() => uniqueId("selectBox-"), []);

  return (
    <div>
      {label && (
        <label htmlFor={selectBoxId} className={styles.label}>
          {label}
        </label>
      )}
      <div
        className={cn(
          styles.selectBox,
          styles[`size-${size}`],
          styles[`type-${type}`],
          disabled && styles.disabled,
          error && styles.selectBoxError
        )}
      >
        <select
          ref={ref}
          name={name}
          id={selectBoxId}
          onChange={onChange}
          value={value}
          disabled={disabled}
          {...nativeProps}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {children}
        </select>
      </div>
      {error && (
        <div className={styles.error} role="alert">
          <IconWarning />
          {error}
        </div>
      )}
      {hint && (
        <div className={styles.hint} aria-describedby={selectBoxId}>
          {hint}
        </div>
      )}
    </div>
  );
});
