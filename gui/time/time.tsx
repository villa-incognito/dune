/* eslint @typescript-eslint/strict-boolean-expressions: off */

import React from "react";
import { Nullable } from "lib/types/types";
import { differenceInSeconds } from "date-fns";
import { formatDistanceStrict } from "date-fns";
import { formatRFC7231 } from "date-fns";
import { formatTimer } from "lib/dates/dates";
import { fromUnixTime } from "date-fns";
import { parseISO } from "date-fns";
import { useForceUpdate } from "lib/hooks/useForceUpdate";

type DateValue = string | number | Date;

type Props = {
  children: Nullable<DateValue>;
  counter?: boolean;
};

export const TimeRelative = (props: Props) => {
  const time = getTimeRelative({
    now: useCurrentDate(),
    time: props.children,
    counter: props.counter,
  });

  if (!time) {
    return null;
  }

  return (
    <time dateTime={time.abs} title={time.abs}>
      {time.rel}
    </time>
  );
};

export interface TimeRelative {
  rel: string;
  abs: string;
  iso: Date;
}

export function getTimeRelative({
  now,
  time,
  counter,
}: {
  now: ReturnType<typeof Date.now>;
  time: Nullable<DateValue>;
  counter?: boolean;
}): TimeRelative | undefined {
  if (!time) {
    return;
  }

  const iso = parseInputDate(time);
  const abs = formatRFC7231(iso);

  if (counter) {
    return {
      iso,
      abs,
      rel: formatTimer(differenceInSeconds(now, iso)),
    };
  }

  const fmt = formatDistanceStrict(iso, now, { addSuffix: true });
  const rel = fmt.includes("second") ? "Just now" : fmt;

  return {
    rel,
    abs,
    iso,
  };
}

export function formatDistanceStrictMinimal({
  now,
  date,
}: {
  now: ReturnType<typeof Date.now>;
  date: Date;
}) {
  const fmt = formatDistanceStrict(date, now);

  if (fmt.includes("second")) {
    return "Now";
  }

  return fmt
    .replace(" minutes", "min")
    .replace(" minute", "min")
    .replace(" hours", "h")
    .replace(" hour", "h")
    .replace(" days", "d")
    .replace(" day", "d")
    .replace(" months", "mo")
    .replace(" month", "mo")
    .replace(" years", "y")
    .replace(" year", "y");
}

export const useCurrentDate = () => {
  const forceUpdate = useForceUpdate();

  React.useEffect(() => {
    const id = setInterval(forceUpdate, 1000);
    return () => clearInterval(id);
  }, [forceUpdate]);

  return Date.now();
};

const parseInputDate = (date: DateValue) => {
  if (typeof date === "string") {
    return parseISO(date);
  } else if (typeof date === "number") {
    return fromUnixTime(date);
  } else {
    return fromUnixTime(date.getTime() / 1000);
  }
};
