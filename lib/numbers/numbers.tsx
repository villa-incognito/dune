/* eslint @typescript-eslint/strict-boolean-expressions: off */

import numeral from "numeral";

// Format a number using a Numeral.js number format string.
// Handle an issue where the numeral lib returns NaN for small numbers.
export const formatNumber = (x: number, format?: string) => {
  /*
   * For small numbers (< 1e-6) always use scientific notation format,
   * because numeral cannot handle them:
   *
   * - String(1e-7) returns "1e-7" (Scientific notation)
   * - numeral(1e-7).format() returns "NaN"
   */
  if (Math.abs(x) < 1e-6) {
    return String(x);
  }

  if (!format) {
    return String(x);
  }

  try {
    return numeral(x).format(format);
  } catch (e: any) {
    // If format is invalid, format() might throw a RangeError exception
    return String(x);
  }
};

export const parseFloatFallback = <T,>(x: string, fallback: T) => {
  const n = parseFloat(x);
  return Number.isNaN(n) ? fallback : n;
};

export const parseIntFallback = <T,>(x: string, fallback: T) => {
  const n = parseInt(x, 10);
  return Number.isNaN(n) ? fallback : n;
};

export const parseIntBounded = (x: string, min: number, max: number) => {
  const n = parseIntFallback(x, min);
  return Math.max(min, Math.min(max, n));
};

export const isParsablePercent = (x: any) => {
  return (
    typeof x === "string" && x.endsWith("%") && Number.isFinite(parseFloat(x))
  );
};
