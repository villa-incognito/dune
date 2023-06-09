import useStringQueryParamState from "lib/queryParamState/useStringQueryParamState";
import { resetPagination } from "./usePaginationState";

export default function useTagState() {
  return useStringQueryParamState("tags", undefined, {
    onChangeTransform: resetPagination,
  });
}
