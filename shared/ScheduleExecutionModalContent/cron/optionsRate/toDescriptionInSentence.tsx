import { RateOption } from "./dataModel";
import { assertUnreachable } from "lib/assertUnreachable";

export function toDescriptionInSentence(option: RateOption) {
  switch (option) {
    case "15 minutes":
      return "15 minutes";
    case "20 minutes":
      return "20 minutes";
    case "30 minutes":
      return "30 minutes";

    case "1 hour":
      return "hour";
    case "2 hours":
      return "2 hours";
    case "3 hours":
      return "3 hours";
    case "4 hours":
      return "4 hours";
    case "6 hours":
      return "6 hours";
    case "8 hours":
      return "8 hours";
    case "12 hours":
      return "12 hours";

    case "Day":
      return "day";
    case "Every Monday":
      return "Monday";
    case "Every Tuesday":
      return "Tuesday";
    case "Every Wednesday":
      return "Wednesday";
    case "Every Thursday":
      return "Thursday";
    case "Every Friday":
      return "Friday";
    case "Every Saturday":
      return "Saturday";
    case "Every Sunday":
      return "Sunday";

    default:
      assertUnreachable(option);
  }
}
