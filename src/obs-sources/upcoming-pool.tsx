import { useMemo } from "react";
import { entrantsMap, SEED_DROPPED } from "../assets/entrants/entrantsMap";
import { useAppState } from "../state/store";
import { parsePoolPlayers } from "./pool-history";
import { Persona3Circle } from "./persona-3-circle";
import styles from "./upcoming-pool.css";

const CIRCLE_RADIUS = 0.1;

// Scaffold OBS source — 3840x3840 square canvas, transparent background,
// circle rendered centered.
export function UpcomingPool() {
  const selectedStage = useAppState(
    (s) => s.event.tournament?.upcomingPool?.selectedStage ?? "stage1",
  );
  const selectedPool = useAppState(
    (s) => s.event.tournament?.upcomingPool?.selectedPool,
  );
  const stageNumber = selectedStage.slice("stage".length);
  const rows = useAppState(
    (s) =>
      s.event.tournament?.poolHistory?.data?.[selectedStage] as
        | string[][]
        | undefined,
  );

  const players = useMemo(() => {
    if (!rows || !selectedPool) return [];
    return parsePoolPlayers(rows, selectedPool).map((player) => ({
      gamerTag: player.gamerTag ?? "",
      seed:
        player.entrantId != null
          ? (entrantsMap[player.entrantId]?.seed ?? null)
          : null,
    }));
  }, [rows, selectedPool]);

  return (
    <div className={styles.canvas}>
      <Persona3Circle
        cx={0.5}
        cy={0.5}
        radius={CIRCLE_RADIUS}
        outerText={`Stage ${stageNumber} - Pool ${selectedPool ?? ""}`}
      />
      <div className={styles.playerList}>
        {players.map((player, i) => (
          <div key={i}>
            {player.gamerTag}
            {player.seed != null && player.seed !== SEED_DROPPED && (
              <sub className={styles.seed}>{player.seed}</sub>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
