import { renderMarkdown } from "lib/html/markdown";
import { VisualParam, VisualText } from "lib/visuals/types";
import { ParamWidget, TextWidget } from "lib/widgets/types";
import { VisualizationWidget } from "lib/widgets/types";
import { FullDashboard } from "lib/entries/types";

// Create default options for a new dashboard widget.
export const createWidgetOptions = ():
  | TextWidget["options"]
  | VisualizationWidget["options"] => {
  return {
    position: {
      sizeX: 3,
      sizeY: 8,
    },
  };
};

// Some dashboard widgets need preprocessing before they can be
// used by the rest of the app. In particular, text widgets need
// to have their type field fixed and their markdown rendered.
export const preprocessWidgets = (dashboard: FullDashboard) => {
  if (dashboard?.text_widgets || dashboard?.param_widgets) {
    return {
      ...dashboard,
      text_widgets: dashboard.text_widgets?.map(parseWidgetText),
      param_widgets: dashboard.param_widgets?.map(parseParamWidgets),
    };
  }

  return dashboard;
};

// Process a text widget by parsing its text as markdown.
const parseWidgetText = (widget: TextWidget) => {
  if (widget.text) {
    return {
      ...widget,
      visualization: {
        ...widget.visualization,
        type: "text",
        html: renderMarkdown(widget.text),
      } as VisualText,
    };
  }

  return widget;
};

const parseParamWidgets = (widget: ParamWidget) => {
  if (widget.key) {
    return {
      ...widget,
      visualization: {
        ...widget.visualization,
        type: "param",
        key: widget.key,
      } as VisualParam,
    };
  }

  return widget;
};
