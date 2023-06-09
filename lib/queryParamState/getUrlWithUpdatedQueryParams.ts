import type { NextRouter } from "next/router";
import type { ParsedUrlQueryInput } from "querystring";
import type { UrlObject } from "url";

/*
 * Returns a url that can be passed to:
 *
 * - "next/link": <Link href={url}>
 * - "next/router" methods: router.push(url) or router.replace(url)
 *
 * Existing query params are preserved unless they are given a new value.
 * Setting a param to `undefined` will remove it.
 */
export default function getUrlWithUpdatedQueryParams(
  router: NextRouter,
  query: ParsedUrlQueryInput
): UrlObject {
  return {
    query: removeUndefinedParams({ ...router.query, ...query }),
  };
}

// Remove query params whose value are undefined
function removeUndefinedParams(
  params: ParsedUrlQueryInput
): ParsedUrlQueryInput {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined)
  );
}
