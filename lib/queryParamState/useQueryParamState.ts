import { useRouter, NextRouter } from "next/router";
import setQueryParams from "./setQueryParams";
import getUrlWithUpdatedQueryParams from "./getUrlWithUpdatedQueryParams";

import type { ParsedUrlQueryInput } from "querystring";
import type { UrlObject } from "url";

export interface Options {
  // `onChangeTransform`: Side effect to update other query params when the
  // query param(s) linked to this state changes
  onChangeTransform?: (query: ParsedUrlQueryInput) => ParsedUrlQueryInput;
}

export default function useQueryParamState<Value>(
  getValue: (query: NextRouter["query"]) => Value,
  getQuery: (value: Value) => ParsedUrlQueryInput,
  { onChangeTransform = identity }: Options = {}
) {
  const router = useRouter();
  const value = getValue(router.query);

  return [
    value,
    function setState(newValue: Value) {
      setQueryParams(router, getQuery(newValue), { onChangeTransform });
    },
    function getUrl(newValue: Value): UrlObject {
      return getUrlWithUpdatedQueryParams(
        router,
        onChangeTransform(getQuery(newValue))
      );
    },
  ] as const;
}

const identity = <T>(t: T) => t;
