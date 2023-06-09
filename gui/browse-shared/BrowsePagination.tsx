import LinkPagination from "gui/pagination/LinkPagination";

import usePaginationState from "gui/browse-shared/usePaginationState";

/*
 * This component uses state from usePaginationState. Pages that render
 * it should also use that hook, and fetch items for the selected page.
 */
export { usePaginationState };

interface Props {
  pageSize: number;
  totalCount: number;
}

export default function BrowsePagination(props: Props) {
  const [page, , getPageUrl] = usePaginationState();

  return (
    <LinkPagination
      page={page}
      getPageUrl={getPageUrl}
      pageSize={props.pageSize}
      totalCount={props.totalCount}
    />
  );
}
