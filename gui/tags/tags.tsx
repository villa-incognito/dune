import React from "react";
import cn from "classnames";
import Link from "next/link";
import styles from "gui/tags/tags.module.css";
import { FieldLabel } from "gui/input/fields";
import { InputText } from "gui/input/input";
import { Badge, BadgeProps } from "components/Badge/Badge";

export const Tags: React.FC<{
  slug: "queries" | "dashboards";
  tags: string[];
  className?: string;
  limit?: number;
  color1?: boolean;
}> = (props) => {
  const tags = props.limit ? props.tags.slice(0, props.limit) : props.tags;
  const color: BadgeProps["color"] = props.color1 ? "brand-orange" : "neutral";

  const className = cn(styles.tags, props.className);

  if (tags.length === 0) {
    return null;
  }

  return (
    <ul className={className}>
      {tags.map((t) => (
        <li key={t}>
          <Link prefetch={false} href={`/browse/${props.slug}?tags=${t}`}>
            <a>
              <Badge size="M" color={color} variant="filled">
                #{t}
              </Badge>
            </a>
          </Link>
        </li>
      ))}
    </ul>
  );
};

export const FieldTagsList: React.FC<{
  label: string;
  tags: string;
  onChange: (tags: string) => void;
}> = (props) => {
  return (
    <FieldLabel label={props.label} caption="Separate tags with commas.">
      <InputText
        placeholder="Tag 1, tag2, tag-3"
        value={props.tags ?? ""}
        onChange={(event) => props.onChange(event.target.value)}
      />
    </FieldLabel>
  );
};
