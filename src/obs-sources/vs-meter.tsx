import classNames from "classnames";
import { useAppState } from "../state/store";
import { useLiveRankings } from "./useLiveRankings";
import styles from "./vs-meter.css";

export function VsMeter() {
  const lobbyConnection = useAppState(
    (s) => s.event.tournament?.lobbyConnection,
  );
  const gameState = useLiveRankings({
    name: "OBS VS Meter",
    code: lobbyConnection?.code ?? "",
    password: lobbyConnection?.password,
  });

  const machineIds = new Set(
    (gameState?.players ?? []).map((p) => p.socketId).filter(Boolean),
  );
  if (machineIds.size > 1) {
    return null;
  }

  const p1 = gameState?.players.find((p) => p.playerId === "P1");
  const p2 = gameState?.players.find((p) => p.playerId === "P2");
  const p1Score = p1?.exScore ?? 0;
  const p2Score = p2?.exScore ?? 0;
  const winningSide =
    p1Score === p2Score ? null : p1Score > p2Score ? "p1" : "p2";

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
        <div className={styles.circle} />
      </div>
    </div>
  );
}
