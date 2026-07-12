import entrants from "../assets/entrants/entrants.json";
import { entrantsMap } from "../assets/entrants/entrantsMap";
import { scores } from "../assets/entrants/scores";
import { techCounts } from "../songs/meta/techCountsMap";
import { useStockGameData } from "../state/game-data.atoms";
import { useAppState } from "../state/store";
import styles from "./chart-leaderboard.css";

const entrantByStartggId = new Map(
  entrants.map((entrant) => [entrant.id, entrant]),
);

const memberIdsByStartggId = new Map(
  entrants
    .map((entrant) => [entrant.id, entrantsMap[entrant.id]?.membersId] as const)
    .filter((entry): entry is [number, number] => entry[1] != null),
);

const validMemberIds = new Set(memberIdsByStartggId.values());

const startggIdByMemberId = new Map(
  [...memberIdsByStartggId.entries()].map(([startggId, memberId]) => [
    memberId,
    startggId,
  ]),
);

function EntrantName({
  memberId,
  fallbackName,
}: {
  memberId: number;
  fallbackName: string;
}) {
  const startggId = startggIdByMemberId.get(memberId);
  const entrant =
    startggId != null ? entrantByStartggId.get(startggId) : undefined;

  if (!entrant) {
    return <span className={styles.gamerTag}>{fallbackName}</span>;
  }

  return (
    <>
      <span className={styles.gamerTag}>{entrant.gamerTag}</span>
      {entrant.prefix && <div className={styles.prefix}>{entrant.prefix}</div>}
    </>
  );
}

export function ChartLeaderboard() {
  const selectedFolder = useAppState(
    (s) => s.event.tournament?.chartLeaderboard,
  );
  const gameData = useStockGameData("storm2026");

  const song = gameData?.songs.find((song) => song.folder === selectedFolder);
  const isNoCmod = song?.charts[0]?.flags?.includes("noCmod") ?? false;

  const chartHash = selectedFolder && techCounts[selectedFolder]?.hash;
  const leaderboard = (chartHash ? scores[chartHash] : undefined) ?? [];

  const rankedScores = leaderboard
    .filter((score) => validMemberIds.has(score.memberId))
    .filter((score) => !(isNoCmod && score.usedCmod))
    .sort((a, b) => b.ex - a.ex);

  return (
    <table className={styles.container}>
      <tbody>
        {rankedScores.map((score, i) => (
          <tr
            key={score.id}
            className={styles.row}
            style={{ animationDelay: `${i * 0.05}s` }}
          >
            <td className={styles.rank}>{i + 1}</td>
            <td className={styles.name}>
              <EntrantName memberId={score.memberId} fallbackName={score.name} />
            </td>
            <td className={styles.percent}>{(score.ex / 100).toFixed(2)}%</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
