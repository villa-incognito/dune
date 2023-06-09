import padStart from "lodash/padStart";
import { format } from "date-fns-tz";
import { parseISO } from "date-fns";
import { differenceInDays } from "date-fns";
import { utcToZonedTime } from "date-fns-tz";
import { formatDistanceStrict } from "date-fns";

import * as Sentry from "@sentry/react";

// Format a duration from a number of seconds.
export const formatSeconds = (seconds: number) => {
  return formatDistanceStrict(0, seconds * 1000);
};

// Format an minutes:seconds elapsed timestamp from a date.
export const formatTimer = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = seconds - m * 60;
  const padM = padStart(String(m), 2, "0");
  const padS = padStart(String(s), 2, "0");
  return `${padM}:${padS}`;
};

// Format a date dynamically based on the duration between t0 and t1.
export const formatDate = (date: string, t0: string, t1: string) => {
  const days = Math.abs(differenceInDays(parseUTC(t1), parseUTC(t0)));

  if (days > 180) {
    return format(parseUTC(date), "LLL yyyy");
  } else if (days > 1) {
    return format(parseUTC(date), "LLL do");
  } else {
    return format(parseUTC(date), "HH:mm");
  }
};

// Format a date as year/month.
export const formatDateMY = (date: string) => {
  return format(parseUTC(date), "LLL yyyy");
};

// Format a date as year/month/date/hour/minute.
export const formatDateYMDHM = (date: string) => {
  return format(parseUTC(date), "yyyy-MM-dd HH:mm");
};

// Format a date as year/month/day.
export const formatDateYMD = (date: string) => {
  return format(parseUTC(date), "yyyy-MM-dd");
};

// Format a date as e.g. "January 1, 1970".
export const formatDateMDY = (date: string) => {
  return format(parseUTC(date), "MMMM d, yyyy");
};

// Format a date as e.g. "October 1st, 2022 — 3:51 PM".
export const formatDateFull = (date: string) => {
  return format(parseUTC(date), "MMMM do, yyyy — h:mm a");
};

/*
 * Parse a string into a UTC Date.
 *
 * We use [utcToZonedTime][] to convert e.g. 13:37 UTC to 13:37 in the
 * local timezone of the computer that runs the app. (Technically, the
 * created date thus represents a different point in time than the input
 * string, but the intention is to display the date and time as UTC.)
 *
 * [parseISO][] is used to enable parsing partial ISO Date strings.
 *
 * If the date string is missing timezone, we must add timezone
 * information. Otherwise we will end up rendering the Date incorrectly
 * unless the user happens to be in UTC+00.
 *
 * [utcToZonedTime]: https://github.com/marnusw/date-fns-tz#utcToZonedTime
 * [parseISO]: https://date-fns.org/v2.16.1/docs/parseISO
 */
const parseUTC = (dateString: string): Date => {
  return utcToZonedTime(parseISO_ensureValidTimezone(dateString), "UTC");
};
export const parseISO_ensureValidTimezone = (dateString: string): Date => {
  let date: Date = parseISO(dateString);

  if (!hasTimezone(dateString)) {
    const dateAddedTimezone = parseISO(dateString + "Z");

    if (isNaN(dateAddedTimezone.valueOf())) {
      Sentry.captureException(
        Error(`Failed to correctly add timezone to date "${dateString}"`)
      );
    } else {
      date = dateAddedTimezone;
    }
  } else if (hasUtcTimezone(dateString)) {
    const dateReplacedTimezone = parseISO(
      dateString.replace(hasUtcTimezoneRegexp, "Z")
    );

    if (isNaN(dateReplacedTimezone.valueOf())) {
      Sentry.captureException(
        Error(
          `Failed to correctly change timezone form UTC to Z for date "${dateString}"`
        )
      );
    } else {
      date = dateReplacedTimezone;
    }
  }

  if (isNaN(date.valueOf())) {
    Sentry.captureException(Error(`Invalid ISO date: "${dateString}"`));
  }

  return date;
};

// Check if a date is an ISO date with at least a date and a time.
export const isParsableDate = (date: string) => {
  return isolikeRegexp.test(date);
};

export const hasTimezone = (date: string) => {
  return hasTimezoneRegexp.test(date);
};

export const hasUtcTimezone = (date: string) => {
  return hasUtcTimezoneRegexp.test(date);
};

// ISO8601-compliant OR with " UTC" timezone
const isolikeRegexp = /^\d{4}-[01]\d-[0-3]\d[T ][0-2]\d:[0-5]\d:[0-5]\d(\.\d+)?([+-][0-2]\d:[0-5]\d|Z| UTC)?$/;
const hasTimezoneRegexp = /([+-][0-2]\d:[0-5]\d|Z| UTC)$/;
const hasUtcTimezoneRegexp = / UTC$/;
