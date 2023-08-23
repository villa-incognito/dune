import { useState, useEffect } from "react";
import { useDebouncedEffect } from "src/hooks/useDebouncedEffect";
import useStringQueryParamState from "lib/queryParamState/useStringQueryParamState";
import { resetPagination } from "./usePaginationState";

/*
 * Sync freetext filter with query param "q".
 *
 * When typing, we need the input value to update immediately, and
 * syncing directly with the query param is too slow. Therefore we
 * also keep it in a useState, and debounce the update to the query
 * param state.
 *
 * Use the debounced (query param) state when fetching from the api.
 */
export default function useFreetextFilterState() {
  // State in query param
  const [
    freetextFilterParam,
    setFreetextFilterParam,
  ] = useStringQueryParamState("q", "", { onChangeTransform: resetPagination });

  // State in useState
  const [freetextFilter, setFreetextFilter] = useState<string>(
    freetextFilterParam
  );

  /*
   * query param -> useState
   *
   * This is necessary because it is initialized as an empty string on
   * the server, where query params are not known.
   */
  useEffect(() => {
    setFreetextFilter(freetextFilterParam);
  }, [freetextFilterParam]);

  // useState -> queryParam
  useDebouncedEffect(
    { delayMs: 300 },
    () => setFreetextFilterParam(freetextFilter),
    [freetextFilter]
  );

  return {
    freetextFilter,
    setFreetextFilter,
    freetextFilterDebounced: freetextFilterParam,
  };
}
