import React from "react";
import styles from "gui/toast/toast.module.css";

export const Toast: React.FC = (props) => {
  return <aside className={styles.toast}>{props.children}</aside>;
};
