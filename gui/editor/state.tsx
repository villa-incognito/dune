/* eslint @typescript-eslint/strict-boolean-expressions: off */

import produce from "immer";
import { CodeHelpers } from "gui/code/code";
import { Theme } from "gui/code/theme";
import { EntryNew, Owner } from "lib/entries/types";
import { EntryQuery } from "lib/entries/types";
import { ListDatasetsQuery } from "lib/types/graphql";
import { Parameter } from "lib/parameters/types";
import { QueryResult } from "lib/results/types";
import { QueryVisual } from "lib/visuals/types";
import { tryLocalStorageSetItem } from "lib/storage/storage";
import omit from "lodash/omit";
import Router from "next/router";

export type EditorQuery = EntryQuery | EntryNew<EntryQuery>;

export type EditorAction =
  | { type: "replaceQuery"; query: EditorQuery }
  | { type: "replaceQueryCode"; code: string }
  | {
      type: "replaceQueryCodeAndParameters";
      code: string;
      parameters: Parameter[];
    }
  | { type: "replaceQueryParameters"; parameters: Parameter[] }
  | { type: "replaceResult"; result?: QueryResult }
  | { type: "replaceRefresh"; refresh?: () => Promise<void> }
  | { type: "replaceCodeHelpers"; helpers: CodeHelpers }
  | { type: "replaceCodeSelection"; code: string }
  | { type: "selectDataset"; id: number }
  | { type: "selectVisual"; index: number }
  | { type: "replaceOwner"; owner: Owner }
  | { type: "appendVisual"; visual: QueryVisual }
  | { type: "replaceVisual"; visual: QueryVisual }
  | { type: "removeVisual"; visual: QueryVisual }
  | {
      type: "replaceLastVisualUpdatingState";
      visualUpdatingState?: VisualUpdatingState;
    }
  | { type: "saveQuery" }
  | { type: "toggleAutosuggest" }
  | { type: "selectTheme"; theme: Theme };

export interface VisualUpdatingState {
  isLoading: boolean;
  error?: string;
}

export interface EditorState {
  autosuggest: boolean;
  theme: Theme;
  query: EditorQuery;
  result?: QueryResult;
  datasets: ListDatasetsQuery;
  helpers?: CodeHelpers;
  visualIndex: number;
  lastVisualUpdatingState?: VisualUpdatingState;
  changed: boolean;
  selection: string;
  refresh?: () => Promise<void>;
}

export const editorReducer = (
  state: EditorState,
  action: EditorAction
): EditorState => {
  switch (action.type) {
    case "replaceQuery":
      return produce(state, (draft) => {
        draft.query = action.query;
      });
    case "replaceQueryCode":
      return produce(state, (draft) => {
        draft.query.query = action.code;
        draft.changed = true;
      });
    case "replaceQueryParameters":
      return produce(state, (draft) => {
        draft.query.parameters = action.parameters;
        draft.changed = true;
      });
    case "replaceQueryCodeAndParameters":
      return produce(state, (draft) => {
        draft.query.query = action.code;
        draft.query.parameters = action.parameters;
        draft.changed = true;
      });
    case "replaceCodeHelpers":
      return produce(state, (draft) => {
        draft.helpers = action.helpers;
      });
    case "replaceCodeSelection":
      return produce(state, (draft) => {
        draft.selection = action.code;
      });
    case "replaceOwner":
      return produce(state, (draft) => {
        draft.query.owner = action.owner;
      });
    case "replaceResult":
      return produce(state, (draft) => {
        draft.result = action.result;
      });
    case "replaceRefresh":
      return produce(state, (draft) => {
        draft.refresh = action.refresh;
      });
    case "selectDataset":
      Router.push(
        {
          query: {
            ...omit(Router.query, [
              "category",
              "namespace",
              "table",
              "contract",
              "abi",
              "blockchain",
              "blockchains",
            ]),
            d: action.id,
          },
        },
        undefined,
        { shallow: true }
      );
      return produce(state, (draft) => {
        draft.query.dataset_id = action.id;
        draft.changed = true;
      });
    case "selectVisual":
      return produce(state, (draft) => {
        draft.visualIndex = action.index;
      });
    case "replaceLastVisualUpdatingState":
      return produce(state, (draft) => {
        draft.lastVisualUpdatingState = action.visualUpdatingState;
      });
    case "appendVisual":
      return produce(state, (draft) => {
        draft.query.visualizations
          ? draft.query.visualizations.push(action.visual)
          : (draft.query.visualizations = [action.visual]);
        draft.visualIndex = draft.query.visualizations.length - 1;
      });
    case "replaceVisual":
      return produce(state, (draft) => {
        draft.query.visualizations
          ? (draft.query.visualizations[draft.visualIndex] = action.visual)
          : (draft.query.visualizations = [action.visual]);
      });
    case "removeVisual":
      return produce(state, (draft) => {
        draft.query.visualizations = draft.query.visualizations ?? [];
        const list = state.query.visualizations ?? [];
        const index = list.findIndex((v) => v === action.visual);
        draft.query.visualizations.splice(index, 1);
        draft.visualIndex = defaultVisualIndex;
      });
    case "saveQuery":
      return produce(state, (draft) => {
        draft.changed = false;
      });
    case "toggleAutosuggest":
      return produce(state, (draft) => {
        const autosuggest = !state.autosuggest;

        tryLocalStorageSetItem(
          autosuggestLocalStorageKey,
          JSON.stringify(autosuggest)
        );

        draft.autosuggest = autosuggest;
      });
    case "selectTheme":
      return produce(state, (draft) => {
        tryLocalStorageSetItem(themeLocalStorageKey, action.theme);
        draft.theme = action.theme;
      });
  }
};

export const autosuggestLocalStorageKey = "editor-state-autosuggest";
export const themeLocalStorageKey = "editor-state-theme";
export const defaultQueryName = "New Query";
export const defaultVisualIndex = 0;
export const defaultDatasetIndex = 0;
