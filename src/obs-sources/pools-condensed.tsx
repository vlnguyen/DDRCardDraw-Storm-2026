import { useMemo } from "react";
import { useAppState } from "../state/store";
import styles from "./pools-condensed.css";
import dialogBoxIcon from "../assets/img/dialog-box.svg";
import winnerIcon from "../assets/img/winner.svg";
import { entrantsMap, SEED_UNSEEDED } from "../assets/entrants/entrantsMap";
import { getPoolPlayersResults } from "./pools";

export function PoolsCondensed() {
  const selectedStage = useAppState(
    (s) => s.event.tournament?.upcomingPool?.selectedStage ?? "stage1",
  );
  const selectedPool = useAppState(
    (s) => s.event.tournament?.upcomingPool?.selectedPool,
  );
  const players = useAppState(
    (s) => s.event.tournament?.poolState?.players ?? [],
  );
  const numPlayersAdvance = useAppState(
    (s) => s.event.tournament?.poolState?.numPlayersAdvance ?? 2,
  );
  const poolPlayersResults = useMemo(
    () => getPoolPlayersResults(players),
    [players],
  );
  const stageNumber = selectedStage.slice("stage".length);
  const text = `Stage ${stageNumber} - Pool ${selectedPool ?? ""}`;

  return (
    <div className={styles.canvas}>
      <div className={styles.titleWrap}>
        <p className={styles.titleStroke}>{text}</p>
        <p className={styles.title}>{text}</p>
      </div>
      <div className={styles.dialogList}>
        {poolPlayersResults.map((player, i) => {
          const seed =
            player.entrantId != null
              ? (entrantsMap[player.entrantId]?.seed ?? null)
              : null;
          const points = player.wins.reduce((a, b) => a + b, 0);
          const willAdvance = player.rank <= numPlayersAdvance;
          return (
            <div key={i} className={styles.dialogItem}>
              <img className={styles.dialogBox} src={dialogBoxIcon} alt="" />
              <div className={styles.dialogInner}>
                <p className={styles.playerName}>
                  {player.gamerTag || "--"}
                  {seed != null && seed !== SEED_UNSEEDED && (
                    <sub className={styles.seed}>{seed}</sub>
                  )}
                </p>
                <p className={styles.playerPoints}>{points}</p>
              </div>
              {willAdvance && (
                <img
                  className={styles.winnerIcon}
                  src={winnerIcon}
                  alt=""
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
