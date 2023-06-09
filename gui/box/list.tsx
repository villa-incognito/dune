import cn from "classnames";
import styles from "gui/box/list.module.css";
import { Icon } from "gui/icon/icon";
import { Box } from "gui/box/box";
import { BoxProps } from "gui/box/box";

export const BoxList: React.FC<BoxProps> = (props) => {
  return (
    <Box {...props}>
      <ul className={styles.list}>{props.children}</ul>
    </Box>
  );
};

export const BoxListItem: React.FC<{
  icon: string;
  count?: number;
  action?: React.ReactNode;
  timestamp?: React.ReactNode;
  className?: string;
}> = (props) => {
  return (
    <li className={cn(styles.item, props.className)}>
      <span className={styles.icon}>
        <Icon icon={props.icon} />
      </span>
      <span className={styles.text}>
        <span>{props.children}</span>
      </span>
      {"timestamp" in props && (
        <span className={styles.timestamp}>
          <span>{props.timestamp}</span>
        </span>
      )}
      {"action" in props && (
        <span className={styles.action}>
          <span>{props.action}</span>
        </span>
      )}
      {"count" in props && (
        <span className={styles.count}>
          <span>{props.count}</span>
        </span>
      )}
    </li>
  );
};
