import styles from "./TagList.module.css";
import Link from "next/link";
import { Icon } from "gui/icon/icon";
import { Box, BoxProps } from "gui/box/box";

import type { UrlObject } from "url";
import type { Tag } from "lib/tags/types";

export const TagList: React.FC<BoxProps> = (props) => {
  return (
    <Box {...props}>
      <ul className={styles.list}>{props.children}</ul>
    </Box>
  );
};

export const TagListItem: React.FC<{
  tag: Tag;
  href: UrlObject;
  isSelected: boolean;
}> = (props) => {
  return (
    <li>
      <Link prefetch={false} href={props.href}>
        <a aria-current={props.isSelected}>
          <div className={styles.item}>
            <span className={styles.icon}>
              <Icon icon="tag" />
            </span>
            <span className={styles.text}>
              <span>{props.tag.tag}</span>
            </span>
            <span className={styles.count}>
              <span>{props.tag.popularity}</span>
            </span>
          </div>
        </a>
      </Link>
    </li>
  );
};
