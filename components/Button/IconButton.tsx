import styles from "./styles/IconButton.module.css";
import cn from "classnames";
import { getThemeClassName, Theme } from "./styles/buttonThemes";

import { forwardRef } from "react";

import type { ReactElement } from "react";

// Height    20  | 24  | 32  | 40 (px)
type Size = "XS" | "S" | "M" | "L";

/*
 * Theme and size are required instead of having a default.
 * This makes it easier to refactor the prop names and values.
 *
 * It also means you don't have to check what the defaults are to figure
 * out what size/theme a specific button has, since they will always be
 * specified.
 */
export interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  theme: Theme;
  size: Size;
  // Expect a single element as children.
  // This button is intended to contain an SVG icon and nothing else.
  children: ReactElement;

  disabled?: boolean;
  active?: boolean;
  loading?: boolean;

  onClick?: (event: React.MouseEvent) => void;
}

export const IconButton = forwardRef<HTMLButtonElement, Props>((props, ref) => {
  const {
    theme,
    size,
    active,
    loading,
    disabled,
    className,
    ...nativeProps
  } = props;

  return (
    <button
      disabled={disabled || loading}
      className={cn(
        styles.iconButton,
        getThemeClassName({ theme, active, loading }),
        styles[`size-${size}`],
        className
      )}
      ref={ref}
      {...nativeProps}
    />
  );
});
