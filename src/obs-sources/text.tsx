import classNames from "classnames";
import { ReactNode } from "react";
import { useParams } from "react-router-dom";
import { ObsLabelType, ObsTextAlign } from "../state/event.slice";
import { drawingsSlice } from "../state/drawings.slice";
import { useAppState } from "../state/store";
import { getAllPlayers } from "../models/Drawing";
import { formatDate, useCurrentTime } from "../hooks/useCurrentTime";
import { useFitText } from "../hooks/useFitText";
import styles from "./text.css";

function FitH1({
  children,
  fontClassName = styles.dialogFont,
  alignClassName = styles.alignCenter,
}: {
  children: ReactNode;
  fontClassName?: string;
  alignClassName?: string;
}) {
  const ref = useFitText<HTMLHeadingElement>(children, fontClassName);
  return (
    <h1
      ref={ref}
      className={classNames(styles.fitText, fontClassName, alignClassName)}
    >
      {children}
    </h1>
  );
}

export function CurrentTime() {
  const now = useCurrentTime();
  return <FitH1>{formatDate(now, "currentTime")}</FitH1>;
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

export function toDisplayType(input: string | undefined) {
  return input as "name" | "score" | undefined;
}

export function CabPlayer(props: {
  p: number;
  displayType?: "name" | "score";
}) {
  const { displayType } = props;
  const params = useParams<"roomName" | "cabId">();
  const text = useAppState((s) => {
    const drawingId = s.event.cabs[params.cabId!].activeMatch;
    if (!drawingId) return null;
    const [parent] = drawingsSlice.selectors.byCompoundOrPlainId(s, drawingId);
    if (!parent) return null;
    const player = parent.meta.players[props.p - 1];
    const playerId = player?.id;
    const name = player?.name || "";
    const hideWins =
      parent.meta.type === "startgg" && parent.meta.subtype === "gauntlet";
    if (hideWins) {
      return name;
    }
    const score = Object.values(parent.winners).reduce<number>((prev, curr) => {
      if (curr === playerId) return prev + 1;
      return prev;
    }, 0);
    if (displayType === "name") {
      return name;
    }
    if (displayType === "score") {
      return score;
    }
    return `${name} (${score})`;
  });
  return <FitH1>{text}</FitH1>;
}

export function PoolHistoryLabel() {
  const selection = useAppState(
    (s) => s.event.tournament?.poolHistory?.selection,
  );
  const stageNumber = selection?.stage?.slice("stage".length);
  const poolCode = selection?.poolCode;
  const ref = useFitText<HTMLDivElement>(
    stageNumber && poolCode ? `${stageNumber}:${poolCode}` : null,
  );

  if (!stageNumber || !poolCode) {
    return null;
  }

  return (
    <div ref={ref} className={styles.poolHistoryLabel}>
      <div className={styles.poolHistoryStageLine}>Stage {stageNumber}</div>
      <div className={styles.poolHistoryPoolLine}>Pool {poolCode}</div>
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
