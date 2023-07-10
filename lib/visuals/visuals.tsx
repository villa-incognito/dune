/* eslint @typescript-eslint/strict-boolean-expressions: off */

import capitalize from "lodash/capitalize";
import isEqual from "lodash/isEqual";
import { apolloCore } from "lib/apollo/apollo";
import { createQueryResultsVisual } from "gui/editor/visuals-new";
import { findVisual } from "lib/visuals/graphql";
import { FindVisualQuery } from "lib/types/graphql";
import { FindVisualQueryVariables } from "lib/types/graphql";
import { QueryVisual } from "lib/visuals/types";
import { removeNullable } from "lib/types/types";
import { SeriesOptionsRow } from "lib/visuals/types";
import { Session } from "lib/users/types";
import { UserFragment } from "lib/types/graphql";
import { Visual } from "lib/visuals/types";
import { VisualChart } from "lib/visuals/types";
import { VisualCounter } from "lib/visuals/types";
import { VisualTable } from "lib/visuals/types";
import { VisualText } from "lib/visuals/types";
import { VisualParam } from "lib/visuals/types";

export const fetchVisual = async (
  id: number,
  session?: Session,
  apiKey?: string
): Promise<QueryVisual | undefined> => {
  const res = await apolloCore.query<FindVisualQuery, FindVisualQueryVariables>(
    {
      query: findVisual,
      variables: { id },
      context: { session, apiKey },
      fetchPolicy: "no-cache",
    }
  );

  if (!res.data.visualizations_by_pk) {
    throw new VisualNotFoundError(id);
  }

  return removeNullable(res.data.visualizations_by_pk);
};

export class VisualNotFoundError extends Error {
  constructor(visualID: number) {
    super(`visual not found: ${visualID}`);
  }
}

// Get the name of a visual as best we can, for use in tab titles etc.
export const formatVisualName = (v: Visual) => {
  if (isQueryResultsTable(v)) {
    // The first visual should be the query results table.
    return "Query results";
  } else if (isVisualText(v)) {
    // Text visuals do not have names.
    return "Text";
  } else if (isVisualParam(v)) {
    // Param visuals do not have names.
    return "Param";
  } else if (v.name && v.name.toLowerCase() !== v.type) {
    // Use the visual name if it's different from the default.
    return v.name;
  } else if (isVisualChart(v) && v.options.globalSeriesType === "column") {
    // Rename column charts to bar charts in the interface.
    return "Bar chart";
  } else if (isVisualChart(v)) {
    // Use the chart type as the visual name for other charts.
    return capitalize(`${v.options.globalSeriesType} chart`);
  } else {
    return capitalize(v.type);
  }
};

export const visualIcon = (v: Visual): string => {
  switch (v.type) {
    case "text":
      return "text";
    case "param":
      return "param";
    case "table":
      return "bullet-list";
    case "counter":
      return "star";
    case "chart":
      return visualSeriesIcon(v.options.globalSeriesType);
  }
};

export const visualSeriesIcon = (type: SeriesOptionsRow["type"]): string => {
  switch (type) {
    case "column":
      return "bar-chart";
    case "area":
      return "area-chart";
    case "scatter":
      return "scatter-chart";
    case "line":
      return "line-chart";
    case "pie":
      return "pie-chart";
  }
};

// Create a mimimal UserFragment-like object from the query_details field.
export const queryDetailsOwner = (
  visual: QueryVisual
): Pick<UserFragment, "name" | "profile_image_url"> | undefined => {
  if (!visual.query_details) {
    return;
  }

  return {
    name: visual.query_details.user?.name ?? "",
    profile_image_url: visual.query_details.user?.profile_image_url,
  };
};

// Sort visuals by when they were created, with the query results first.
export const sortVisuals = <T extends Visual>(visuals: T[]): T[] => {
  return [...visuals].sort((a, b) => {
    return isQueryResultsTable(a)
      ? -1
      : isQueryResultsTable(b)
      ? 1
      : a.created_at && b.created_at
      ? a.created_at.localeCompare(b.created_at)
      : 0;
  });
};

// Get the name of a visual chart type.
export const formatVisualChartType = (v: VisualChart) => {
  return `${capitalize(v.options.globalSeriesType)} chart`;
};

// Filter out VisualText and VisualParam objects from a list of visualizations.
export const filterQueryVisuals = (vs: Visual[]): QueryVisual[] => {
  return vs.filter(isQueryVisual);
};

// Check if a Visual is (probably) the query results table.
export const isQueryResultsTable = (v: Visual) => {
  return isVisualTable(v) && isEqual(v.name, createQueryResultsVisual().name);
};

// Check if a Visual is a QueryVisual (i.e. not a VisualText).
export const isQueryVisual = (v?: Visual): v is QueryVisual => {
  return typeof v !== "undefined" && !isVisualText(v) && !isVisualParam(v);
};

// Check if a Visual is a VisualText.
export const isVisualText = (v?: Visual): v is VisualText => {
  return typeof v !== "undefined" && v.type === "text";
};

// Check if a Visual is a VisualCounter.
export const isVisualCounter = (v?: Visual): v is VisualCounter => {
  return typeof v !== "undefined" && v.type === "counter";
};

// Check if a Visual is a VisualTable.
export const isVisualTable = (v?: Visual): v is VisualTable => {
  return typeof v !== "undefined" && v.type === "table";
};

// Check if a Visual is a VisualChart.
export const isVisualChart = (v?: Visual): v is VisualChart => {
  return typeof v !== "undefined" && v.type === "chart";
};

// Check if a Visual is a VisualParam.
export const isVisualParam = (v?: Visual): v is VisualParam => {
  return typeof v !== "undefined" && v.type === "param";
};
