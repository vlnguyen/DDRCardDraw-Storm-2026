import { useSearchParams } from "react-router-dom";
import { useAppState } from "../state/store";
import { formatRatio } from "../tournament-mode/dashboard/match-log";
import matchLogStyles from "../tournament-mode/dashboard/match-log.css";
import { useLiveRankings } from "./useLiveRankings";
import styles from "./step-stats.css";

export function StepStats() {
  const [searchParams] = useSearchParams();
  const cab = searchParams.get("cab") === "2" ? "2" : "1";
  const playerId = searchParams.get("player") === "2" ? "P2" : "P1";

  const lobbyConnection = useAppState(
    (s) => s.event.tournament?.lobbyConnection,
  );
  const machineId = useAppState((s) =>
    cab === "2"
      ? s.event.tournament?.machineCodeCab2
      : s.event.tournament?.machineCodeCab1,
  );

  const gameState = useLiveRankings({
    name: "OBS Step Stats",
    code: lobbyConnection?.code ?? "",
    password: lobbyConnection?.password,
  });

  const player = gameState?.players.find(
    (p) => p.socketId === machineId && p.playerId === playerId,
  );
  const judgments = player?.judgments;

  return (
    <ul className={styles.list}>
      <li className={matchLogStyles.fantasticPlus}>
        <span>FA+</span>
        <span>{judgments?.fantasticPlus ?? "-"}</span>
      </li>
      <li className={matchLogStyles.fantastic}>
        <span>FA</span>
        <span>{judgments?.fantastics ?? "-"}</span>
      </li>
      <li className={matchLogStyles.excellent}>
        <span>EXC</span>
        <span>{judgments?.excellents ?? "-"}</span>
      </li>
      <li className={matchLogStyles.great}>
        <span>Great</span>
        <span>{judgments?.greats ?? "-"}</span>
      </li>
      <li className={matchLogStyles.decent}>
        <span>Decent</span>
        <span>{judgments?.decents ?? "-"}</span>
      </li>
      <li className={matchLogStyles.wayOff}>
        <span>W/O</span>
        <span>{judgments?.wayOffs ?? "-"}</span>
      </li>
      <li className={matchLogStyles.miss}>
        <span>Miss</span>
        <span>{judgments?.misses ?? "-"}</span>
      </li>
      <li>
        <span>Mines</span>
        <span>
          {formatRatio(
            judgments ? judgments.totalMines - judgments.minesHit : null,
            judgments?.totalMines ?? null,
          )}
        </span>
      </li>
      <li>
        <span>Holds</span>
        <span>
          {formatRatio(judgments?.holdsHeld ?? null, judgments?.totalHolds ?? null)}
        </span>
      </li>
      <li>
        <span>Rolls</span>
        <span>
          {formatRatio(judgments?.rollsHeld ?? null, judgments?.totalRolls ?? null)}
        </span>
      </li>
    </ul>
  );
}
