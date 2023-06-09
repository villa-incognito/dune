import { Empty } from "gui/empty/empty";
import Link from "next/link";

import usePaginationState from "./usePaginationState";

interface Props {
  lastPage: number;
}

export default function EmptyBecausePageIsOutOfBounds({ lastPage }: Props) {
  const [page, , getPageUrl] = usePaginationState();

  const message =
    lastPage === 1
      ? `You are on page ${page}, but there is only one page of results.`
      : `You are on page ${page}, but there are only ${lastPage} pages of results.`;

  return (
    <Empty icon="circle-fill" title="Page out of bounds">
      <p>{message}</p>
      <p>
        <Link href={getPageUrl(1)}>
          <a>Go to page 1.</a>
        </Link>
      </p>
    </Empty>
  );
}
