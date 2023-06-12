import styles from "./styles/ButtonTextOnly.module.css";
import cn from "classnames";
import { getThemeClassName, Theme } from "./styles/buttonTextOnlyThemes";
import Link, { LinkProps } from "next/link";

import { forwardRef } from "react";

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
type NativeProps = Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href">;

interface Props extends NativeProps {
  theme: Theme;
  size: Size;
  children: ReactNode;
  active?: boolean;

  href: LinkProps["href"];
  as?: LinkProps["as"];
  replace?: LinkProps["replace"];
  scroll?: LinkProps["scroll"];
  shallow?: LinkProps["shallow"];
  passHref?: LinkProps["passHref"];
  prefetch?: LinkProps["prefetch"];
  locale?: LinkProps["locale"];
}

// Like a Button, but it renders an anchor. (Cannot be `disabled`.)
export const AnchorButtonTextOnly = forwardRef<HTMLAnchorElement, Props>(
  (props, ref) => {
    const {
      theme,
      active,
      size,
      className,

      // Link props
      href,
      as,
      replace,
      scroll,
      shallow,
      passHref,
      prefetch,
      locale,

      ...nativeProps
    } = props;

    return (
      <Link
        href={href}
        as={as}
        replace={replace}
        scroll={scroll}
        shallow={shallow}
        passHref={passHref}
        prefetch={prefetch}
        locale={locale}
      >
        <a
          className={cn(
            styles.button,
            getThemeClassName({ theme, active }),
            styles[`size-${size}`],
            className
          )}
          ref={ref}
          {...nativeProps}
        >
          {props.children}
        </a>
      </Link>
    );
  }
);
