import { useMemo } from "react";
import { useAppState } from "../state/store";
import { getPoolCodesForStage, parsePoolPlayers } from "./pool-history";
import { getPoolPlayersResults } from "./pools";
import styles from "./stage-progression.css";

// Scaffold OBS source — 3840x2160 canvas, transparent background, ready for
// dashboard-driven content once that state/controls are added.
export function StageProgression() {
  const selectedStage = useAppState(
    (s) => s.event.tournament?.stageProgression?.selectedStage ?? "stage1",
  );
  const stageNumber = selectedStage.slice("stage".length);
  const rows = useAppState(
    (s) =>
      s.event.tournament?.poolHistory?.data?.[selectedStage] as
        | string[][]
        | undefined,
  );

  const pools = useMemo(() => {
    if (!rows) return [];
    return getPoolCodesForStage(rows).map((poolCode) => ({
      poolCode,
      players: getPoolPlayersResults(parsePoolPlayers(rows, poolCode)),
    }));
  }, [rows]);

  return (
    <div className={styles.canvas}>
      <div className={styles.sidebar}>
        <div className={styles.sidebarEdgeBlur} />
        <div className={styles.titleWrap}>
          <p className={styles.titleStroke}>Stage {stageNumber}</p>
          <p className={styles.title}>Stage {stageNumber}</p>
        </div>
        <div className={styles.pools}>
          {pools.map(({ poolCode, players }) => (
            <div key={poolCode} className={styles.pool}>
              <p className={styles.poolName}>Pool {poolCode}</p>
              <ul className={styles.playerList}>
                {players.map((player, i) => (
                  <li key={i} className={styles.player}>
                    <span>{player.gamerTag}</span>
                    {player.advancement === "1st" && (
                      <span className={styles.medal}>🥇</span>
                    )}
                    {player.advancement === "2nd" && (
                      <span className={styles.medal}>🥈</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
