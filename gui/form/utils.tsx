import React from "react";
import { Icon } from "gui/icon/icon";
import Row from "gui/layout/row";
import styles from "./utils.module.css";

// Input fields often have a set width for their input in order to provide
// a consistent layout on the page as opposed to a bunch of inputs of different
// lengths. We currently support the following width types:
// __standard__: Attempts to stretch to the end of the container but has a max
//               width set of 400 px.
// __long__: Attempts to stretch to the end of the container but has a max
//           width set of 600 px.
// __full_length__: Stretches to the full length of the container
export type WidthType = "standard" | "long" | "full-length";

export interface ValidationError {
  error: string;
  icon?: string;
}

export const FieldError: React.FC<{ id: string }> = (props) => {
  return (
    <Row gap="small" className={styles["field-error"]}>
      <Icon className={styles["field-error-icon"]} icon="warning" />
      {/* id is used for linking the error with the field it produced for a11y */}
      <span id={props.id}>{props.children}</span>
    </Row>
  );
};
