/* eslint @typescript-eslint/strict-boolean-expressions: off */

import React from "react";
import cn from "classnames";
import styles from "gui/page/page.module.css";
import { Size } from "gui/theme/theme";

interface Props {
  as?: string;
  id?: string;
  triangle1?: boolean;
  triangle2?: boolean;
  className?: string;
  style?: React.CSSProperties;
  size?: Extract<Size, "sm" | "md" | "lg">;
}

export const PageMain: React.FC<Props> = (props) => {
  const componentProps = {
    ...props,
    as: "main",
  };

  return React.createElement(Page, componentProps, props.children);
};

export const Page: React.FC<Props> = (props) => {
  const as = props.as ?? "div";

  const className = cn(
    styles.page,
    props.triangle1 && styles.triangle1,
    props.triangle2 && styles.triangle2,
    props.size && styles[props.size],
    props.className
  );

  const componentProps = {
    className,
    id: props.id,
    style: props.style,
  };

  return React.createElement(
    as,
    componentProps,
    <div className={styles.children}>{props.children}</div>
  );
};
