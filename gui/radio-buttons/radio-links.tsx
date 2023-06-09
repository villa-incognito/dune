import React, { ReactElement, ReactNode } from "react";

import Link, { LinkProps } from "next/link";

import stylesButtons from "gui/radio-buttons/appearance-buttons.module.css";
import stylesClassic from "gui/radio-buttons/appearance-classic.module.css";

function getStyles(appearance: "buttons" | "classic") {
  switch (appearance) {
    case "classic":
      return stylesClassic;
    case "buttons":
      return stylesButtons;
  }
}

type Value = string;

export function RadioLinkGroup(props: {
  label?: string;
  value?: Value;
  children: Array<ReactElement<typeof RadioButtonLink>>;
  appearance: "buttons" | "classic";
}) {
  const styles = getStyles(props.appearance);

  return (
    <fieldset className={styles.radio} name={props.label} role="radiogroup">
      <legend>{props.label}</legend>

      {props.children.map((child, index) =>
        React.cloneElement(child as ReactElement<any>, {
          key: index,
          group: {
            name: props.label,
            value: props.value,
          },
          styles,
        })
      )}
    </fieldset>
  );
}

export function RadioButtonLink(props: {
  value: Value;
  href: LinkProps["href"];
  children: ReactNode;
  group?: {
    // From RadioGroup
    label: string;
    value: Value;
  };
  styles?: Record<string, string>;
}) {
  const isSelected = props.group?.value === props.value;

  return (
    <label className={isSelected ? props.styles?.active : undefined}>
      <Link href={props.href} shallow={true}>
        <a>
          <input
            type="radio"
            name={props.group?.label}
            value={props.value}
            checked={isSelected}
            onChange={
              // Disallow de-selecting. Exactly one must be selected
              () => {}
            }
          />
          {props.children}
        </a>
      </Link>
    </label>
  );
}
