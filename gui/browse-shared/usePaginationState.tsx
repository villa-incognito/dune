import useQueryParamState from "lib/queryParamState/useQueryParamState";
import type { ParsedUrlQueryInput } from "querystring";

export default function usePaginationState() {
  return useQueryParamState<number>(
    (query) => {
      const page = Number(query.page);
      const isValid = Number.isInteger(page) && page > 0;
      return isValid ? page : 1;
    },
    (page) => ({ page: page === 1 ? undefined : page })
  );
}

// Should be reset when changing the other api-params
export function resetPagination(query: ParsedUrlQueryInput) {
  return {
    ...query,
    page: undefined,
  };
}
