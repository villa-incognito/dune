/* eslint @typescript-eslint/strict-boolean-expressions: off */

import styles from "./MenuPanel.module.css";
import cn from "classnames";
import { IconSelected } from "components/Icons/IconSelected";
import Link, { LinkProps } from "next/link";

import {
  getKeyCombination,
  getKeys,
  Shortcut as IShortcut,
  Key,
} from "src/utils/shortcut";

import type { ReactNode } from "react";

interface PanelProps {
  children: ReactNode;
  className?: string;
}

export function Panel(props: PanelProps) {
  return (
    <ul className={cn(styles.panel, props.className)}>{props.children}</ul>
  );
}

interface SectionProps {
  children: ReactNode;
  maxHeight?: string; // CSS max-height, e.g. "30rem"
  title?: ReactNode;
  wrapTitle?: boolean;
}

export function Section(props: SectionProps) {
  const { maxHeight, children, title, wrapTitle = true } = props;

  return (
    <li className={styles.section}>
      {Boolean(title) && wrapTitle && (
        <div className={styles.title}>{title}</div>
      )}
      {Boolean(title) && !wrapTitle && title}
      <ul style={maxHeight ? { maxHeight, overflow: "auto" } : undefined}>
        {children}
      </ul>
    </li>
  );
}

type ItemProps =
  | {
      description?: undefined;
      hasIconBeforeText?: undefined;
    }
  | {
      /*
       * When there is a description, we need to know if there is an
       * icon (16x16 px img or svg) before the text, in order to align
       * the description correctly.
       */
      description: ReactNode;
      hasIconBeforeText: boolean;
    };

type ItemButtonProps = ItemProps & {
  children: ReactNode;
  onClick?: () => void;
  selected?: boolean;
  active?: boolean;
  nestedButtonsOrLinks?: ReactNode;
};

export function ItemButton(props: ItemButtonProps) {
  const { selected = false, active = selected } = props;

  return (
    <li
      className={cn(
        styles.item,
        active && styles.active,
        props.nestedButtonsOrLinks && styles.hasNested
      )}
    >
      <button
        className={styles.interactive}
        onMouseUp={props.onClick}
        type="button"
      >
        <div className={styles.content}>
          {props.children}
          {selected && <IconSelected />}
        </div>
        {props.description && (
          <div
            className={cn(
              styles.description,
              props.hasIconBeforeText && styles.titleHasIconBeforeText
            )}
          >
            {props.description}
          </div>
        )}
      </button>
      {props.nestedButtonsOrLinks && (
        <div className={styles.nested}>{props.nestedButtonsOrLinks}</div>
      )}
    </li>
  );
}

type ItemLinkProps = ItemProps & {
  children: ReactNode;
  onClick?: () => void;
  href: LinkProps["href"];
  target?: "_blank";
  selected?: boolean;
  active?: boolean;
  color?: "blue"; // Defaults to same color as ItemButton
  nestedButtonsOrLinks?: ReactNode;
};

export function ItemLink(props: ItemLinkProps) {
  const { selected = false, active = selected } = props;

  return (
    <li
      className={cn(
        styles.item,
        active && styles.active,
        props.nestedButtonsOrLinks && styles.hasNested
      )}
    >
      <Link href={props.href}>
        <a
          onMouseUp={props.onClick}
          className={cn(
            styles.interactive,
            props.color && styles[`color-${props.color}`]
          )}
          target={props.target}
        >
          <div className={styles.content}>
            {props.children}
            {selected && <IconSelected />}
          </div>
          {props.description && (
            <div
              className={cn(
                styles.description,
                props.hasIconBeforeText && styles.titleHasIconBeforeText
              )}
            >
              {props.description}
            </div>
          )}
        </a>
      </Link>
      {props.nestedButtonsOrLinks && (
        <div className={styles.nested}>{props.nestedButtonsOrLinks}</div>
      )}
    </li>
  );
}

type ItemCheckboxProps = ItemProps & {
  children: ReactNode;
  checked: boolean;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
};

export function ItemCheckbox(props: ItemCheckboxProps) {
  return (
    <li className={styles.item}>
      <label className={styles.interactive}>
        <div className={styles.content}>
          {props.children}
          <input
            type="checkbox"
            checked={props.checked}
            onChange={props.onChange}
          />
        </div>
        {props.description && (
          <div
            className={cn(
              styles.description,
              props.hasIconBeforeText && styles.titleHasIconBeforeText
            )}
          >
            {props.description}
          </div>
        )}
      </label>
    </li>
  );
}

type ItemCustomProps = ItemProps & {
  children: ReactNode;
};

export function ItemCustom(props: ItemCustomProps) {
  return <li className={styles.item}>{props.children}</li>;
}

/**
 * <Menu.Text> can be used for the text in a menu item. If an item gets
 * too wide to fit inside the menu panel, the text, and nothing else,
 * will get cut off by an ellipis "…".
 */
interface TextProps {
  children: ReactNode;
  className?: string;
}

export function Text(props: TextProps) {
  return (
    <span className={cn(styles.text, props.className)}>{props.children}</span>
  );
}

/*
 * Visual indicator that an item has a keyboard shortcut
 *
 * (Since we may want the shortcut to work even when the menu is closed,
 * and thus the item is not rendered, the menu does not automatically
 * attach a keyboard shortctut to the menu item.)
 */
type ShortcutProps = {
  shortcut: IShortcut;
};

export function Shortcut(props: ShortcutProps) {
  const keyCombination = getKeyCombination(props.shortcut);
  const keys = getKeys(props.shortcut);

  return (
    <span className={styles.shortcut} title={keyCombination}>
      {keys.map((key) => (
        <KeyboardKey key={key} keyboarKey={key} />
      ))}
    </span>
  );
}

export function KeyboardKey(props: { keyboarKey: Key }) {
  const key = props.keyboarKey;

  switch (key) {
    case "cmd":
      return <span>⌘</span>;
    case "ctrl":
      return <span>⌃</span>;
    case "option":
      return <span>⌥</span>;
    case "shift":
      return <span>⇧</span>;
    case "enter":
      return <span>⏎</span>;
    case "alt":
      return <span>Alt</span>;
    case "escape":
      return <span>Esc</span>;
    default:
      return <span>{key.toUpperCase()}</span>;
  }
}
