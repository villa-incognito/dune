/* eslint @typescript-eslint/strict-boolean-expressions: off */

import styles from "./buttonThemes.module.css";
import cn from "classnames";

export type Theme =
  | "primary"
  | "secondary"
  | "primary-light"
  | "secondary-light"
  | "tertiary"
  | "danger"
  | "ghost";

interface Props {
  theme: Theme;
  active?: boolean;
  loading?: boolean; // Only applicable for actual <button>, not for <a>
}

export function getThemeClassName(props: Props) {
  return cn(
    styles.button,
    props.active && "active",
    props.loading && styles.loading,
    styles[`theme-${props.theme}`]
  );
}
