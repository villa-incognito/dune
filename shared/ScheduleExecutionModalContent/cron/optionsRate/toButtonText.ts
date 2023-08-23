import { RateOption } from "./dataModel";
import { assertUnreachable } from "src/utils/assertUnreachable";

export function toButtonText(option: RateOption) {
  switch (option) {
    case "15 minutes":
      return "15m";
    case "20 minutes":
      return "20m";
    case "30 minutes":
      return "30m";

    case "1 hour":
      return "1h";
    case "2 hours":
      return "2h";
    case "3 hours":
      return "3h";
    case "4 hours":
      return "4h";
    case "6 hours":
      return "6h";
    case "8 hours":
      return "8h";
    case "12 hours":
      return "12h";

    case "Day":
      return "Daily";
    case "Every Monday":
      return "Mondays";
    case "Every Tuesday":
      return "Tuesdays";
    case "Every Wednesday":
      return "Wednesdays";
    case "Every Thursday":
      return "Thursdays";
    case "Every Friday":
      return "Fridays";
    case "Every Saturday":
      return "Saturdays";
    case "Every Sunday":
      return "Sundays";

    default:
      assertUnreachable(option);
  }
}
