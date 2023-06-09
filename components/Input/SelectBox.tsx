import styles from "./styles/SelectBox.module.css";
import cn from "classnames";
import { ReactNode, useMemo } from "react";
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
  children: ReactNode; // This should be the options for the select
  label?: ReactNode; // This can come with only text, but with an icon as well
  disabled?: boolean;
  hint?: ReactNode; // This can come with only text, but with an icon as well
  error?: string;
}

export function SelectBox(props: Props) {
  const { size, type, placeholder, label, value, hint, error } = props;

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
          props.disabled && styles.disabled,
          error && styles.selectBoxError
        )}
      >
        <select
          id={selectBoxId}
          onChange={props.onChange}
          value={value}
          disabled={props.disabled}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {props.children}
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
}
