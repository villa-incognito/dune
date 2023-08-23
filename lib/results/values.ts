/* eslint @typescript-eslint/strict-boolean-expressions: off */

import { QueryResultColumn } from "lib/results/types";
import { QueryResultRow } from "lib/results/types";
import { QueryResultValue } from "lib/results/types";
import { isNonNullable } from "lib/types/types";
import { isParsableDate } from "lib/dates/dates";
import { parseISO_ensureValidTimezone } from "lib/dates/dates";
import { isParsablePercent } from "lib/numbers/numbers";

// Guess the column types
export const guessResultColumnTypes = (
  rows: QueryResultRow[]
): QueryResultColumn[] => {
  return Object.keys(rows[0] ?? {}).map((name) => {
    // The default column type is "float" to handle
    // numeric columns that only have `null` values.
    let type: QueryResultColumn["type"] = "float";

    for (let j = 0; j < rows.length; j++) {
      if (rows[j][name] !== null) {
        type = guessColumnType(resultPrimitive(rows[j][name]));
        break;
      }
    }

    return { name, type };
  });
};

// Guess the column type from a result data row value.
export const guessColumnType = (
  value: string | number | null
): QueryResultColumn["type"] => {
  if (!isNonNullable(value)) {
    return "float";
  } else if (Array.isArray(value)) {
    return "string";
  } else if (typeof value === "object") {
    return "string";
  } else if (typeof value === "number") {
    return "float";
  } else if (typeof value === "boolean") {
    return "string";
  } else if (isParsablePercent(value)) {
    return "float";
  } else if (isParsableDate(value)) {
    return "datetime";
  } else {
    return "string";
  }
};

// Put columns in same order as columnNames array
// If columnNames array doesn't match columns, return columns as-is
export const sortColumns = (
  columns: QueryResultColumn[],
  columnNames: string[]
): QueryResultColumn[] => {
  if (columnNames.length !== columns.length) {
    return columns;
  }
  const hasAllNames = columns.every((column) =>
    columnNames.includes(column.name)
  );
  if (!hasAllNames) {
    return columns;
  }
  return columns.sort(
    (c1, c2) => columnNames.indexOf(c1.name) - columnNames.indexOf(c2.name)
  );
};

// Sometimes result data contains arrays of values instead of just primitives.
// Most of the frontend code expects primitives, so this helper is used to
// convert those arrays. We convert all arrays to joined strings as that makes
// more sense than summing or dropping values, especially for tables.
export const resultPrimitive = (
  value: QueryResultValue
): string | number | null => {
  if (value === null) {
    return null;
  } else if (Array.isArray(value)) {
    return (value as QueryResultValue[])
      .map((val) => resultPrimitive(val))
      .join(", ");
  } else if (typeof value === "object") {
    return JSON.stringify(value);
  } else if (typeof value === "boolean") {
    return String(value);
  } else if (typeof value === "string") {
    const numberValue = value.length > 0 ? Number(value) : NaN;

    // Only cast to Number when value is a string representing number and is base 10
    // parseFloat will return 0 if the string isn't base 10, whereas Number() will convert string to base 10
    const isFloatOrSafeInt =
      !Number.isInteger(numberValue) || Number.isSafeInteger(numberValue);

    const isBase10 =
      Number(value).toString(10) === parseFloat(value).toString(10) &&
      (numberValue !== 0 || value.match(/^([0-9]|e|\+|-|\.)+$/));

    if (Number.isFinite(numberValue) && isFloatOrSafeInt && isBase10) {
      return numberValue;
    }
  }

  return value;
};

// Parse a result value as a float.
export const resultFloat = (value?: QueryResultValue): number => {
  if (!value || Array.isArray(value)) {
    return 0;
  }

  const cell = value && resultPrimitive(value);
  if (typeof cell === "number") {
    return cell;
  }

  const parsed = parseFloat(resultString(cell));
  if (!Number.isFinite(parsed)) {
    return 0;
  }

  return parsed;
};

// Parse a result value as a unix timestamp.
export const resultDate = (value?: QueryResultValue): number => {
  if (!value || Array.isArray(value)) {
    return 0;
  }

  const cell = resultPrimitive(value);
  if (!cell) {
    return 0;
  }

  const parsed =
    typeof cell === "number"
      ? new Date(cell).getTime()
      : parseISO_ensureValidTimezone(cell).getTime();

  if (!Number.isFinite(parsed)) {
    return 0;
  }

  return parsed;
};

// Parse a result value as a string.
export const resultString = (value?: QueryResultValue): string => {
  if (!value) {
    return "";
  }

  const parsed = resultPrimitive(value);
  if (!parsed) {
    return "";
  }

  return String(parsed);
};
