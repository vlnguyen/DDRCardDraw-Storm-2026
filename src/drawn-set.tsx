import { memo, useRef } from "react";
import classNames from "classnames";
import { ErrorBoundary } from "react-error-boundary";
import { SongCard, PersonaSongCard } from "./song-card";
import styles from "./drawn-set.css";
import personaStyles from "./song-card/persona-song-card.css";
import { useDrawing } from "./drawing-context";
import { useAppState } from "./state/store";
import { DrawingActions } from "./tournament-mode/drawing-actions";
import { ErrorFallback } from "./utils/error-fallback";

export type SongCardStyle = "default" | "persona";

const POOLS_PHASE_FIRST_ROW_SIZE = 6;

/**
 * expects a drawing context wrapper
 **/
export function ChartList({
  style = "default",
}: {
  style?: SongCardStyle;
} = {}) {
  const charts = useDrawing((d) => d.charts);
  const phase = useAppState((s) => s.event.tournament?.cardDrawPhase ?? "de");
  const isPersona = style === "persona";

  // seed as null (not `charts`) so a mount with already-resolved charts
  // (e.g. OBS sources, which mount after the draw already happened) still counts as an entrance
  const prevChartsRef = useRef<typeof charts>(null);
  const isEntering = isPersona && prevChartsRef.current == null && charts != null;
  prevChartsRef.current = charts;

  if (!charts) return null;

  const chartListClass = classNames(
    isPersona ? personaStyles.chartList : styles.chartList,
    isEntering && personaStyles.entering,
  );

  if (isPersona && phase === "pools") {
    const firstRow = charts.slice(0, POOLS_PHASE_FIRST_ROW_SIZE);
    const remainingRows = charts.slice(POOLS_PHASE_FIRST_ROW_SIZE);
    return (
      <>
        {/* forced to a single unwrapped line so it always holds exactly 6, regardless of container width */}
        <div className={chartListClass} style={{ flexWrap: "nowrap" }}>
          {firstRow.map((c) => (
            <ChartFromContext key={c.id} chartId={c.id} style={style} />
          ))}
        </div>
        {remainingRows.length > 0 && (
          <div className={chartListClass}>
            {remainingRows.map((c) => (
              <ChartFromContext key={c.id} chartId={c.id} style={style} />
            ))}
          </div>
        )}
      </>
    );
  }

  return (
    <div className={chartListClass}>
      {charts.map((c) => (
        <ChartFromContext key={c.id} chartId={c.id} style={style} />
      ))}
    </div>
  );
}

function ChartFromContext({
  chartId,
  style,
}: {
  chartId: string;
  style: SongCardStyle;
}) {
  const chart = useDrawing((d) => d.charts.find((c) => c.id === chartId));
  const veto = useDrawing((d) => {
    return d.bans[chartId];
  });
  const protect = useDrawing((d) => d.protects[chartId]);
  const pocketPick = useDrawing((d) => d.pocketPicks[chartId]);
  const winner = useDrawing((d) => d.winners[chartId]);
  if (!chart) {
    return null;
  }
  const Card = style === "persona" ? PersonaSongCard : SongCard;
  return (
    <Card
      vetoedBy={veto?.player}
      protectedBy={protect?.player}
      replacedBy={pocketPick?.player}
      replacedWith={pocketPick?.pick}
      winner={winner}
      chart={chart}
      actionsEnabled
    />
  );
}

function TournamentModeSpacer() {
  return <div style={{ height: "15px" }} />;
}

const DrawnSet = memo(function DrawnSet() {
  const [, drawingId] = useDrawing((d) => d.compoundId);

  return (
    <ErrorBoundary
      fallback={
        <div
          className={styles.drawing}
          style={{
            padding: "2em",
            minHeight: "15em",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <ErrorFallback />
        </div>
      }
    >
      <div
        key={drawingId}
        id={`drawing:${drawingId}`}
        className={styles.drawing}
      >
        <TournamentModeSpacer />
        <div id={`drawing-${drawingId}`}>
          <ChartList />
        </div>
        <DrawingActions />
      </div>
    </ErrorBoundary>
  );
});

export default DrawnSet;
