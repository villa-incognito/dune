/* eslint @typescript-eslint/strict-boolean-expressions: off */

import React from "react";
import styles from "./row.module.css";
import cn from "classnames";

interface Props {
  className?: string;
  layout?:
    | "center-aligned"
    | "baseline-aligned"
    | "start-aligned"
    | "end-aligned";
  gap?: "small" | "normal" | "wide";
}

// Row is a utility component for common horizontal stacked components
// add different layout types to the `layout` property to add more layout
// options. If you find yourself needing complexflex box options create
// a custom styled div instead. This component is to cover the primary
// flex box use cases.
const Row: React.FC<Props> = (props) => {
  const className = cn(
    styles.flex,
    styles[props.layout || "center-aligned"],
    styles[`gap-${props.gap || "normal"}`],
    props.className
  );
  return <div className={className}>{props.children}</div>;
};

export default Row;
