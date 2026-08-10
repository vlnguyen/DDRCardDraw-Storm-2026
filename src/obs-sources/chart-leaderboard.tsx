import entrants from "../assets/entrants/entrants.json";
import {
  entrantsMap,
  SEED_UNSEEDED,
  startggIdByMemberId,
} from "../assets/entrants/entrantsMap";
import { scores, type GrooveStatsScore } from "../assets/entrants/scores";
import type { Player } from "../models/Drawing";
import { techCounts, type ChartTechCounts } from "../songs/meta/techCountsMap";
import { useStockGameData } from "../state/game-data.atoms";
import { useAppState } from "../state/store";
import { getJacketUrl } from "../utils/jackets";
import styles from "./chart-leaderboard.css";

const TOP_SCORE_COUNT = 10;

type EntrantRecord = (typeof entrants)[number];

interface LeaderboardEntry {
  key: string;
  entrant: EntrantRecord;
  seed: number | null | undefined;
  /** undefined means this entrant hasn't posted an eligible score yet */
  ex: number | undefined;
  /** true rank (1-indexed) among every eligible entrant score for this
   * chart, not just position within the displayed/trimmed list — so a
   * forced participant who's actually 47th still reads "47", not their
   * position in this shorter table. undefined alongside `ex` undefined. */
  rank: number | undefined;
  /** true if this row exists because it was explicitly listed in
   * "Participants" on the dashboard, rather than earning its spot by score
   * alone — drawn with a bounding box to call it out. */
  isParticipant: boolean;
}

const entrantByStartggId = new Map(
  entrants.map((entrant) => [entrant.id, entrant]),
);

function entrantLabel(entrant: { gamerTag: string; prefix?: string }): string {
  return entrant.prefix ? `${entrant.gamerTag} [${entrant.prefix}]` : entrant.gamerTag;
}

/** The score must resolve to both an entrantsMap entry (for membersId) and
 * an entrants.json record (for the display name) — either being missing
 * means we can't confidently attribute the score to a known entrant. */
function findScoreEntrant(score: GrooveStatsScore): EntrantRecord | undefined {
  const startggId = startggIdByMemberId.get(score.memberId);
  return startggId != null ? entrantByStartggId.get(startggId) : undefined;
}

function findEntrantByName(name: string): EntrantRecord | undefined {
  return entrants.find((entrant) => entrantLabel(entrant) === name);
}

/** Builds the leaderboard's row list: the top scores for the chart, plus
 * any forced `participants` who aren't already in that top list — shown
 * with their own score if they have one, or "--" if they haven't played
 * the chart yet. */
function buildLeaderboardEntries(
  chartHash: string | undefined,
  isNoCmod: boolean,
  participants: Player[],
): LeaderboardEntry[] {
  if (!chartHash) return [];

  const eligible = (scores[chartHash] ?? [])
    .map((score) => ({ score, entrant: findScoreEntrant(score) }))
    .filter(
      (x): x is { score: GrooveStatsScore; entrant: EntrantRecord } =>
        x.entrant != null,
    )
    .filter((x) => !(isNoCmod && x.score.usedCmod))
    .sort((a, b) => b.score.ex - a.score.ex);

  // 1-indexed rank among every eligible entrant score, independent of
  // which subset actually ends up displayed.
  function rankFor(entrantId: number): number | undefined {
    const idx = eligible.findIndex((x) => x.entrant.id === entrantId);
    return idx === -1 ? undefined : idx + 1;
  }

  const included = new Map<number, LeaderboardEntry>();

  // Forced participants take priority for the (still capped) 10 slots.
  for (const participant of participants) {
    const entrant = findEntrantByName(participant.name);
    if (!entrant || included.has(entrant.id)) continue;
    const existing = eligible.find((x) => x.entrant.id === entrant.id);
    included.set(entrant.id, {
      key: `participant-${entrant.id}`,
      entrant,
      seed: entrantsMap[entrant.id]?.seed,
      ex: existing?.score.ex,
      rank: existing ? rankFor(entrant.id) : undefined,
      isParticipant: true,
    });
  }

  // Fill whatever slots remain with the highest-ranked non-forced scores.
  for (const { score, entrant } of eligible) {
    if (included.size >= TOP_SCORE_COUNT) break;
    if (included.has(entrant.id)) continue;
    included.set(entrant.id, {
      key: `score-${score.id}`,
      entrant,
      seed: entrantsMap[entrant.id]?.seed,
      ex: score.ex,
      rank: rankFor(entrant.id),
      isParticipant: false,
    });
  }

  const withScore = Array.from(included.values())
    .filter((entry) => entry.ex != null)
    .sort((a, b) => b.ex! - a.ex!);
  const withoutScore = Array.from(included.values()).filter(
    (entry) => entry.ex == null,
  );

  // Defensive cap: forced participants alone could exceed TOP_SCORE_COUNT.
  return [...withScore, ...withoutScore].slice(0, TOP_SCORE_COUNT);
}

function EntrantNameCell({
  entrant,
  seed,
}: {
  entrant: EntrantRecord;
  seed: number | null | undefined;
}) {
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
  participants,
}: {
  chartHash: string | undefined;
  isNoCmod: boolean;
  participants: Player[];
}) {
  const entries = buildLeaderboardEntries(chartHash, isNoCmod, participants);
  if (entries.length === 0) return null;

  return (
    <div className={styles.leaderboard}>
      <div className={styles.leaderboardTitle}>Pre-Event GS Leaderboard</div>
      <div className={styles.leaderboardSubtitle}>
        from Project Storm 2026 entrants
      </div>
      <table className={styles.leaderboardTable}>
        <tbody>
          {entries.map((entry, i) => (
            <tr
              key={entry.key}
              className={
                entry.isParticipant
                  ? `${styles.leaderboardRow} ${styles.participantRow}`
                  : styles.leaderboardRow
              }
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <td className={styles.leaderboardRank}>{entry.rank ?? "--"}</td>
              <td className={styles.leaderboardName}>
                <EntrantNameCell entrant={entry.entrant} seed={entry.seed} />
              </td>
              <td className={styles.leaderboardPercent}>
                {entry.ex != null ? `${(entry.ex / 100).toFixed(2)}%` : "--"}
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
  const participants = useAppState(
    (s) => s.event.tournament?.chartLeaderboard?.participants ?? [],
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
            <Leaderboard
              chartHash={tech?.hash}
              isNoCmod={isNoCmod}
              participants={participants}
            />
          </div>
        </>
      )}
    </div>
  );
}
