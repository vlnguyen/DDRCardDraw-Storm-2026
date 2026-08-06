import type {
  PlayerAdvancement,
  PoolHistoryStage,
  PoolPlayer,
  PoolPlayerScore,
} from "../state/event.slice";
import entrants from "../assets/entrants/entrants.json";

export const SPREADSHEET_URL =
  "https://docs.google.com/spreadsheets/d/1bWj8QnYeLFyWdON8XQjbcfqv1AsPf33nKg0qVJcSbm0" as const;

export const STAGE_GIDS: Readonly<Record<PoolHistoryStage, string>> = {
  stage1: "1158920643",
  stage2: "1418881493",
  stage3: "1085633045",
  stage4: "1359413595",
  stage5: "244654487",
  stage6: "699616213",
  stage7: "700473128",
};

// Column positions within a Stage tab's raw CSV export (0-indexed).
const ADVANCEMENT_COLUMN = 16;
const POOL_COLUMN = 18;
const GAMER_TAG_COLUMN = 1;
const SONGS_PER_POOL = 6;
const PENDING_MARKER = "--- PENDING ---";

// EX scores in the spreadsheet are integers from 0-10000 (e.g. 9523 = 95.23%).
function parseExScore(cell: string | undefined): number | undefined {
  if (!cell) return undefined;
  const value = parseFloat(cell.replace("%", ""));
  return Number.isNaN(value) ? undefined : value / 100;
}

function parseAdvancement(cell: string | undefined): PlayerAdvancement {
  return cell === "1st" || cell === "2nd" ? cell : "";
}

// Elimination/disable status has no source in the spreadsheet today —
// this is the seam for adding that mapping once the data supports it.
function derivePlayerStatus(_row: string[]): {
  isEliminated: boolean;
  isDisabled: boolean;
} {
  return { isEliminated: false, isDisabled: false };
}

function findEntrant(gamerTag: string) {
  return entrants.find(
    (entrant) => entrant.gamerTag.toLowerCase() === gamerTag.toLowerCase(),
  );
}

function rowToPoolPlayer(row: string[]): PoolPlayer {
  const scores: PoolPlayerScore[] = [];
  for (let songIndex = 0; songIndex < SONGS_PER_POOL; songIndex++) {
    scores.push({ exScore: parseExScore(row[2 + songIndex * 2]) });
  }
  const gamerTag = row[GAMER_TAG_COLUMN];
  const entrant = findEntrant(gamerTag);
  return {
    gamerTag: entrant?.gamerTag ?? gamerTag,
    prefix: entrant?.prefix,
    entrantId: entrant?.id,
    scores,
    advancement: parseAdvancement(row[ADVANCEMENT_COLUMN]),
    ...derivePlayerStatus(row),
  };
}

export function parsePoolPlayers(
  rows: string[][],
  poolCode: string,
): PoolPlayer[] {
  return rows
    .filter((row) => row[POOL_COLUMN] === poolCode)
    .filter((row) => row[GAMER_TAG_COLUMN])
    .filter((row) => row[GAMER_TAG_COLUMN] !== PENDING_MARKER)
    .map(rowToPoolPlayer);
}

/** Distinct pool codes present in a stage's raw rows, in sheet order. */
export function getPoolCodesForStage(rows: string[][] | undefined): string[] {
  if (!rows) return [];
  const codes = new Set<string>();
  for (const row of rows) {
    const code = row[POOL_COLUMN];
    if (code && code !== "Pool") {
      codes.add(code);
    }
  }
  return Array.from(codes);
}

/** Fetches and parses a Stage tab's raw rows. Used by the dashboard's Fetch
 * button to populate `tournament.poolHistory.data` — the OBS source itself
 * never calls this, it only reads the cached result from the event slice. */
export async function fetchStageRows(
  stage: PoolHistoryStage,
): Promise<string[][]> {
  const gid = STAGE_GIDS[stage];
  const res = await fetch(`${SPREADSHEET_URL}/export?format=csv&gid=${gid}`);
  const text = await res.text();
  const pp = await import("papaparse");
  return pp.parse<string[]>(text, { skipEmptyLines: false }).data;
}
