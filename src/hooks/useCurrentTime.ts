import format from "date-fns/format";
import { useEffect, useState } from "react";

export const EASTERN_TIME_ZONE = "America/New_York";

export type DateFormat = "currentTime";

export function formatDate(date: Date, dateFormat: DateFormat): string {
  switch (dateFormat) {
    case "currentTime":
      return format(date, "h:mm:ss a");
  }
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
