import { techCounts } from "../songs/meta/techCountsMap";
import { useStockGameData } from "../state/game-data.atoms";
import { useAppState } from "../state/store";
import { getJacketUrl } from "../utils/jackets";
import styles from "./chart-leaderboard.css";

export function ChartLeaderboard() {
  const selectedFolder = useAppState(
    (s) => s.event.tournament?.chartLeaderboard?.songDir,
  );
  const gameData = useStockGameData("storm2026");
  const song = gameData?.songs.find((song) => song.folder === selectedFolder);
  const tech = selectedFolder ? techCounts[selectedFolder] : undefined;

  return (
    <div className={styles.canvas}>
      {song?.jacket && (
        <div className={styles.header}>
          <img className={styles.banner} src={getJacketUrl(song.jacket)} />
          <div className={styles.chartTitle}>
            {song.name_translation || song.name}
          </div>
          {tech?.credit && (
            <div className={styles.creditDescription}>
              {tech.description
                ? `${tech.credit} - ${tech.description}`
                : tech.credit}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
