import { assertUnreachable } from "lib/assertUnreachable";

/* Data model (selectable options) */

export const rateTabs = ["Minute", "Hour", "Day", "Week"] as const;
export type RateTab = typeof rateTabs[number];

export const rateOptions = [
  "15 minutes",
  "20 minutes",
  "30 minutes",
  "1 hour",
  "2 hours",
  "3 hours",
  "4 hours",
  "6 hours",
  "8 hours",
  "12 hours",
  "Day",
  "Every Monday",
  "Every Tuesday",
  "Every Wednesday",
  "Every Thursday",
  "Every Friday",
  "Every Saturday",
  "Every Sunday",
] as const;

export type RateOption = typeof rateOptions[number];

export function getRateOptions(tab: RateTab): readonly RateOption[] {
  switch (tab) {
    case "Minute":
      return ["15 minutes", "20 minutes", "30 minutes"] as const;
    case "Hour":
      return [
        "1 hour",
        "2 hours",
        "3 hours",
        "4 hours",
        "6 hours",
        "8 hours",
        "12 hours",
      ] as const;
    case "Day":
      return ["Day"] as const;
    case "Week":
      return [
        "Every Monday",
        "Every Tuesday",
        "Every Wednesday",
        "Every Thursday",
        "Every Friday",
        "Every Saturday",
        "Every Sunday",
      ] as const;
    default:
      assertUnreachable(tab);
  }
}
