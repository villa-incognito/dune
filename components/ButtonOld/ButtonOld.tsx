import styles from "./ButtonOld.module.css";

import Link from "next/link";
import React from "react";
import cn from "classnames";
import { Size } from "gui/theme/theme";
import { TooltipOld } from "components/TooltipOld/TooltipOld";
import Row from "gui/layout/row";
import { Icon } from "gui/icon/icon";

interface ButtonProps {
  onClick?: (event: React.MouseEvent) => void;
  onMouseUp?: (event: React.MouseEvent) => void;
  type?: "submit";
  href?: string;
  target?: string;
  title?: string;
  className?: string;
  tabIndex?: number;

  disabled?: boolean;
  loading?: boolean;

  // Appearances (Some can be combined. Most render some others ineffectual. See CSS.)
  border?: boolean;
  color1?: boolean;
  color2?: boolean;
  colorDanger?: boolean;
  colorDangerLight?: boolean;
  gray?: boolean;
  light?: boolean;

  size?: Extract<Size, "xs" | "sm" | "md" | "lg" | "xl">;
}

export const ButtonOld: React.FC<ButtonProps> = (props) => {
  const className = cn(
    styles.button,
    props.border && styles.border,
    props.color1 && styles.color1,
    props.color2 && styles.color2,
    props.colorDanger && styles.danger,
    props.colorDangerLight && styles.dangerLight,
    props.gray && styles.gray,
    props.light && styles.light,
    styles[props.size ?? "md"],
    props.loading && styles.loading,
    props.disabled && styles.disabled,
    props.className
  );

  if (
    !props.onClick &&
    !props.onMouseUp &&
    !props.href &&
    props.type !== "submit"
  ) {
    return <span className={className}>{props.children}</span>;
  }

  if (props.href && props.href.startsWith("/")) {
    return (
      <Link href={props.href}>
        <a className={className} title={props.title} tabIndex={props.tabIndex}>
          {props.children}
        </a>
      </Link>
    );
  }

  if (props.href) {
    return (
      <a
        href={props.href}
        target={props.target}
        className={className}
        title={props.title}
        tabIndex={props.tabIndex}
      >
        {props.children}
      </a>
    );
  }
  return (
    <button
      type={props.type ?? "button"}
      className={className}
      onClick={props.onClick}
      onMouseUp={props.onMouseUp}
      disabled={props.disabled || props.loading}
      title={props.title}
      tabIndex={props.tabIndex}
    >
      {props.children}
    </button>
  );
};

interface TooltipProps {
  label: string;
  color?: "light-blue" | "gray" | "black";
  "aria-label"?: string;
  hidden?: boolean;
}

export interface ContainedButtonProps {
  onClick?: (event: React.MouseEvent) => void;
  type?: "submit";
  title?: string;
  className?: string;
  disabled?: boolean;
  loading?: boolean;
  border?: boolean;
  color1?: boolean;
  color2?: boolean;
  gray?: boolean;
  light?: boolean;
  size?: Extract<Size, "xs" | "sm" | "md" | "lg" | "xl">;
  toolTipProps?: TooltipProps;
}

export const ContainedButton: React.FC<ContainedButtonProps> = (props) => {
  const className = cn(
    styles.button,
    props.border && styles.border,
    props.color1 && styles.color1,
    props.color2 && styles.color2,
    props.gray && styles.gray,
    props.light && styles.light,
    props.size && styles[props.size],
    props.loading && styles.loading,
    props.className
  );
  const button = (
    <button
      type={props.type ?? "button"}
      className={className}
      onClick={props.onClick}
      disabled={props.disabled || props.loading}
      title={props.title}
    >
      {props.children}
    </button>
  );
  return (
    <>
      {props.toolTipProps && (
        <TooltipOld {...props.toolTipProps}>{button}</TooltipOld>
      )}
      {!props.toolTipProps && button}
    </>
  );
};

// CompleteStatus is often used next to a save button to indicate that an action is
// complete
export function CompleteStatus(props: { text: string }) {
  return (
    <Row className={styles["complete-status"]} gap="small">
      <Icon icon="check-filled" />
      <span>{props.text}</span>
    </Row>
  );
}
