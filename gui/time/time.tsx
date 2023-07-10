/* eslint @typescript-eslint/strict-boolean-expressions: off */

import React from "react";
import { Nullable } from "lib/types/types";
import { differenceInSeconds } from "date-fns";
import { formatDistanceStrict } from "date-fns";
import { formatRFC7231 } from "date-fns";
import { formatTimer } from "lib/dates/dates";
import { fromUnixTime } from "date-fns";
import { parseISO } from "date-fns";

type DateValue = string | number | Date;

type Props = {
  children: Nullable<DateValue>;
  counter?: boolean;
};

export const TimeRelative = (props: Props) => {
  const time = useTimeRelative(props.children, props.counter);

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

export const useTimeRelative = (
  value: Nullable<DateValue>,
  counter?: boolean
): TimeRelative | undefined => {
  const now = useCurrentDate();

  if (!now || !value) {
    return;
  }

  const iso = parseInputDate(value);
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
};

const useCurrentDate = () => {
  const [now, setNow] = React.useState<number>();

  React.useEffect(() => {
    const fn = () => setNow(Date.now());
    fn();
    const id = setInterval(fn, 1000);
    return () => clearInterval(id);
  }, []);

  return now;
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
