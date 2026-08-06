import { useSearchParams } from "react-router-dom";
import type { ScheduleDay, ScheduleItem } from "../state/event.slice";
import { useAppState } from "../state/store";
import styles from "./schedule.css";

function isScheduleDay(value: string | null): value is ScheduleDay {
  return value === "fri" || value === "sat" || value === "sun";
}

const DAY_LABELS: Record<ScheduleDay, string> = {
  fri: "Friday",
  sat: "Saturday",
  sun: "Sunday",
};

// Times are stored wall-clock, as-typed (e.g. "20:30") — format for
// display only, with no timezone conversion.
function formatDisplayTime(time: string | undefined): string {
  if (!time) return "";
  const [hStr, mStr] = time.split(":");
  const hours = Number(hStr);
  const minutes = Number(mStr);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return "";
  const period = hours >= 12 ? "pm" : "am";
  const displayHour = hours % 12 === 0 ? 12 : hours % 12;
  return `${displayHour}:${String(minutes).padStart(2, "0")}${period}`;
}

function sortedByTime(items: ScheduleItem[]): ScheduleItem[] {
  return [...items].sort((a, b) => (a.time ?? "").localeCompare(b.time ?? ""));
}

export function Schedule() {
  const [searchParams] = useSearchParams();
  const dayParam = searchParams.get("day");
  const day = isScheduleDay(dayParam) ? dayParam : null;
  const bgaOff = searchParams.get("bgaOff") === "true";
  const items = useAppState((s) =>
    day ? (s.event.tournament?.schedules?.[day]?.items ?? []) : [],
  );

  if (!day) {
    return null;
  }

  const rows = sortedByTime(items).filter((row) => row.time || row.event);

  return (
    <div className={styles.canvas}>
      <div
        className={
          bgaOff ? `${styles.content} ${styles.contentNoBg}` : styles.content
        }
      >
        <div className={styles.header}>
          <div className={styles.titleWrap}>
            <h1 className={styles.titleStroke}>Schedule</h1>
            <h1 className={styles.title}>Schedule</h1>
          </div>
          <div className={styles.dayWrap}>
            <h2 className={styles.dayStroke}>{DAY_LABELS[day]}</h2>
            <h2 className={styles.day}>{DAY_LABELS[day]}</h2>
          </div>
        </div>
        {rows.length > 0 && (
          <div className={styles.list}>
            {rows.map((row, i) => (
              <div
                className={styles.row}
                key={i}
                style={{ animationDelay: `${0.6 + i * 0.05}s` }}
              >
                <span className={styles.time}>
                  <span className={styles.timeText}>
                    {formatDisplayTime(row.time)}
                  </span>
                </span>
                <span className={styles.eventCol}>
                  <span className={styles.event}>{row.event}</span>
                  {row.description && (
                    <span className={styles.description}>
                      {row.description}
                    </span>
                  )}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
