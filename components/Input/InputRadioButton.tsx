/* eslint @typescript-eslint/strict-boolean-expressions: off */

import styles from "./styles/InputRadioButton.module.css";
import cn from "classnames";
import {
  forwardRef,
  InputHTMLAttributes,
  ReactElement,
  ReactNode,
  useMemo,
} from "react";
import { uniqueId } from "lodash";
import React from "react";

export const RadioButtonGroup = forwardRef<
  HTMLFieldSetElement,
  {
    name: string;
    children: Array<ReactElement<typeof InputRadioButton>>;
    value: string;
    onChange: (value: string) => void;
  }
>((props, ref) => {
  return (
    <fieldset className={styles.group} role="radiogroup" ref={ref}>
      {props.children.map((child, index) =>
        React.cloneElement(child as ReactElement<any>, {
          key: index,
          name: props.name,
          group: {
            onChange: props.onChange,
            value: props.value,
          },
        })
      )}
    </fieldset>
  );
});

interface InputRadioButtonProps {
  children: ReactNode;
  value: string;
  disabled?: boolean;
  hint?: ReactNode;
}

export const InputRadioButton = forwardRef<
  HTMLInputElement,
  Omit<InputHTMLAttributes<HTMLInputElement>, "onChange"> &
    InputRadioButtonProps & {
      // group comes from RadioButtonGroup
      group?: {
        value: string;
        onChange: (value: string) => void;
      };
    }
>((props, ref) => {
  const { hint, disabled, children, value, ...nativeProps } = props;

  const inputRadioId = useMemo(() => uniqueId("inputRadioId-"), []);
  const isChecked = props.group?.value === value;

  return (
    <div>
      <div className={cn(styles.radioButton, disabled && styles.disabled)}>
        <input
          id={inputRadioId}
          type="radio"
          onChange={() => props.group?.onChange(value)}
          defaultChecked={isChecked}
          disabled={disabled}
          ref={ref}
          {...nativeProps}
        />
        <label htmlFor={inputRadioId}>{children}</label>
      </div>
      {hint && (
        <div
          className={cn(styles.hint, disabled && styles.disabled)}
          aria-describedby={inputRadioId}
        >
          {hint}
        </div>
      )}
    </div>
  );
});
