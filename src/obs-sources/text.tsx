import classNames from "classnames";
import { ReactNode } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { ObsLabelType, ObsTextAlign } from "../state/event.slice";
import { drawingsSlice } from "../state/drawings.slice";
import { useAppState } from "../state/store";
import { getAllPlayers } from "../models/Drawing";
import { formatDate, useCurrentTime } from "../hooks/useCurrentTime";
import { useFitText } from "../hooks/useFitText";
import { ROSTER_SLOTS } from "./step-stats";
import { entrantsMap, SEED_UNSEEDED } from "../assets/entrants/entrantsMap";
import styles from "./text.css";

function FitH1({
  children,
  fontClassName = styles.dialogFont,
  alignClassName = styles.alignCenter,
  textStroke = false,
}: {
  children: ReactNode;
  fontClassName?: string;
  alignClassName?: string;
  textStroke?: boolean;
}) {
  const { ref, fontSize } = useFitText<HTMLHeadingElement>(
    children,
    fontClassName,
  );
  return (
    <>
      {textStroke && (
        <h1
          aria-hidden="true"
          style={fontSize ? { fontSize: `${fontSize}px` } : undefined}
          className={classNames(
            styles.fitText,
            fontClassName,
            alignClassName,
            styles.textStroke,
          )}
        >
          {children}
        </h1>
      )}
      <h1
        ref={ref}
        className={classNames(styles.fitText, fontClassName, alignClassName)}
      >
        {children}
      </h1>
    </>
  );
}

export function CurrentTime() {
  const now = useCurrentTime();
  const [searchParams] = useSearchParams();
  const textStroke = searchParams.get("stroke") === "true";
  return <FitH1 textStroke={textStroke}>{formatDate(now, "currentTime")}</FitH1>;
}

export function poolSongCounterText(
  currentSong: number | undefined,
  totalSongs: number | undefined,
): string {
  return `Song ${currentSong ?? 1}/${totalSongs ?? 6}`;
}

export function PoolSongCounter() {
  const currentSong = useAppState(
    (s) => s.event.tournament?.poolState?.currentSong,
  );
  const totalSongs = useAppState(
    (s) => s.event.tournament?.poolState?.totalSongs,
  );
  return <FitH1>{poolSongCounterText(currentSong, totalSongs)}</FitH1>;
}

/**
 * The name of the player assigned to a pool roster slot (i.e. the entrant
 * picked in the dropdown on the Players dashboard), not whoever is actually
 * logged into that cab in the lobby — this intentionally never reads lobby
 * state, unlike step-stats.tsx's ROSTER_SLOTS-based lookups.
 */
export function PoolPlayerName() {
  const [searchParams] = useSearchParams();
  const cab = searchParams.get("cab") === "2" ? "2" : "1";
  const playerId = searchParams.get("player") === "2" ? "P2" : "P1";

  const poolPlayers =
    useAppState((s) => s.event.tournament?.poolState?.players) ?? [];

  const rowIndex = ROSTER_SLOTS.findIndex(
    (slot) => `${slot.cabNum}` === cab && slot.playerSlot === playerId,
  );
  const player = poolPlayers[rowIndex];
  const name = player?.gamerTag ?? "";
  const seed =
    player?.entrantId != null
      ? (entrantsMap[player.entrantId]?.seed ?? null)
      : null;

  return (
    <FitH1>
      {name}
      {seed != null && seed !== SEED_UNSEEDED && (
        <sub className={styles.seed}>{seed}</sub>
      )}
    </FitH1>
  );
}

const labelTypeFont: Record<ObsLabelType, string> = {
  dialog: styles.dialogFont,
  title: styles.titleFont,
};

const textAlignClass: Record<ObsTextAlign, string> = {
  left: styles.alignLeft,
  center: styles.alignCenter,
  right: styles.alignRight,
};

export function GlobalLabel() {
  const params = useParams<"roomName" | "labelId">();
  const label = useAppState((s) =>
    params.labelId ? (s.event.obsLabels[params.labelId] ?? null) : null,
  );
  const labelType = label?.labelType ?? "dialog";
  const textAlign = label?.textAlign ?? "center";
  return (
    <FitH1
      fontClassName={labelTypeFont[labelType]}
      alignClassName={textAlignClass[textAlign]}
    >
      {label?.value}
    </FitH1>
  );
}

export function CabTitle() {
  const params = useParams<"roomName" | "cabId">();
  const text = useAppState((s) => {
    const drawingId = s.event.cabs[params.cabId!].activeMatch;
    if (!drawingId) return null;
    const [parent] = drawingsSlice.selectors.byCompoundOrPlainId(s, drawingId);
    if (!parent) return null;
    return parent.meta.title;
  });
  return <FitH1>{text}</FitH1>;
}

export function CabPlayers() {
  const params = useParams<"roomName" | "cabId">();
  const text = useAppState((s) => {
    const drawingId = s.event.cabs[params.cabId!].activeMatch;
    if (!drawingId) return null;
    const [parent] = drawingsSlice.selectors.byCompoundOrPlainId(s, drawingId);
    if (!parent) return null;
    return getAllPlayers(parent).join(", ");
  });
  return <FitH1>{text}</FitH1>;
}

export function toDisplayType(
  input: string | undefined,
): "name" | "score" | "scoreTicks" | undefined {
  if (input === "score-ticks") return "scoreTicks";
  if (input === "name" || input === "score") return input;
  return undefined;
}

export function CabPlayer(props: {
  p: number;
  displayType?: "name" | "score" | "scoreTicks";
}) {
  const { displayType } = props;
  const params = useParams<"roomName" | "cabId">();
  const info = useAppState((s) => {
    const drawingId = s.event.cabs[params.cabId!].activeMatch;
    if (!drawingId) return null;
    const [parent] = drawingsSlice.selectors.byCompoundOrPlainId(s, drawingId);
    if (!parent) return null;
    const player = parent.meta.players[props.p - 1];
    const playerId = player?.id;
    const name = player?.name || "";
    const hideWins =
      parent.meta.type === "startgg" && parent.meta.subtype === "gauntlet";
    const score = hideWins
      ? 0
      : Object.values(parent.winners).reduce<number>((prev, curr) => {
          if (curr === playerId) return prev + 1;
          return prev;
        }, 0);
    return { name, hideWins, score };
  });
  const cardDrawPhase = useAppState(
    (s) => s.event.tournament?.cardDrawPhase ?? "de-bo3",
  );

  if (displayType === "scoreTicks") {
    const total = cardDrawPhase === "de-bo5" ? 3 : 2;
    const won = Math.min(info?.score ?? 0, total);
    return <ScoreTicks won={won} total={total} />;
  }

  let text: string | number | null = null;
  if (info) {
    if (info.hideWins) {
      text = info.name;
    } else if (displayType === "name") {
      text = info.name;
    } else if (displayType === "score") {
      text = info.score;
    } else {
      text = `${info.name} (${info.score})`;
    }
  }
  return <FitH1>{text}</FitH1>;
}

function ScoreTicks({ won, total }: { won: number; total: number }) {
  return (
    <div className={styles.scoreTicks}>
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className={i < won ? styles.tickFilled : styles.tickEmpty}
        />
      ))}
    </div>
  );
}

export function PhaseName() {
  const params = useParams<"roomName" | "cabId">();
  const text = useAppState((s) => {
    const drawingId = s.event.cabs[params.cabId!].activeMatch;
    if (!drawingId) return null;
    const [parent] = drawingsSlice.selectors.byCompoundOrPlainId(s, drawingId);
    if (!parent) return null;
    return parent.meta.type === "startgg" ? parent.meta.phaseName : null;
  });

  return <FitH1>{text}</FitH1>;
}
