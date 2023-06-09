import React from "react";
import styles from "gui/empty/empty.module.css";
import { Box } from "gui/box/box";

export const Empty: React.FC<{
  title?: string;
  icon?: string;
}> = (props) => {
  return (
    <Box
      icon={props.icon}
      title={props.title}
      className={styles.empty}
      color1
      text
    >
      {props.children}
    </Box>
  );
};
