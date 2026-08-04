import format from "date-fns/format";
import formatDistanceToNow from "date-fns/formatDistanceToNow";
import { useEffect, useState } from "react";

export const EASTERN_TIME_ZONE = "America/New_York";

export type DateFormat = "currentTime";

export function formatDate(date: Date, dateFormat: DateFormat): string {
  switch (dateFormat) {
    case "currentTime":
      return format(date, "h:mm:ss a");
  }
}

/**
 * Formats how long ago (or from now) a date is, e.g. "5 minutes ago".
 * Pure — computed against the current wall-clock time at call time, so a
 * caller that wants this to stay live must re-render periodically itself
 * (e.g. by calling useCurrentTime() to force a tick) and re-call this on
 * each render rather than memoizing the result.
 */
export function formatTimeAgo(date: Date | string | number): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

function getZonedDate(timeZone: string): Date {
  return new Date(new Date().toLocaleString("en-US", { timeZone }));
}

/**
 * Ticking clock hook. Returns a Date whose local getters (getHours,
 * getMinutes, etc) reflect the given IANA timeZone, so it can be passed
 * straight into date-fns formatters. Updates once per second.
 */
export function useCurrentTime(timeZone: string = EASTERN_TIME_ZONE): Date {
  const [now, setNow] = useState(() => getZonedDate(timeZone));

  useEffect(() => {
    setNow(getZonedDate(timeZone));
    const interval = setInterval(() => setNow(getZonedDate(timeZone)), 1000);
    return () => clearInterval(interval);
  }, [timeZone]);

  return now;
}
