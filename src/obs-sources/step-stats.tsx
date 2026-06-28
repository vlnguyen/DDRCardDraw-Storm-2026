import classNames from "classnames";
import { useSearchParams } from "react-router-dom";
import { useAppState } from "../state/store";
import matchLogStyles from "../tournament-mode/dashboard/match-log.css";
import { Judgments } from "./lobby.types";
import { useLiveRankings } from "./useLiveRankings";
import styles from "./step-stats.css";

export function asOrdinalRank(rank?: number): string {
  if (!rank) return "";
  const remainder100 = rank % 100;
  if (remainder100 >= 11 && remainder100 <= 13) {
    return `${rank}th`;
  }
  switch (rank % 10) {
    case 1:
      return `${rank}st`;
    case 2:
      return `${rank}nd`;
    case 3:
      return `${rank}rd`;
    default:
      return `${rank}th`;
  }
}

const RANK_COLORS: Record<number, string> = {
  1: "#e29c18",
  2: "#cecece",
  3: "#c9855e",
  4: "#515151",
};

const JUDGMENT_FIELDS: Array<{ key: keyof Judgments; className: string }> = [
  { key: "fantasticPlus", className: matchLogStyles.fantasticPlus },
  { key: "fantastics", className: matchLogStyles.fantastic },
  { key: "excellents", className: matchLogStyles.excellent },
  { key: "greats", className: matchLogStyles.great },
  { key: "decents", className: matchLogStyles.decent },
  { key: "wayOffs", className: matchLogStyles.wayOff },
  { key: "misses", className: matchLogStyles.miss },
];

// Mirrors players.tsx's CAB_LABELS ordering: cab 1 [P1, P2], then cab 2 [P1, P2].
const ROSTER_SLOTS: Array<{ cabNum: 1 | 2; playerSlot: "P1" | "P2" }> = [
  { cabNum: 1, playerSlot: "P1" },
  { cabNum: 1, playerSlot: "P2" },
  { cabNum: 2, playerSlot: "P1" },
  { cabNum: 2, playerSlot: "P2" },
];

export function StepStats() {
  const [searchParams] = useSearchParams();
  const cab = searchParams.get("cab") === "2" ? "2" : "1";
  const playerId = searchParams.get("player") === "2" ? "P2" : "P1";

  const lobbyConnection = useAppState(
    (s) => s.event.tournament?.lobbyConnection,
  );
  const cab1MachineId = useAppState((s) => s.event.tournament?.machineCodeCab1);
  const cab2MachineId = useAppState((s) => s.event.tournament?.machineCodeCab2);
  const machineId = cab === "2" ? cab2MachineId : cab1MachineId;
  const poolPlayers = useAppState((s) => s.event.tournament?.poolState?.players) ?? [];

  const gameState = useLiveRankings({
    name: `OBS Step Stats (Cab ${cab}, ${playerId})`,
    code: lobbyConnection?.code ?? "",
    password: lobbyConnection?.password,
  });

  const player = gameState?.players.find(
    (p) => p.socketId === machineId && p.playerId === playerId,
  );
  const judgments = player?.judgments;
  const exScore = Number((player?.exScore ?? 0) / 100).toLocaleString(undefined, {
    style: "percent",
    minimumFractionDigits: 2,
  });

  const rowIndex = ROSTER_SLOTS.findIndex(
    (slot) => `${slot.cabNum}` === cab && slot.playerSlot === playerId,
  );
  const isSelfDisabled = poolPlayers[rowIndex]?.isDisabled ?? false;

  const eligibleScores = ROSTER_SLOTS.filter(
    (_, i) => !poolPlayers[i]?.isDisabled,
  ).map((slot) => {
    const slotMachineId = slot.cabNum === 1 ? cab1MachineId : cab2MachineId;
    const slotPlayer = gameState?.players.find(
      (p) => p.socketId === slotMachineId && p.playerId === slot.playerSlot,
    );
    return slotPlayer?.exScore ?? 0;
  });

  const myScore = player?.exScore ?? 0;
  const currentRank: number | undefined =
    isSelfDisabled || eligibleScores.length === 0
      ? undefined
      : eligibleScores.filter((score) => score > myScore).length + 1;

  return (
    <div className={styles.list}>
      <div
        className={classNames(matchLogStyles.fantasticPlus, {
          [styles.notFirstPlace]: currentRank !== 1,
        })}
      >
        {exScore}
      </div>
      {JUDGMENT_FIELDS.map(({ key, className }) => {
        const digits = (judgments?.[key] ?? 0).toString();
        const padding = "0".repeat(Math.max(4 - digits.length, 0));
        return (
          <div key={key} className={className}>
            <span className={styles.zeroesPadding}>{padding}</span>
            {digits}
          </div>
        );
      })}
      <div
        className={styles.rank}
        style={{
          color: currentRank
            ? RANK_COLORS[currentRank] ?? RANK_COLORS[4]
            : undefined,
        }}
      >
        {asOrdinalRank(currentRank)}
      </div>
    </div>
  );
}
