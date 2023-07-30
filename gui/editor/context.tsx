/* eslint @typescript-eslint/strict-boolean-expressions: off */

import debounce from "lodash/debounce";
import React from "react";
import {
  autosuggestLocalStorageKey,
  themeLocalStorageKey,
} from "gui/editor/state";
import { callEditVisualisation } from "./graphql";
import { createContext } from "use-context-selector";
import { defaultDatasetIndex } from "gui/editor/state";
import { defaultQueryName } from "gui/editor/state";
import { defaultVisualIndex } from "gui/editor/state";
import { EditorAction } from "gui/editor/state";
import { editorReducer } from "gui/editor/state";
import { EditorState } from "gui/editor/state";
import { EntryNew } from "lib/entries/types";
import { EntryQuery } from "lib/entries/types";
import { ListDatasetsQuery } from "lib/types/graphql";
import { LoadingPage } from "gui/loading/page";
import { NotFoundError } from "lib/entries/errors";
import { NotFoundPage } from "pages/404";
import { ParametersState } from "lib/parameters/types";
import { QueryVisual } from "lib/visuals/types";
import { Session } from "lib/users/types";
import { tryLocalStorageGetItem } from "lib/storage/storage";
import { useContextSelector } from "use-context-selector";
import { useEntryQuery } from "lib/entries/hooks";
import { useListDatasetsQuery } from "lib/types/graphql";
import { useParameters } from "lib/parameters/hooks";
import { useQueryResult } from "lib/results/useQueryResult";
import { useRequiredSession } from "gui/session/session";
import { defaultTheme, getThemeOrDefault } from "gui/code/theme";
import Router from "next/router";
import {
  useHasAdminPermission,
  useHasEditPermission,
} from "lib/permissions/permissions";
import type { Datasets } from "lib/types/graphql";
import type { ActiveContext } from "shared/ContextSwitcher/store";

interface Props {
  session?: Session;
  activeContext?: ActiveContext;
  visual?: number;
  query?: EntryQuery;
  datasets: ListDatasetsQuery;
  refresh: () => Promise<EntryQuery | undefined>;
}

export interface EditorContextValue {
  editor?: EditorState;
  parameters?: ParametersState;
  dispatch: React.Dispatch<EditorAction>;
}

// EditorContext holds state for the query editor. It contains:
//
// * A ParameterState object that manages query parameters.
// * An EditorState object managed by React's useReducer.
// * The dispatch function for the editor state reducer.
//
// EditorContext does not use the regular React context, but instead
// the "use-context-selector" library. This lets us create actual
// selector hooks (further down this file) that only trigger renders
// when their returned value changes referentially.
//
export const EditorContext = createContext<EditorContextValue>({
  dispatch: () => {},
});

export const EditorProvider: React.FC<{
  session?: Session;
  activeContext?: ActiveContext;
  query?: number;
  visual?: number;
}> = (props) => {
  const context = { session: props.session };
  const datasets = useListDatasetsQuery({ context });
  const query = useEntryQuery(props.query);

  if (query.error instanceof NotFoundError) {
    return <NotFoundPage />;
  }

  if (query.error || datasets.error) {
    throw query.error || datasets.error;
  }

  if (!datasets.data || (props.query && !query.data)) {
    return <LoadingPage />;
  }

  return (
    <EditorProviderValue
      session={props.session}
      activeContext={props.activeContext}
      visual={props.visual}
      datasets={datasets.data}
      query={query.data}
      refresh={query.mutate}
    >
      {props.children}
    </EditorProviderValue>
  );
};

const EditorProviderValue: React.FC<Props> = (props) => {
  const [state, dispatch] = React.useReducer(
    editorReducer,
    props,
    createInitialState
  );

  const parameters = useParameters(state.query.parameters);
  const result = useQueryResult(props.query?.id, parameters.appliedMerged, {
    can_refresh: false,
  });

  const refresh = React.useCallback(async () => {
    const query = await props.refresh();
    query && dispatch({ type: "replaceQuery", query });
  }, [props.refresh]);

  React.useEffect(() => {
    dispatch({ type: "replaceResult", result });
  }, [result]);

  React.useEffect(() => {
    dispatch({ type: "replaceRefresh", refresh });
  }, [refresh]);

  return (
    <EditorContext.Provider value={{ editor: state, parameters, dispatch }}>
      {props.children}
    </EditorContext.Provider>
  );
};

const createInitialState = (props: Props): EditorState => {
  const storedAutosuggest = tryLocalStorageGetItem(autosuggestLocalStorageKey);
  // Since autosuggest value must be boolean, we need to parse string stored in localStorage
  const autosuggest = storedAutosuggest ? JSON.parse(storedAutosuggest) : false;

  const storedTheme = tryLocalStorageGetItem(themeLocalStorageKey);
  const theme = getThemeOrDefault(storedTheme);

  return {
    autosuggest,
    theme,
    datasets: props.datasets,
    query: props.query ?? createEmptyQuery(props.datasets, props.activeContext),
    visualIndex: findVisualIndex(props.query, props.visual),
    selection: "",
    changed: false,
  };
};

const createEmptyQuery = (
  datasets: ListDatasetsQuery,
  activeContext?: ActiveContext
): EntryNew<EntryQuery> => {
  if (!activeContext) {
    // Only signed in users (who should also have an active context) can create queries.
    throw new Error("No active context provided");
  }

  function getDatasetId(): number {
    const param = Router.query.d;
    const parsedId = param ? Number(param) : undefined;
    const datasetId = datasets.datasets.find(
      (ds) =>
        ds.id === parsedId &&
        !isDeprecated(ds, {
          // Assume user is not a spellbook contributor, since we don't
          // have access to that information at page load.
          // If they are a spellbook contributor, they can still select
          // Spark SQL in the dropdown, but it won't be selected from
          // the query param.
          isSpellbookContributor: false,
        })
    )?.id;

    if (typeof datasetId === "number") {
      return datasetId;
    } else {
      return datasets.datasets[defaultDatasetIndex].id;
    }
  }

  return {
    dataset_id: getDatasetId(),
    owner: {
      type: activeContext.type,
      id: activeContext.id,
      name: activeContext.name,
      handle: activeContext.handle,
      profile_image_url: activeContext.profile_image_url ?? null,
    },
    name: defaultQueryName,
    description: "",
    query: "",
    version: 0,
    matview_id: null,
    schedule: "",
    num_favorites_in_period: 0,
    is_favorite: false,
    is_private: false,
    is_archived: false,
    is_temp: false,
    visualizations: [],
    parameters: [],
  };
};

const findVisualIndex = (query?: EntryQuery, id?: number) => {
  if (!query?.visualizations || !id) {
    return defaultVisualIndex;
  }

  const index = query.visualizations.findIndex((v) => v.id === id);
  return index >= 0 ? index : defaultVisualIndex;
};

// A function that debounces update requests to a visual.
// this function needs to be declared globally to use lodashes mechanism
// for keeping track of calls to the debounced function.
// Note: a possible bug exists if this method is called multiple times
// within the debounce period referring to different visuals. Only the last
// call will be used.
const saveVisualDebounce = debounce(
  (props: {
    visual: QueryVisual;
    session: Session;
    onFailure: (err: string) => void;
    onSuccess: () => void;
  }) => {
    callEditVisualisation(props.visual.id, props.visual, props.session)
      .then((res) => {
        if (!res.data?.update_visualizations_by_pk) {
          props.onFailure("Unknown error");
        }
        props.onSuccess();
      })
      .catch((err) => {
        props.onFailure(err);
      });
  },
  500
);

// returns a function that can be used to update the state of a visual locally and on the server.
// Changes occuring inside a certain interval are grouped and updated in batch. If the update fails
// The local state will be returned to what it was before the batch started filling.
export const useVisualSaveAndDispatch = () => {
  const session = useRequiredSession();
  const currentVisual = useEditorVisual();
  // We don't wait for the api to get updated before we update the local state. There for
  // in order to reset the state in the case of an api failure we keep track of the original
  // visual before the new changes were applied.
  const [originalVisual, setOriginalVisual] = React.useState(currentVisual);
  const dispatch = useEditorDispatch();

  const handleError = (err: string) => {
    if (originalVisual) {
      dispatch({ type: "replaceVisual", visual: originalVisual });
    }
    dispatch({
      type: "replaceLastVisualUpdatingState",
      visualUpdatingState: {
        isLoading: false,
        error: err,
      },
    });
  };

  const saveAndDispatch = (visual: QueryVisual) => {
    // Set loading state
    dispatch({
      type: "replaceLastVisualUpdatingState",
      visualUpdatingState: { isLoading: true },
    });
    // Apply changes
    dispatch({ type: "replaceVisual", visual });
    // Call the debounced api request
    saveVisualDebounce({
      visual,
      session,
      onFailure: handleError,
      onSuccess: () => {
        setOriginalVisual(visual);
        dispatch({ type: "replaceLastVisualUpdatingState" });
      },
    });
  };

  return saveAndDispatch;
};

export const useEditorAutosuggest = () => {
  return useContextSelector(EditorContext, ({ editor }) => {
    return editor?.autosuggest || false;
  });
};

export const useEditorTheme = () => {
  return useContextSelector(EditorContext, ({ editor }) => {
    return editor?.theme || defaultTheme;
  });
};

export const useEditorDispatch = () => {
  return useContextSelector(EditorContext, ({ dispatch }) => {
    return dispatch;
  });
};

export const useEditorDatasets = () => {
  return useContextSelector(EditorContext, ({ editor }) => {
    return editor?.datasets || { datasets: [] };
  });
};

export const useEditorDataset = () => {
  return useContextSelector(EditorContext, ({ editor }) => {
    return editor
      ? editor.datasets.datasets.find((d) => {
          return d.id === editor.query.dataset_id;
        })
      : undefined;
  });
};

export const useEditorCodeHelpers = () => {
  return useContextSelector(EditorContext, ({ editor }) => {
    return editor?.helpers;
  });
};

export const useEditorCodeSelection = () => {
  return useContextSelector(EditorContext, ({ editor }) => {
    return editor?.selection || "";
  });
};

export const useEditorResult = () => {
  return useContextSelector(EditorContext, ({ editor }) => {
    return editor?.result;
  });
};

export const useEditorRefresh = () => {
  return useContextSelector(EditorContext, ({ editor }) => {
    return editor?.refresh;
  });
};

export const useEditorParameters = () => {
  return useContextSelector(EditorContext, ({ parameters }) => {
    return parameters;
  });
};

export const useEditorChanged = () => {
  return useContextSelector(EditorContext, ({ editor }) => {
    return editor?.changed || false;
  });
};

export const useEditorQuery = () => {
  return useContextSelector(EditorContext, ({ editor }) => {
    return editor?.query;
  });
};

//TODO: currently we have a query property in the state that represents
// the query being edited by the user as well as the query saved in the backend.
// We should seperate this so that we don't need to do hacks like this below.
// see https://dune.height.app/T-4682
export const useEditorSavedQuery = (): EntryQuery | undefined => {
  return useContextSelector(EditorContext, ({ editor }) => {
    const q = editor?.query;
    if (q) {
      if ("id" in q && "created_at" in q && "updated_at" in q) {
        return q;
      }
    }
  });
};

export const useEditorQueryId = (): number | undefined => {
  return useContextSelector(EditorContext, ({ editor }) => {
    if (editor?.query && "id" in editor.query) {
      return editor.query.id;
    }
  });
};

export const useEditorQueryTemp = () => {
  return useContextSelector(EditorContext, ({ editor }) => {
    return editor?.query.is_temp;
  });
};

export const useEditorQueryIsArchived = () => {
  return useContextSelector(EditorContext, ({ editor }) => {
    return editor?.query.is_archived;
  });
};

export const useEditorQueryMatViewId = () => {
  return useContextSelector(EditorContext, ({ editor }) => {
    return editor?.query.matview_id;
  });
};

export const useEditorLastVisualUpdatingState = () => {
  return useContextSelector(EditorContext, ({ editor }) => {
    return editor?.lastVisualUpdatingState;
  });
};

export const useEditorQueryName = () => {
  return useContextSelector(EditorContext, ({ editor }) => {
    return editor?.query.name || "";
  });
};

export const useEditorQueryDescription = () => {
  return useContextSelector(EditorContext, ({ editor }) => {
    return editor?.query?.description || "";
  });
};

export const useEditorQueryOwner = () => {
  return useContextSelector(EditorContext, ({ editor }) => {
    return editor?.query?.owner;
  });
};

export const useEditorQueryTags = () => {
  return useContextSelector(EditorContext, ({ editor }) => {
    return editor?.query?.tags ?? [];
  });
};

export const useEditorQueryCode = () => {
  return useContextSelector(EditorContext, ({ editor }) => {
    return editor?.query.query || "";
  });
};

export const useEditorQueryVersion = () => {
  return useContextSelector(EditorContext, ({ editor }) => {
    return editor?.query.version ?? 0;
  });
};

export const useEditorQuerySaved = () => {
  return Boolean(useEditorQueryId());
};

export const useEditorQueryHasEditPermission = () => {
  const owner = useEditorQueryOwner();

  return useHasEditPermission(owner);
};

export const useEditorQueryHasAdminPermission = () => {
  const owner = useEditorQueryOwner();

  return useHasAdminPermission(owner);
};

export const useEditorVisualIndex = () => {
  return useContextSelector(EditorContext, ({ editor }) => {
    return editor?.visualIndex || defaultVisualIndex;
  });
};

export const useEditorVisuals = () => {
  return useContextSelector(EditorContext, ({ editor }) => {
    return editor?.query.visualizations ?? [];
  });
};

export const useEditorVisual = () => {
  return useContextSelector(EditorContext, ({ editor }) => {
    return editor?.query.visualizations?.[editor.visualIndex];
  });
};

// Utils
export function isDeprecated(
  dataset: Pick<Datasets, "name">,
  options: { isSpellbookContributor: boolean }
) {
  if (dataset.name.includes("Spark SQL")) {
    return !options.isSpellbookContributor;
  }

  return dataset.name.includes("[deprecated]");
}

export function isEditingDisabled(
  dataset: Pick<Datasets, "name">,
  options: { isSpellbookContributor: boolean }
) {
  if (dataset.name.includes("Spark SQL")) {
    return !options.isSpellbookContributor;
  }

  return dataset.name.includes("[deprecated]");
}

export function isExecutionDisabled(dataset: Pick<Datasets, "name">) {
  return !(
    dataset.name.includes("Spark SQL") ||
    dataset.name.includes("Dune SQL") ||
    dataset.name.includes("Ethereum")
  );
}
