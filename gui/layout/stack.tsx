/* eslint @typescript-eslint/strict-boolean-expressions: off */

import React from "react";
import styles from "./stack.module.css";
import cn from "classnames";

interface Props {
  className?: string;
  layout?: "left-aligned";
  gap?: "none" | "xsmall" | "small" | "normal" | "large";
}

// Stack is a utility component for common vertically stacked components
// add different layout types to the `layout` property to add more layout
// options. If you find yourself needing complex flexbox options create
// a custom styled div instead. This component is to cover the primary
// flex box use cases.
const Stack: React.FC<Props> = (props) => {
  const className = cn(
    styles.flex,
    styles[props.layout || "left-aligned"],
    styles[`gap-${props.gap || "normal"}`],
    props.className
  );
  return <div className={className}>{props.children}</div>;
};

export default Stack;
