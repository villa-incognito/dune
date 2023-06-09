import qs from "qs";
import { ParsedQs } from "qs";

// Get a list of values for a query string key.
export const allQueryValues = (query: ParsedQs, key: string): string[] => {
  if (query[key] instanceof Array) {
    return (query[key] as string[]).filter(Boolean);
  } else if (typeof query[key] === "string") {
    return [query[key] as string].filter(Boolean);
  } else {
    return [];
  }
};

// Get the first value for a query string key.
export const firstQueryValue = (query: ParsedQs, key: string) => {
  return allQueryValues(query, key)[0];
};

// Get the first value for a query string key as an inte.
export const firstQueryInt = (query: ParsedQs, key: string) => {
  const x = parseInt(firstQueryValue(query, key) ?? "", 10);
  return Number.isNaN(x) ? undefined : x;
};

// Get the first value for a query string key as an inte.
export const firstQueryBool = (query: ParsedQs, key: string) => {
  const x = firstQueryValue(query, key);
  return x ? x.toLowerCase() === "true" : false;
};

// Format an object as a query string.
export const formatQueryString = <T extends object>(obj: T): string => {
  return qs.stringify(obj);
};

// Parse a query string into an object.
export const parseQueryString = (query: string): ParsedQs => {
  return qs.parse(query.replace(/^\?/, ""));
};

// Get the current browser query string.
export const browserQueryString = (): string => {
  return typeof window !== "undefined" ? window.location.search : "";
};

// Parse the window query string into an object.
export const parseBrowserQuery = (): ParsedQs => {
  return parseQueryString(browserQueryString());
};
