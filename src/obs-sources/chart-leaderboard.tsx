import entrants from "../assets/entrants/entrants.json";
import {
  entrantsMap,
  SEED_UNSEEDED,
  startggIdByMemberId,
} from "../assets/entrants/entrantsMap";
import { scores, type GrooveStatsScore } from "../assets/entrants/scores";
import { techCounts, type ChartTechCounts } from "../songs/meta/techCountsMap";
import { useStockGameData } from "../state/game-data.atoms";
import { useAppState } from "../state/store";
import { getJacketUrl } from "../utils/jackets";
import styles from "./chart-leaderboard.css";

const TOP_SCORE_COUNT = 10;

const entrantByStartggId = new Map(
  entrants.map((entrant) => [entrant.id, entrant]),
);

/** The score must resolve to both an entrantsMap entry (for membersId) and
 * an entrants.json record (for the display name) — either being missing
 * means we can't confidently attribute the score to a known entrant. */
function findScoreEntrant(score: GrooveStatsScore) {
  const startggId = startggIdByMemberId.get(score.memberId);
  return startggId != null ? entrantByStartggId.get(startggId) : undefined;
}

function getTopScores(
  chartHash: string | undefined,
  isNoCmod: boolean,
): GrooveStatsScore[] {
  if (!chartHash) return [];
  return (scores[chartHash] ?? [])
    .filter((score) => findScoreEntrant(score) != null)
    .filter((score) => !(isNoCmod && score.usedCmod))
    .sort((a, b) => b.ex - a.ex)
    .slice(0, TOP_SCORE_COUNT);
}

function ScoreEntrantName({ score }: { score: GrooveStatsScore }) {
  const entrant = findScoreEntrant(score);
  if (!entrant) {
    // getTopScores already filters these out; this is unreachable in
    // practice but keeps the component correct on its own.
    return <>{score.name}</>;
  }

  const seed = entrantsMap[entrant.id]?.seed;

  return (
    <>
      <span className={styles.gamerTag}>{entrant.gamerTag}</span>
      {seed != null && seed !== SEED_UNSEEDED && (
        <sub className={styles.seed}>{seed}</sub>
      )}
      {entrant.prefix && <div className={styles.prefix}>{entrant.prefix}</div>}
    </>
  );
}

function Leaderboard({
  chartHash,
  isNoCmod,
}: {
  chartHash: string | undefined;
  isNoCmod: boolean;
}) {
  const topScores = getTopScores(chartHash, isNoCmod);
  if (topScores.length === 0) return null;

  return (
    <div className={styles.leaderboard}>
      <div className={styles.leaderboardTitle}>Pre-Event GS Leaderboard</div>
      <div className={styles.leaderboardSubtitle}>
        from Project Storm 2026 entrants
      </div>
      <table className={styles.leaderboardTable}>
        <tbody>
          {topScores.map((score, i) => (
            <tr
              key={score.id}
              className={styles.leaderboardRow}
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <td className={styles.leaderboardRank}>{i + 1}</td>
              <td className={styles.leaderboardName}>
                <ScoreEntrantName score={score} />
              </td>
              <td className={styles.leaderboardPercent}>
                {(score.ex / 100).toFixed(2)}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TechStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className={styles.techStat}>
      <div className={styles.techLabel}>{label}</div>
      <div className={styles.techValue}>{value}</div>
    </div>
  );
}

function TechCounts({ tech }: { tech: ChartTechCounts }) {
  const bpm =
    tech.min_bpm === tech.max_bpm
      ? `${tech.min_bpm}`
      : `${tech.min_bpm}-${tech.max_bpm}`;

  return (
    <div className={styles.techCounts}>
      <div className={styles.techRow}>
        <TechStat label="Steps" value={tech.total_steps} />
        <TechStat label="BPM" value={bpm} />
        <TechStat label="Holds" value={tech.total_holds} />
        <TechStat label="Rolls" value={tech.total_rolls} />
        <TechStat label="Mines" value={tech.total_mines} />
        <TechStat label="Jumps" value={tech.total_jumps} />
        <TechStat label="Jacks" value={tech.jacks} />
      </div>
      <div className={styles.techRow}>
        <TechStat label="Brackets" value={tech.brackets} />
        <TechStat label="Crossovers" value={tech.crossovers} />
        <TechStat label="Footswitches" value={tech.footswitches} />
        <TechStat label="Doublesteps" value={tech.doublesteps} />
        <TechStat label="Sideswitches" value={tech.sideswitches} />
      </div>
    </div>
  );
}

export function ChartLeaderboard() {
  const selectedFolder = useAppState(
    (s) => s.event.tournament?.chartLeaderboard?.songDir,
  );
  const gameData = useStockGameData("storm2026");
  const song = gameData?.songs.find((song) => song.folder === selectedFolder);
  const tech = selectedFolder ? techCounts[selectedFolder] : undefined;
  const isNoCmod = song?.charts[0]?.flags?.includes("noCmod") ?? false;

  return (
    <div className={styles.canvas}>
      {song?.jacket && (
        <>
          <div className={styles.detailsPanel}>
            <div className={styles.header}>
              <img className={styles.banner} src={getJacketUrl(song.jacket)} />
              <div className={styles.chartTitle}>
                {song.name_translation || song.name}
              </div>
              {tech?.credit && (
                <div className={styles.creditDescription}>
                  {tech.description
                    ? `${tech.credit} [${tech.description}]`
                    : tech.credit}
                </div>
              )}
            </div>
            {tech && <TechCounts tech={tech} />}
          </div>
          <div className={styles.leaderboardPanel}>
            <Leaderboard chartHash={tech?.hash} isNoCmod={isNoCmod} />
          </div>
        </>
      )}
    </div>
  );
}
