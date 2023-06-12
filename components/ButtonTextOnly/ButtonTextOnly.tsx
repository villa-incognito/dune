import styles from "./styles/ButtonTextOnly.module.css";
import cn from "classnames";
import { getThemeClassName, Theme } from "./styles/buttonTextOnlyThemes";

import React, { forwardRef } from "react";

import type { ReactNode } from "react";

type Size = "S" | "M" | "L";

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

  onClick?: (event: React.MouseEvent) => void;
}

export const ButtonTextOnly = forwardRef<HTMLButtonElement, Props>(
  (props, ref) => {
    const {
      theme,
      size,
      active,
      disabled,
      className,
      children,
      ...nativeProps
    } = props;

    return (
      <button
        disabled={disabled}
        className={cn(
          styles.button,
          getThemeClassName({ theme, active }),
          styles[`size-${size}`],
          className
        )}
        ref={ref}
        {...nativeProps}
      >
        {children}
      </button>
    );
  }
);
