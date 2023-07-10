/* eslint @typescript-eslint/strict-boolean-expressions: off */

import React from "react";
import { FullDashboard } from "lib/entries/types";
import { Parameter } from "lib/parameters/types";
import { ParameterMerge } from "lib/parameters/types";
import { ParametersState } from "lib/parameters/types";
import { addOverride, findParameter } from "lib/parameters/parameters";
import { browserQueryString } from "lib/links/query";
import {
  parameterQueryParams,
  paramQueryStringKey,
} from "lib/parameters/query";
import { logger } from "lib/logger/browser";
import { mergeDashboardParameters } from "lib/parameters/parameters";
import { mergeParameters } from "lib/parameters/parameters";
import { parseParametersQuery } from "lib/parameters/query";
import { useRouter } from "next/router";

// Some queries have custom parameters that can be set by the user.
// This hook enables managing the state. See type ParametersState for
// more info.
export const useParameters = (defaults: Parameter[]): ParametersState => {
  const router = useRouter();

  // Get the initial list of overrides from the browser query string.
  const [overrides, setOverrides] = React.useState(() =>
    parseParametersQuery(defaults, browserQueryString())
  );

  // Keep track of which values we have in the browser query string.
  const [applied, setApplied] = React.useState(() =>
    parseParametersQuery(defaults, browserQueryString())
  );

  // Create the initial list of merged parameters,
  // including any overrides from the query string.
  const [merged, setMerged] = React.useState(() => {
    return mergeParameters(defaults, overrides);
  });

  // Used to keep track of parameters removed in query editor
  const [removed, setRemoved] = React.useState<Parameter[]>([]);

  // Keep the merged parameters in sync with the defaults and overrides.
  React.useEffect(() => {
    setMerged(mergeParameters(defaults, overrides));
  }, [defaults, overrides]);

  // Merge the defaults and the applied params to use in queries
  const appliedMerged = React.useMemo(() => {
    return mergeParameters(defaults, applied);
  }, [defaults, applied]);

  // Called after editing parameters, or when pressing enter when
  // parameter input is focused.
  // Stores the overriden parameters in the browser query string.
  const onApply = React.useCallback(() => {
    const queryParams = parameterQueryParams(overrides);
    const currentQueries = { ...router.query };
    // remove currently applied query params
    applied.forEach((param) => {
      if (currentQueries[paramQueryStringKey(param)]) {
        delete currentQueries[paramQueryStringKey(param)];
      }
    });

    router
      .push(
        {
          query: { ...currentQueries, ...queryParams },
        },
        undefined,
        {
          shallow: true,
        }
      )
      .catch(logger.warn);
    setApplied(overrides);
  }, [overrides, router]);

  // Called when the user edits parameters in the parameter input bar.
  const onOverride = React.useCallback(
    (p: Parameter) => setOverrides(addOverride(overrides, p)),
    [defaults, overrides]
  );

  return React.useMemo(
    () => ({
      defaults,
      applied,
      appliedMerged,
      merged,
      overrides,
      removed,
      onApply,
      onOverride,
      setRemoved,
    }),
    [defaults, applied, merged, overrides, onApply, onOverride]
  );
};

// A specialized version of the above hook for dashboards.
//
// This hook will merge parameters by their key and type to produce
// a list of unique parameters for the dashboard. It also returns a
// mapping from query id to the parameters that the query should use.
// This mapping is used when fetching results for a specific widget.
//
export const useDashboardParameters = (
  dashboard?: FullDashboard
): ParameterMerge => {
  const [parameters, mapping] = React.useMemo(
    () => mergeDashboardParameters(dashboard),
    [dashboard]
  );

  const state = useParameters(parameters);

  return React.useMemo(
    () => ({
      state,
      mapping,
    }),
    [state, mapping]
  );
};

export const useParameterMapping = (
  merge: ParameterMerge,
  query: number | undefined
): Parameter[] => {
  return React.useMemo(() => {
    return typeof query === "number" && merge.mapping[query]
      ? appliedParametersForQuery(query, merge)
      : [];
  }, [merge, query]);
};

// appliedParametersForQuery gets a unique set of parameters that have been applied
// for a given query
export function appliedParametersForQuery(
  queryId: number,
  parametersMerg: ParameterMerge
) {
  return parametersMerg.mapping[queryId].map(
    (id) => findParameter(parametersMerg.state.appliedMerged, id)!
  );
}

// currentParametersForQuery gets a unique set of parameters that apply to a given query.
// These parameters represent a combination of the default parameters, applied parameters
// and parameters that have changed in the UI but not net been applied.
export function currentParametersForQuery(
  queryId: number,
  parametersMerg: ParameterMerge
) {
  return parametersMerg.mapping[queryId].map(
    (id) => findParameter(parametersMerg.state.merged, id)!
  );
}
