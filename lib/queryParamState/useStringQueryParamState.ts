import useQueryParamState, {
  Options,
} from "lib/queryParamState/useQueryParamState";

// Unless defaultValue is undefined, value is always string
export default function useStringQueryParamState<
  DefaultValue extends string | undefined = string | undefined
>(key: string, defaultValue: DefaultValue, options?: Options) {
  return useQueryParamState<string | DefaultValue>(
    function getValue(query) {
      const value = query[key];
      if (typeof value === "string") {
        return value;
      } else {
        return defaultValue;
      }
    },
    function getQuery(value) {
      if (value === defaultValue) {
        return { [key]: undefined };
      } else {
        return { [key]: value };
      }
    },
    options
  );
}
