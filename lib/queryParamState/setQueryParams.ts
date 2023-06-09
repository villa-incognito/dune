import getUrlWithUpdatedQueryParams from "./getUrlWithUpdatedQueryParams";
import { isEqual } from "lodash";

import type { NextRouter } from "next/router";
import type { ParsedUrlQueryInput } from "querystring";

interface Options {
  // `onChangeTransform`: Side effect to update other query params
  // unless the "changed" query params are already up to date
  onChangeTransform?: (query: ParsedUrlQueryInput) => ParsedUrlQueryInput;
}

export default function setQueryParams(
  router: NextRouter,
  query: ParsedUrlQueryInput,
  { onChangeTransform = identity }: Options = {}
) {
  const url = getUrlWithUpdatedQueryParams(router, query);

  if (isEqual(router.query, url.query)) {
    return;
  }

  router.push(
    getUrlWithUpdatedQueryParams(router, onChangeTransform(query)),
    undefined,
    { shallow: true }
  );
}

const identity = <T>(t: T) => t;
