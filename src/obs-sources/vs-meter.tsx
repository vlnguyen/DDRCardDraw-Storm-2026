import classNames from "classnames";
import { useAppState } from "../state/store";
import { useLiveRankings } from "./useLiveRankings";
import styles from "./vs-meter.css";

const MAX_EX_DELTA = 1.0;

export function VsMeter() {
  const lobbyConnection = useAppState(
    (s) => s.event.tournament?.lobbyConnection,
  );
  const gameState = useLiveRankings({
    name: "OBS VS Meter",
    code: lobbyConnection?.code ?? "",
    password: lobbyConnection?.password,
  });

  if (!gameState) {
    return null;
  }

  const machineIds = new Set(
    gameState.players.map((p) => p.socketId).filter(Boolean),
  );
  if (machineIds.size > 1) {
    return null;
  }

  const p1 = gameState.players.find((p) => p.playerId === "P1");
  const p2 = gameState.players.find((p) => p.playerId === "P2");
  const p1Score = p1?.exScore ?? 0;
  const p2Score = p2?.exScore ?? 0;
  const winningSide =
    p1Score === p2Score ? null : p1Score > p2Score ? "p1" : "p2";

  const delta = Math.abs(p1Score - p2Score);
  const normalizedDelta = Math.min(delta, MAX_EX_DELTA) / MAX_EX_DELTA;
  // Logarithmic easing: equal steps in normalizedDelta near 0 move the
  // circle further than the same steps near MAX_EX_DELTA.
  const eased = Math.log1p(normalizedDelta * (Math.E - 1));
  const offsetFromCenter = (eased / 2) * (winningSide === "p1" ? -1 : 1);
  const circlePosition = winningSide === null ? 0.5 : 0.5 + offsetFromCenter;

  return (
    <div className={styles.canvas}>
      <div className={styles.verticalLine} />
      <div className={styles.line}>
        <div
          className={classNames(styles.lineP1, {
            [styles.dimmed]: winningSide === "p2",
          })}
        />
        <div
          className={classNames(styles.lineP2, {
            [styles.dimmed]: winningSide === "p1",
          })}
        />
        <div
          className={styles.circle}
          style={{
            left: `${circlePosition * 100}%`,
            transform: `translate(${circlePosition * -100}%, -50%)`,
          }}
        />
      </div>
    </div>
  );
}
