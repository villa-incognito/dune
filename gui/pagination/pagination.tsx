import cn from "classnames";
import styles from "gui/pagination/pagination.module.css";
import { EntryPage } from "lib/entries/types";
import { Icon } from "gui/icon/icon";

interface Props {
  page: EntryPage;
  className?: string;
  children: (
    text: React.ReactNode,
    page: number,
    current: boolean
  ) => React.ReactNode;
}

export const Pagination = (props: Props) => {
  const total = Math.ceil(props.page.count / props.page.page_size);
  const current = props.page.page;
  const className = cn(styles.pagination, props.className);
  const showLeftArrow = total > 1 && current > 1;
  const showRightArrow = total > 1 && current < total;

  return (
    <ul className={className}>
      {showLeftArrow && (
        <li className={styles.item}>
          {props.children(<PrevIcon />, current - 1, false)}
        </li>
      )}
      {paginate(current, total).map((item, i) => (
        <li key={`${i}-${item}`} className={styles.item}>
          {typeof item === "string" ? (
            <span>{item}</span>
          ) : (
            props.children(item, item, item === props.page.page)
          )}
        </li>
      ))}
      {showRightArrow && (
        <li className={styles.item}>
          {props.children(<NextIcon />, current + 1, false)}
        </li>
      )}
    </ul>
  );
};

const PrevIcon: React.FC = () => {
  return <Icon icon="arrow-left" aria-label="Previous" />;
};

const NextIcon: React.FC = () => {
  return <Icon icon="arrow-right" aria-label="Next" />;
};

// A simple pagination algorithm.
// https://gist.github.com/kottenator/9d936eb3e4e3c3e02598
const paginate = (current: number, total: number) => {
  const pages: (string | number)[] = [current - 1, current, current + 1].filter(
    (page) => page > 1 && page < total
  );

  const includeLeft = current === 4;
  const includeRight = current === total - 3;
  const includeDotsLeft = current > 4;
  const includeDotsRight = current < total - 3;

  if (total > 1) {
    includeLeft && pages.unshift(2);
    includeRight && pages.push(total - 1);
    includeDotsLeft && pages.unshift("...");
    includeDotsRight && pages.push("...");
    pages.unshift(1);
    pages.push(total);
  }

  return pages;
};
