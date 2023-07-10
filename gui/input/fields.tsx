/* eslint @typescript-eslint/strict-boolean-expressions: off */

import React from "react";
import cn from "classnames";
import styles from "gui/input/fields.module.css";
import { AuthError } from "lib/api/auth";
import { ButtonGroup } from "components/ButtonOld/ButtonGroup";
import { Icon } from "gui/icon/icon";
import { Size } from "gui/theme/theme";
import { hasOwnProperty } from "lib/types/types";

export const Fields: React.FC<{
  horizontal?: boolean;
  size?: Extract<Size, "xs" | "sm">;
}> = (props) => {
  const className = cn(
    styles.fields,
    props.horizontal && styles.horizontal,
    props.size && styles[props.size]
  );

  return <div className={className}>{props.children}</div>;
};

export const FieldLabel: React.FC<{
  label: React.ReactNode;
  caption?: React.ReactNode;
  size?: Extract<Size, "xs">;
  children: React.ReactElement<any>; // Use single element to get correct gaps
}> = (props) => {
  const className = cn(styles.field, props.size && styles[props.size]);

  return (
    <label className={className}>
      {props.label && <div className={styles.label}>{props.label}</div>}
      {props.children}
      {props.caption && <div className={styles.caption}>{props.caption}</div>}
    </label>
  );
};

export const FieldError: React.FC<{
  error: AuthError | Error;
}> = (props) => {
  return (
    <p role="alert" className={styles.error}>
      {hasOwnProperty(props.error, "label")
        ? props.error.label
        : props.error.message}
    </p>
  );
};

export const FieldText: React.FC<{
  as?: string;
}> = (props) => {
  return React.createElement(
    props.as ?? "p",
    { className: styles.text },
    props.children
  );
};

export const FieldButtons: React.FC = (props) => {
  return (
    <ButtonGroup className={cn(styles.field, styles.buttons)}>
      <div>{props.children}</div>
    </ButtonGroup>
  );
};

// LeftButtons wraps the buttons in a ButtonGroup and stacks them
// from left to right.
export const LeftButtons: React.FC = (props) => {
  return (
    <ButtonGroup className={cn(styles["left-buttons"], styles.buttons)}>
      {props.children}
    </ButtonGroup>
  );
};

export const FieldHelp: React.FC = (props) => {
  return <p className={cn(styles.field)}>{props.children}</p>;
};

export const FieldLegal: React.FC = (props) => {
  return <p className={cn(styles.legal)}>{props.children}</p>;
};

export const FieldFooter: React.FC<{ className?: string }> = (props) => {
  return (
    <footer className={cn(styles.field, styles.footer, props.className)}>
      {props.children}
    </footer>
  );
};

export function ExpandableField(props: {
  label: React.ReactNode;
  initialState: "open" | "closed";
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = React.useState(props.initialState === "open");

  return (
    <div className={styles.expandable}>
      <label className={styles.label}>
        <button
          type="button"
          onClick={(event) => {
            event.preventDefault();
            setIsOpen((open) => !open);
          }}
          className={styles.label}
        >
          {props.label}
          {!isOpen ? (
            <Icon icon="caret-down-fill" />
          ) : (
            <Icon icon="caret-up-fill" />
          )}
        </button>
      </label>
      {isOpen && props.children}
    </div>
  );
}
