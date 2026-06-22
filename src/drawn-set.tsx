import { memo } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { SongCard, PersonaSongCard } from "./song-card";
import styles from "./drawn-set.css";
import personaStyles from "./song-card/persona-song-card.css";
import { useDrawing } from "./drawing-context";
import { DrawingActions } from "./tournament-mode/drawing-actions";
import { ErrorFallback } from "./utils/error-fallback";

export type SongCardStyle = "default" | "persona";

/**
 * expects a drawing context wrapper
 **/
export function ChartList({ style = "default" }: { style?: SongCardStyle } = {}) {
  const charts = useDrawing((d) => d.charts);
  if (!charts) return null;
  const chartListClass =
    style === "persona" ? personaStyles.chartList : styles.chartList;
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
