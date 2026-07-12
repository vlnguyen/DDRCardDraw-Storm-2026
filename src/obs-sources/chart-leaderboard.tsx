import { entrantsMap } from "../assets/entrants/entrantsMap";
import { scores } from "../assets/entrants/scores";
import { techCounts } from "../songs/meta/techCountsMap";
import { useStockGameData } from "../state/game-data.atoms";
import { useAppState } from "../state/store";
import styles from "./chart-leaderboard.css";

const validMemberIds = new Set(
  Object.values(entrantsMap)
    .filter((entrant) => entrant != null)
    .map((entrant) => entrant.membersId),
);

export function ChartLeaderboard() {
  const selectedFolder = useAppState(
    (s) => s.event.tournament?.chartLeaderboard,
  );
  const gameData = useStockGameData("storm2026");

  const song = gameData?.songs.find((song) => song.folder === selectedFolder);
  const isNoCmod = song?.charts[0]?.flags?.includes("noCmod") ?? false;

  const chartHash = selectedFolder && techCounts[selectedFolder]?.hash;
  const leaderboard = (chartHash ? scores[chartHash] : undefined) ?? [];

  const filteredScores = leaderboard.filter((score) => {
    if (!validMemberIds.has(score.memberId)) return false;
    if (isNoCmod && score.usedCmod) return false;
    return true;
  });

  return (
    <div className={styles.container}>
      <pre>{JSON.stringify(filteredScores, null, 2)}</pre>
    </div>
  );
}
