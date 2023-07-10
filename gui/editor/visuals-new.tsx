/* eslint @typescript-eslint/strict-boolean-expressions: off */

import React from "react";
import styles from "gui/editor/visuals-new.module.css";
import { Box } from "gui/box/box";
import { ButtonOld } from "components/ButtonOld/ButtonOld";
import { callInsertVisualisation } from "./graphql";
import { ChartType } from "lib/visuals/types";
import { FieldButtons } from "gui/input/fields";
import { FieldLabel } from "gui/input/fields";
import { Fields } from "gui/input/fields";
import { InputSelect } from "gui/input/input";
import { QueryResult } from "lib/results/types";
import { QueryVisual } from "lib/visuals/types";
import { NoId, removeNullable } from "lib/types/types";
import { useEditorDispatch } from "gui/editor/context";
import { useEditorQueryId } from "gui/editor/context";
import { useEditorResult } from "gui/editor/context";
import { useErrorBoundary } from "lib/hooks/use-error-boundary";
import { useRequiredSession } from "gui/session/session";
import { VisualChart } from "lib/visuals/types";
import { VisualCounter } from "lib/visuals/types";
import { VisualTable } from "lib/visuals/types";
import { useRouter } from "next/router";

export const EditorVisualsNew: React.FC = () => {
  const dispatch = useEditorDispatch();
  const result = useEditorResult();
  const session = useRequiredSession();
  const queryId = useEditorQueryId();
  const [type, setType] = React.useState("column");
  const [isCreating, setIsCreating] = React.useState(false);
  const setError = useErrorBoundary();
  const router = useRouter();

  const onSubmit = (event: React.SyntheticEvent) => {
    event.preventDefault();
    setIsCreating(true);
    const visual = createVisual(type, result);
    if (!queryId) {
      setError(new Error("Cannot create visualisation with no queryId"));
      return;
    }
    callInsertVisualisation(queryId, visual, session)
      .then((res) => {
        setIsCreating(false);
        const visual = removeNullable<QueryVisual>(
          res.data?.insert_visualizations_one
        );
        if (!visual) {
          setError(new Error("No visualization returned from server"));
          return;
        }
        dispatch({
          type: "appendVisual",
          visual,
        });

        // Update route with new visualization id
        if (queryId && visual.id) {
          router.replace({
            query: { ...router.query, slug: [queryId, visual.id] },
          });
        }
      })
      .catch((err) => {
        setError(err);
        setIsCreating(false);
      });
  };

  return (
    <form onSubmit={onSubmit}>
      <Box className={styles.new} size="sm" color1>
        <Fields size="sm">
          <FieldLabel label="Select visualization type">
            <InputSelect
              value={type}
              onChange={(event) => setType(event.target.value)}
            >
              <optgroup label="Chart visualizations">
                <option value="column">Bar chart</option>
                <option value="area">Area chart</option>
                <option value="scatter">Scatter chart</option>
                <option value="line">Line chart</option>
                <option value="pie">Pie chart</option>
              </optgroup>
              <optgroup label="Other visualizations">
                <option value="counter">Counter</option>
                <option value="table">Table</option>
              </optgroup>
            </InputSelect>
          </FieldLabel>
          <FieldButtons>
            <ButtonOld disabled={isCreating} type="submit" size="sm" color2>
              {isCreating ? "Loading" : "Add visualization"}
            </ButtonOld>
          </FieldButtons>
        </Fields>
      </Box>
    </form>
  );
};

const createVisual = (
  type: string,
  result?: QueryResult
): NoId<QueryVisual> => {
  switch (type) {
    case "column":
    case "area":
    case "scatter":
    case "line":
    case "pie":
      return createChartVisual(type, result);
    case "counter":
      return createCounterVisual(result);
    case "table":
      return createTableVisual();
    default:
      throw new Error(`unknown visual type: ${type}`);
  }
};

const createTableVisual = (): NoId<VisualTable> => {
  return {
    type: "table",
    name: "Table",
    options: {},
  };
};

// The default query results table visual.
export const createQueryResultsVisual = (): NoId<VisualTable> => {
  return {
    type: "table",
    name: "Query results",
    options: {},
  };
};

const createCounterVisual = (result?: QueryResult): NoId<VisualCounter> => {
  const columns = result?.matrix?.columns ?? [];

  const visual: NoId<VisualCounter> = {
    type: "counter",
    name: "Counter",
    options: {
      rowNumber: 1,
    },
  };

  if (columns[0]) {
    // Use the first result column as the default counter value.
    visual.options.counterColName = columns[0].name;
  }

  return visual;
};

const createChartVisual = (
  type: ChartType,
  result?: QueryResult
): NoId<VisualChart> => {
  const columns = result?.matrix?.columns ?? [];

  const visual: NoId<VisualChart> = {
    type: "chart",
    name: "Chart",
    options: {
      globalSeriesType: type,
      sortX: true,
      reverseX: false,
      xAxis: { type: "-" },
      yAxis: [{ type: "linear" }],
      legend: { enabled: true },
      columnMapping: {},
      seriesOptions: {},
      valuesOptions: {},
    },
  };

  // Use the first datetime column or first column as the default x.
  // Use the column following the x column (if any) as the default y.
  const x = columns.find((c) => c.type === "datetime") ?? columns[0];
  const y = x && columns[columns.indexOf(x) + 1];

  if (x) {
    visual.options.columnMapping![x.name] = "x";
  }

  if (y) {
    visual.options.columnMapping![y.name] = "y";
  }

  return visual;
};
