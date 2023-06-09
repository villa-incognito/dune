import React from "react";
import cn from "classnames";
import styles from "gui/box/box.module.css";
import { Icon } from "gui/icon/icon";
import { Size } from "gui/theme/theme";

export interface BoxProps {
  as?: string;
  icon?: string;
  title?: string;
  role?: string;
  className?: string;
  text?: boolean;
  border?: boolean;
  light?: boolean;
  gray?: boolean;
  color1?: boolean;
  color2?: boolean;
  size?: Extract<Size, "sm">;
}

export const Box: React.FC<BoxProps> = (props) => {
  const as = props.as ?? "div";

  const className = cn(
    styles.box,
    props.text && styles.text,
    props.icon && styles.icon,
    props.border && styles.border,
    props.light && styles.light,
    props.gray && styles.gray,
    props.color1 && styles.color1,
    props.color2 && styles.color2,
    props.size && styles[props.size],
    props.className
  );

  const children = (
    <>
      {props.title && <h2 className={styles.title}>{props.title}</h2>}
      {props.icon && <Icon icon={props.icon} className={styles.background} />}
      <div className={styles.children}>{props.children}</div>
    </>
  );

  const componentProps = {
    className,
    role: props.role,
  };

  return React.createElement(as, componentProps, children);
};
