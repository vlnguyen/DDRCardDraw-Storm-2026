import { useLayoutEffect, useRef, useState } from "react";
import entrants from "../assets/entrants/entrants.json";
import {
  entrantsMap,
  eventsMap,
  SEED_UNSEEDED,
  type EventKey,
} from "../assets/entrants/entrantsMap";
import { useAppState } from "../state/store";
import styles from "./weigh-in.css";

type EntrantRecord = (typeof entrants)[number];

const entrantById = new Map(entrants.map((entrant) => [entrant.id, entrant]));

const RECENT_PLACEMENT_COUNT = 5;
const CURRENT_ITL_KEY = "itl2026" satisfies EventKey;

function ordinal(n: number): string {
  const mod100 = n % 100;
  if (mod100 >= 11 && mod100 <= 13) return `${n}th`;
  switch (n % 10) {
    case 1:
      return `${n}st`;
    case 2:
      return `${n}nd`;
    case 3:
      return `${n}rd`;
    default:
      return `${n}th`;
  }
}

interface RecentPlacement {
  key: EventKey;
  placement: number;
  name: string;
  date: string;
}

/** Most recent placements only — `entrantPlacements` also carries ITL ranking
 * point totals under `${year}rp` keys, which aren't placements at all and
 * aren't in `eventsMap`, so they're filtered out by the `key in eventsMap` check.
 * `CURRENT_ITL_KEY` is excluded too, since it's always shown as its own
 * leading line (with ranking points) rather than in this list. */
function getRecentPlacements(entrantId: number | undefined): RecentPlacement[] {
  if (entrantId == null) return [];
  const placements = entrantsMap[entrantId]?.entrantPlacements;
  if (!placements) return [];
  return Object.entries(placements)
    .filter(
      (entry): entry is [EventKey, number] =>
        entry[0] in eventsMap && entry[0] !== CURRENT_ITL_KEY,
    )
    .map(([key, placement]) => {
      const event = eventsMap[key];
      return { key, placement, name: event.name, date: event.date };
    })
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, RECENT_PLACEMENT_COUNT);
}

/** The current event's own placement, always shown first (when known) with
 * its ranking points alongside — distinct from `getRecentPlacements`, which
 * covers prior tournaments. */
function getCurrentItlLine(entrantId: number | undefined): string | undefined {
  if (entrantId == null) return undefined;
  const placements = entrantsMap[entrantId]?.entrantPlacements;
  const rank = placements?.[CURRENT_ITL_KEY];
  if (rank == null) return undefined;
  const rankingPoints = placements?.[`${CURRENT_ITL_KEY}rp`];
  const event = eventsMap[CURRENT_ITL_KEY];
  return rankingPoints != null
    ? `${event.name}: ${ordinal(rank)} (${rankingPoints.toLocaleString()} RP)`
    : `${event.name}: ${ordinal(rank)}`;
}

/** The name/rank/prefix section — this is what drives the shared width of
 * both sides (see usePlayerBoxWidth below), alongside the placements
 * section. */
function NameSection({ entrant }: { entrant: EntrantRecord | undefined }) {
  const seed = entrant ? entrantsMap[entrant.id]?.seed : undefined;
  return (
    <div className={styles.nameBlock}>
      <div className={styles.gamerTag}>
        {entrant?.gamerTag}
        {seed != null && seed !== SEED_UNSEEDED && (
          <sub className={styles.seed}>{seed}</sub>
        )}
      </div>
      {entrant?.prefix && (
        <div className={styles.prefix}>{entrant.prefix}</div>
      )}
    </div>
  );
}

function PlacementsSection({ entrant }: { entrant: EntrantRecord | undefined }) {
  const currentItlLine = getCurrentItlLine(entrant?.id);
  const placements = getRecentPlacements(entrant?.id);
  return (
    <ul className={styles.placements}>
      {currentItlLine && <li className={styles.placement}>{currentItlLine}</li>}
      {placements.map((p) => (
        <li key={p.key} className={styles.placement}>
          {ordinal(p.placement)} @ {p.name}
        </li>
      ))}
    </ul>
  );
}

/**
 * CSS alone can't size p1's box to match p2's (or vice versa) — each flex
 * item only knows its own content. So both the name section and the
 * placements section, for both sides, are rendered a second time off-screen
 * and unconstrained, purely to measure their natural widths; whichever of
 * those four is widest is then applied via ResizeObserver (re-firing
 * whenever either entrant changes) to `.content` — an unpadded wrapper
 * inside the padded/backgrounded outer `.p1`/`.p2` box. Applying it there
 * rather than directly to the (border-box, padded) outer box matters: doing
 * it on the outer box would eat into the available content width by its own
 * padding, clipping text that was measured without that padding in the way.
 */
function usePlayerBoxWidth(
  p1: EntrantRecord | undefined,
  p2: EntrantRecord | undefined,
) {
  const p1NameGhostRef = useRef<HTMLDivElement>(null);
  const p2NameGhostRef = useRef<HTMLDivElement>(null);
  const p1PlacementsGhostRef = useRef<HTMLDivElement>(null);
  const p2PlacementsGhostRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState<number>();

  useLayoutEffect(() => {
    const els = [
      p1NameGhostRef.current,
      p2NameGhostRef.current,
      p1PlacementsGhostRef.current,
      p2PlacementsGhostRef.current,
    ];
    if (els.some((el) => el == null)) return;

    const measure = () => {
      setWidth(Math.max(...els.map((el) => el!.offsetWidth)));
    };
    measure();

    const observer = new ResizeObserver(measure);
    for (const el of els) observer.observe(el!);
    return () => observer.disconnect();
  }, [p1?.id, p2?.id]);

  return {
    p1NameGhostRef,
    p2NameGhostRef,
    p1PlacementsGhostRef,
    p2PlacementsGhostRef,
    width,
  };
}

export function WeighIn() {
  const p1Id = useAppState((s) => s.event.tournament?.weighIn?.p1Player);
  const p2Id = useAppState((s) => s.event.tournament?.weighIn?.p2Player);
  const p1 = p1Id != null ? entrantById.get(p1Id) : undefined;
  const p2 = p2Id != null ? entrantById.get(p2Id) : undefined;
  const {
    p1NameGhostRef,
    p2NameGhostRef,
    p1PlacementsGhostRef,
    p2PlacementsGhostRef,
    width,
  } = usePlayerBoxWidth(p1, p2);

  return (
    <div className={styles.canvas}>
      <div className={styles.p1}>
        <div className={styles.content} style={{ width }}>
          <NameSection entrant={p1} />
          <PlacementsSection entrant={p1} />
        </div>
      </div>
      <div className={styles.p2}>
        <div className={styles.content} style={{ width }}>
          <NameSection entrant={p2} />
          <PlacementsSection entrant={p2} />
        </div>
      </div>
      <div className={styles.ghostLayer} aria-hidden="true">
        <div ref={p1NameGhostRef}>
          <NameSection entrant={p1} />
        </div>
        <div ref={p2NameGhostRef}>
          <NameSection entrant={p2} />
        </div>
        <div ref={p1PlacementsGhostRef}>
          <PlacementsSection entrant={p1} />
        </div>
        <div ref={p2PlacementsGhostRef}>
          <PlacementsSection entrant={p2} />
        </div>
      </div>
    </div>
  );
}
