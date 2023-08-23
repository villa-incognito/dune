import { objectEntries } from "src/utils/array";
import {
  toCronObject,
  patchCronString,
  CronString,
  CronObject,
} from "../cronUtils";

import { RateOption, rateOptions } from "./dataModel";

export function hasTimeOfDay(cronString: CronString) {
  return /^\d+ \d+/.test(cronString);
}

/* CronString <--> Selected option */

export function toRateOption(cronString: CronString): RateOption | undefined {
  if (/^\d+ \d+ \* \* \*$/.test(cronString)) {
    return "Day";
  }
  if (/^\d+ \d+ \* \* \d+$/.test(cronString)) {
    const dayIndex = Number(cronString.split(" ").slice(-1)[0]);
    const days: RateOption[] = [
      "Every Sunday",
      "Every Monday",
      "Every Tuesday",
      "Every Wednesday",
      "Every Thursday",
      "Every Friday",
      "Every Saturday",
    ];
    const day: RateOption | undefined = days[dayIndex];

    return day;
  }

  return rateOptions.find(optionMatching(cronString));
}

function optionMatching(cronString: CronString) {
  const cronObject = toCronObject(cronString);

  return (option: RateOption) => {
    const overrides = getCronObjectOverrides(cronString, option);

    return objectEntries(overrides).every(
      ([key, value]) => cronObject[key] === value
    );
  };
}

export function applyRateOptionToCronString(
  cronString: CronString,
  option: RateOption
): CronString {
  return patchCronString(cronString)(
    getCronObjectOverrides(cronString, option)
  );
}

function getCronObjectOverrides(
  currentCronString: CronString,
  option: RateOption
): Partial<CronObject> {
  const perDayOverrides = hasTimeOfDay(currentCronString)
    ? {}
    : currentHalfHour();

  switch (option) {
    case "15 minutes":
      return { minute: "*/15", hour: "*", weekday: "*" };
    case "20 minutes":
      return { minute: "*/20", hour: "*", weekday: "*" };
    case "30 minutes":
      return { minute: "*/30", hour: "*", weekday: "*" };

    case "1 hour":
      return { minute: "0", hour: "*", weekday: "*" };
    case "2 hours":
      return { minute: "0", hour: "*/2", weekday: "*" };
    case "3 hours":
      return { minute: "0", hour: "*/3", weekday: "*" };
    case "4 hours":
      return { minute: "0", hour: "*/4", weekday: "*" };
    case "6 hours":
      return { minute: "0", hour: "*/6", weekday: "*" };
    case "8 hours":
      return { minute: "0", hour: "*/8", weekday: "*" };
    case "12 hours":
      return { minute: "0", hour: "*/12", weekday: "*" };

    case "Day":
      // Time of day resets to midnight. Can be changed in FieldTimeOfDay.
      return { weekday: "*", ...perDayOverrides };

    case "Every Sunday":
      return { weekday: "0", ...perDayOverrides };
    case "Every Monday":
      return { weekday: "1", ...perDayOverrides };
    case "Every Tuesday":
      return { weekday: "2", ...perDayOverrides };
    case "Every Wednesday":
      return { weekday: "3", ...perDayOverrides };
    case "Every Thursday":
      return { weekday: "4", ...perDayOverrides };
    case "Every Friday":
      return { weekday: "5", ...perDayOverrides };
    case "Every Saturday":
      return { weekday: "6", ...perDayOverrides };
  }
}

export function currentHalfHour(): Pick<CronObject, "minute" | "hour"> {
  return {
    minute: new Date().getMinutes() < 30 ? "0" : "30",
    hour: `${new Date().getHours()}`,
  };
}
