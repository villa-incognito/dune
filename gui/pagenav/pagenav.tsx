import Link, { LinkProps } from "next/link";
import styles from "gui/pagenav/pagenav.module.css";
import { useRouter } from "next/router";

export const Pagenav: React.FC<{ className?: string }> = (props) => {
  return (
    <nav aria-label="Page navigation" className={props.className}>
      <ul className={styles.list}>{props.children}</ul>
    </nav>
  );
};

export const PagenavItem: React.FC<LinkProps> = (props) => {
  const router = useRouter();

  // Check if this link points to the current page.
  const isCurrent =
    props.href === router.asPath || props.href === router.asPath.split("?")[0];

  return (
    <li className={styles.item}>
      <Link {...props}>
        <a aria-current={isCurrent ? "page" : undefined}>{props.children}</a>
      </Link>
    </li>
  );
};
