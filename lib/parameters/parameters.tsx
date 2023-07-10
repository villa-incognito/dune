/* eslint @typescript-eslint/strict-boolean-expressions: off */

import flatten from "lodash/flatten";
import produce from "immer";
import uniq from "lodash/uniq";
import uniqBy from "lodash/uniqBy";
import { FullDashboard } from "lib/entries/types";
import { Parameter } from "lib/parameters/types";
import { ParametersState } from "lib/parameters/types";
import { ParameterMapping } from "lib/parameters/types";
import { isNonNullable } from "lib/types/types";
import { isQueryVisual } from "lib/visuals/visuals";
import { VisualQueryDetails } from "lib/visuals/types";

export const defaultKey = "unnamed_parameter";
export const defaultValue = "default value";

// Create a new default parameter with a new key that
// does not conflict with any existing parameter keys.
export const createParameter = (parameters: Parameter[], name?: string) => {
  let key = name ?? defaultKey;

  for (let i = 2; parameters.find((p) => p.key === key); i++) {
    key = `${defaultKey}_${i}`;
  }

  const parameter: Parameter = {
    type: "text",
    key,
    value: defaultValue,
  };

  return {
    parameter,
    parameters: sortParameters([...parameters, parameter]),
  };
};

// Create a parameter SQL tag for the code editor.
export const createParameterTag = (parameter: Parameter) => {
  return `{{${parameter.key}}}`;
};

// Parse a newline-separated list of enum options.
export const parseEnumOptions = (input: string): string[] => {
  const options = input
    .split(/\n+/)
    .map((t) => t.trim())
    .filter(Boolean);

  return uniq(options);
};

// Create a newline-separated string from enum options.
export const formatEnumOptions = (options: string[] = []): string => {
  return uniq(options)
    .map((t) => t.trim())
    .filter(Boolean)
    .join("\n");
};

// Sort parameters by their key so that we have a stable order in the UI.
export const sortParameters = (parameters: Parameter[]): Parameter[] => {
  return [...parameters].sort((a, b) => {
    return a.key.localeCompare(b.key);
  });
};

// Merge lists of parameters with later lists overriding earlier lists.
export const mergeParameters = (...lists: Parameter[][]): Parameter[] => {
  const prioritized = flatten(lists).reverse();
  const unique = uniqBy(prioritized, uniqueParam);
  return sortParameters(unique);
};

// For dashboards the parameters exist outside the scope of the query they come from.
// Therefore we need to keep track of which param belongs to which query.
// In addition we need deduplicate params with the same key, type and default_value
const mergeParamsWithQueryId = (
  ...details: VisualQueryDetails[]
): Parameter[] => {
  const params: Parameter[] = [];
  details.forEach((d) => {
    d.parameters.forEach((p) =>
      params.push({ ...p, query_id: d.query_id, default_value: p.value })
    );
  });
  const prioritized = flatten(params);
  const unique = uniqBy(prioritized, uniqueParam);
  return sortParameters(unique);
};

// Create a merged list of parameters for a dashboard,
// and a mapping from query id to parameter ids
// so that we can undo the merge in each widget.
export const mergeDashboardParameters = (
  dashboard?: FullDashboard
): [Parameter[], ParameterMapping] => {
  if (!dashboard?.visualization_widgets?.length) {
    return [[], {}];
  }

  const details = dashboard.visualization_widgets
    .map((w) => w.visualization)
    .filter(isQueryVisual)
    .map((v) => v.query_details)
    .filter(isNonNullable);

  const parameters = mergeParamsWithQueryId(...details);
  const mapping: ParameterMapping = {};

  details.forEach((d) => {
    mapping[d.query_id] = (d.parameters ?? []).map((p) => {
      p.default_value = p.value;
      return uniqueParam(p);
    });
  });

  return [parameters, mapping];
};

// Merge a new override parameter into the list of overrides.
// Remove the override parameter if the user erased the value.
export const addOverride = (
  overrides: Parameter[],
  input: Parameter
): Parameter[] => {
  return produce(overrides, (draft) => {
    const index = parameterIndex(overrides, input);
    if (index === -1) {
      draft.push(input);
    } else if (input.value === "") {
      draft.splice(index, 1);
    } else {
      draft[index] = input;
    }
  });
};

export const parameterIndex = (ps: Parameter[], p: Parameter) => {
  return ps.findIndex((e) => {
    return uniqueParam(e) === uniqueParam(p);
  });
};

export const findParameter = (ps: Parameter[], id: string) => {
  return ps.find((p) => {
    return uniqueParam(p) === id;
  });
};

export const hasUnappliedChange = ({
  applied,
  overrides,
}: Pick<ParametersState, "applied" | "overrides">): boolean => {
  const kv = (param: Parameter) => `${param.key}=${param.value}`;

  return overrides.map(kv).join("\n") !== applied.map(kv).join("\n");
};

/*
 * A dashboard shows a merged list of unique query parameters.
 * Equal parameters are controlled by the same UI input.
 * The uniqueness of each parameter is determined by its type, key, default value
 * as well as ordered list of options in the case of enums. (Options
 * are ordered to avoid duplicate parameters that the user did not
 * intend.)
 */
export const uniqueParam = (p: Parameter): string => {
  return JSON.stringify({
    type: p.type,
    key: p.key,
    value: p.default_value,
    enumOptions: p.type === "enum" ? p.enumOptions?.slice().sort() : undefined,
  });
};
