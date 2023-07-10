/* eslint @typescript-eslint/strict-boolean-expressions: off */

import styles from "./buttonTextOnlyThemes.module.css";
import cn from "classnames";

export type Theme = "primary" | "secondary" | "tertiary" | "danger";

interface Props {
  theme: Theme;
  active?: boolean;
}

export function getThemeClassName(props: Props) {
  return cn(
    styles.button,
    props.active && "active",
    styles[`theme-${props.theme}`]
  );
}
