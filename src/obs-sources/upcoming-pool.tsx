import { useMemo } from "react";
import { entrantsMap, SEED_DROPPED } from "../assets/entrants/entrantsMap";
import { useAppState } from "../state/store";
import { parsePoolPlayers } from "./pool-history";
import { Persona3Circle } from "./persona-3-circle";
import styles from "./upcoming-pool.css";

// Position shared between the circle and the player list overlaid on it —
// keep both in sync since the list is placed relative to the circle.
const CIRCLE_CX = 0.17;
const CIRCLE_CY = 0.3;
const CIRCLE_RADIUS = 0.1;

// Scaffold OBS source — 3840x2160 canvas, transparent background, ready for
// dashboard-driven content once that's added.
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
        cx={CIRCLE_CX}
        cy={CIRCLE_CY}
        radius={CIRCLE_RADIUS}
        outerText={`Stage ${stageNumber} - Pool ${selectedPool ?? ""}`}
      />
      <div
        className={styles.playerList}
        style={{ left: `${CIRCLE_CX * 3840}px`, top: `${CIRCLE_CY * 2160}px` }}
      >
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
