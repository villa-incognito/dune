import styles from "./styles/Button.module.css";
import cn from "classnames";
import { getThemeClassName, Theme } from "./styles/buttonThemes";
import { IconLoading } from "components/Icons/IconLoading";

import React, { forwardRef } from "react";

import type { ReactNode } from "react";

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
interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  theme: Theme;
  size: Size;
  children: ReactNode;

  disabled?: boolean;
  active?: boolean;
  loading?: boolean;

  onClick?: (event: React.MouseEvent) => void;
}

export const Button = forwardRef<HTMLButtonElement, Props>((props, ref) => {
  const {
    theme,
    size,
    active,
    loading,
    disabled,
    className,
    children,
    ...nativeProps
  } = props;

  return (
    <button
      disabled={disabled || loading}
      className={cn(
        styles.button,
        getThemeClassName({ theme, active, loading }),
        styles[`size-${size}`],
        className
      )}
      ref={ref}
      {...nativeProps}
    >
      {loading && <IconLoading />}
      {children}
    </button>
  );
});
