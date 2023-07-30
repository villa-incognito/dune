import cronParser from "cron-parser";

/**
 * CronString:
 *
 * Correct union type would be too complex to represent. Must use
 * `number` instead of `IntRange` to reduce complexity.
 */
type X = "*" | `${number}` | `*/${number}`;

export type CronString = `${X} ${X} ${X} ${X} ${X}`;

const xStepValueRegex = /^\*\/(\d+)$/; // Given "*/59" match is "59"

const isValidXWithinRange = (x: string | undefined) => (
  min: number,
  max: number
) => {
  if (typeof x !== "string") {
    return false;
  }

  if (x === "*") {
    return true;
  }

  const matches = x.match(xStepValueRegex);
  const number = Number(matches ? matches[1] : x);

  const isNumber = !Number.isNaN(number);

  return isNumber && min <= number && number <= max;
};

/**
 * CronObject:
 *
 * Helper to make valid CronString
 */
export interface CronObject {
  minute: X;
  hour: X;
  dayOfMonth: X;
  month: X;
  weekday: X;
}

function isValidCronObject(
  object: Record<keyof CronObject, string>
): object is CronObject {
  return (
    isValidXWithinRange(object.minute)(0, 59) &&
    isValidXWithinRange(object.hour)(0, 23) &&
    isValidXWithinRange(object.dayOfMonth)(1, 31) &&
    isValidXWithinRange(object.month)(1, 12) &&
    isValidXWithinRange(object.weekday)(0, 6)
  );
}

export function isValidCronString(string: string): string is CronString {
  const parts = string.split(" ");

  if (parts.length !== 5) {
    return false;
  }

  const [minute, hour, dayOfMonth, month, weekday] = parts;

  const object = {
    minute,
    hour,
    dayOfMonth,
    month,
    weekday,
  };

  return isValidCronObject(object);
}

/** Transformation functions **/

const star: X = "*";

export function toCronString({
  minute = star,
  hour = star,
  dayOfMonth = star,
  month = star,
  weekday = star,
}: Partial<CronObject>): CronString {
  return `${minute} ${hour} ${dayOfMonth} ${month} ${weekday}`;
}

export function toCronObject(string: CronString): CronObject {
  const parts = string.split(" ");

  if (parts.length !== 5) {
    throw Error("Could not parse cron string");
  }

  const [minute, hour, dayOfMonth, month, weekday] = parts;

  const object = {
    minute,
    hour,
    dayOfMonth,
    month,
    weekday,
  };

  if (!isValidCronObject(object)) {
    throw Error("Could not parse cron string");
  }

  return object;
}

export const patchCronString = (prevString: CronString) => (
  overrides: Partial<CronObject>
) => {
  const cronObject = {
    ...toCronObject(prevString),
    ...overrides,
  };

  if (!isValidCronObject(cronObject)) {
    throw Error(`Invalid cron object -> "${toCronString(cronObject)}"`);
  }

  return toCronString(cronObject);
};

export const getNextCronRun = (cronString: CronString) => {
  try {
    const interval = cronParser.parseExpression(cronString);

    return interval.next().toDate();
  } catch {
    return null;
  }
};

export const getPreviousCronRun = (
  cronString: CronString,
  dateString: string
) => {
  try {
    const interval = cronParser.parseExpression(cronString);
    const previousRunDate = interval.prev().toDate();

    if (previousRunDate < new Date(dateString)) {
      return null;
    }

    return previousRunDate;
  } catch {
    return null;
  }
};
