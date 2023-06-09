import { Pagination } from "gui/pagination/pagination";
import Link, { LinkProps } from "next/link";

interface Props {
  page: number;
  getPageUrl: (page: number) => LinkProps["href"];
  pageSize: number;
  totalCount: number;
}

export default function LinkPagination({
  page,
  getPageUrl,
  pageSize,
  totalCount,
}: Props) {
  return (
    <Pagination
      page={{
        page,
        count: totalCount,
        page_size: pageSize,
        results: [],
      }}
    >
      {(children: React.ReactNode, pageNo: number, isActive: boolean) => (
        <Link href={getPageUrl(pageNo)} shallow={true}>
          <a aria-current={isActive}>{children}</a>
        </Link>
      )}
    </Pagination>
  );
}
