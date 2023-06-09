import { Parameter } from "lib/parameters/types";
import { parseQueryString } from "lib/links/query";
import qs from "qs";
import md5 from "md5";
import { fromPairs } from "lodash";

export const paramQueryStringKey = (p: Parameter) =>
  `${p.key}_${p.type[0]}${hash(`${p.type[0]}${p.query_id}${p.default_value}`)}`;

export function parameterQueryParams(
  parameters: Parameter[]
): Record<string, string | number> {
  return fromPairs(
    parameters.map((p) => {
      const paramId = paramQueryStringKey(p);
      if (p.value !== p.default_value) {
        return [paramId, p.value];
      }
      return [];
    })
  );
}

// Format a list of parameters as a query string.
export const formatParametersQuery = (parameters: Parameter[]) => {
  return qs.stringify(parameterQueryParams(parameters));
};

// Parse parameter key/value pairs from a query string.
// Keep the keys that also exist in a list of defaults.
// Reject values that already have the default value.
// Reject enum values that don't exist in enumOptions.
// Reject numbers that can't be parsed.
export const parseParametersQuery = (
  defaults: Parameter[],
  query: string
): Parameter[] => {
  const parsed = parseQueryString(query);
  const parameters: Parameter[] = [];

  defaults.forEach((d) => {
    const paramHash = hash(`${d.type[0]}${d.query_id}${d.default_value}`);
    // Prefer specific param (wtih type and hash) from url, use param by just key as fallback.
    const value = parsed[`${d.key}_${d.type[0]}${paramHash}`] ?? parsed[d.key];
    if (
      typeof value === "string" &&
      value !== "" &&
      value !== d.default_value &&
      (d.type !== "enum" || d.enumOptions?.includes(value)) &&
      (d.type !== "number" || Number.isFinite(parseFloat(value)))
    ) {
      parameters.push({ ...d, value });
    }
  });

  return parameters;
};

export const hash = (query: string): string => {
  return md5(query).slice(0, 5);
};
