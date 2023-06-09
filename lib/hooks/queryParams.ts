import { useEffect } from "react";

type QueryParamValue = string | null;

export function useAndRemoveQueryParam<ValidValue extends QueryParamValue>(
  paramName: string,
  options?: { validValues?: Readonly<Array<ValidValue>> }
) {
  const value = useQueryParam(paramName, options);
  useRemoveQueryParam(paramName);
  return value;
}

export function useQueryParam<ValidValue extends QueryParamValue>(
  paramName: string,
  options?: { validValues?: Readonly<Array<ValidValue>> }
): ValidValue | undefined | null {
  if (typeof window === "undefined") {
    return undefined;
  }

  // Find return value
  const search = new URLSearchParams(window.location.search);
  const paramValue: QueryParamValue = search.get(paramName);

  // Cast to any because we can't know if paramValue is ValidValue
  // until we run this check – that is why we run it (!)
  if (
    !options?.validValues ||
    options.validValues.includes(paramValue as any)
  ) {
    // Cast to ValidValue because we just asserted that it is valid
    return paramValue as ValidValue;
  } else {
    return null;
  }
}

export function useRemoveQueryParam(paramName: string) {
  // Remove query param if present
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const search = new URLSearchParams(window.location.search);
    const currentValue = search.get(paramName);

    if (currentValue !== null && window.location.href.replace) {
      search.delete(paramName);
      const newSearchString = search.toString();

      const url = window.location.href.replace(
        window.location.search,
        newSearchString ? `?${newSearchString}` : ""
      );
      window.history.replaceState({}, "", url);
    }
  }, [paramName]);
}
