/**
 * Converts src/assets/entrants/scores.csv into scores.json, a Record of
 * GrooveStats scores keyed by chart hash. Each chart hash maps to every
 * score submitted for it, in scores.csv order. The shape is typed by
 * GrooveStatsScore in scores.ts, which imports this file.
 */
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { parseArgs } from "node:util";
import pp from "papaparse";

const projectRoot = join(import.meta.dirname, "..");
const outPath = join(projectRoot, "src/assets/entrants/scores.json");

const {
  values: { path: csvPath },
} = parseArgs({
  options: { path: { type: "string" } },
});

if (!csvPath) {
  console.log(
    `No CSV path provided. Invoke like 'yarn generate:scores --path path/to/scores.csv'`,
  );
  process.exit(1);
}

interface ScoresRow {
  members_name: string;
  scores_id: string;
  scores_member_id: string;
  scores_chart_hash: string;
  scores_ex: string;
  scores_percent: string;
  scores_fantastic_plus: string;
  scores_fantastic: string;
  scores_excellent: string;
  scores_great: string;
  scores_decent: string;
  scores_way_off: string;
  scores_miss: string;
  scores_mines_hit: string;
  scores_holds_held: string;
  scores_rolls_held: string;
  scores_clear_type: string;
  scores_used_cmod: string;
  scores_comments: string;
  scores_rate: string;
  scores_last_updated: string;
  scores_ex_last_updated: string;
}

function toNullableString(value: string | undefined): string | null {
  return !value || value === "NULL" ? null : value;
}

function toNullableNumber(value: string | undefined): number | null {
  const str = toNullableString(value);
  return str === null ? null : Number(str);
}

const pacificTimeFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: "America/Los_Angeles",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
});

/**
 * GrooveStats timestamps are recorded on a machine in California and have
 * no timezone info attached. Given a "YYYY-MM-DD HH:mm:ss" string
 * representing that Pacific Time wall clock, returns the equivalent
 * "YYYY-MM-DD HH:mm:ss" string in UTC (DST-aware).
 */
function applyGrooveStatsTimeOffset(dateString: string): string {
  const [datePart, timePart] = dateString.split(" ");
  const [year, month, day] = datePart.split("-").map(Number);
  const [hour, minute, second] = timePart.split(":").map(Number);

  const naiveUtcMs = Date.UTC(year, month - 1, day, hour, minute, second);

  const parts = pacificTimeFormatter.formatToParts(naiveUtcMs);
  const get = (type: string) =>
    Number(parts.find((part) => part.type === type)!.value);

  const wallClockInPacificAsUtcMs = Date.UTC(
    get("year"),
    get("month") - 1,
    get("day"),
    get("hour"),
    get("minute"),
    get("second"),
  );

  const pacificOffsetMs = wallClockInPacificAsUtcMs - naiveUtcMs;
  const utcDate = new Date(naiveUtcMs - pacificOffsetMs);

  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    `${utcDate.getUTCFullYear()}-${pad(utcDate.getUTCMonth() + 1)}-${pad(utcDate.getUTCDate())} ` +
    `${pad(utcDate.getUTCHours())}:${pad(utcDate.getUTCMinutes())}:${pad(utcDate.getUTCSeconds())}`
  );
}

function toNullableGrooveStatsDate(value: string | undefined): string | null {
  const str = toNullableString(value);
  return str === null ? null : applyGrooveStatsTimeOffset(str);
}

const { data, errors } = pp.parse<ScoresRow>(
  await readFile(csvPath, { encoding: "utf-8" }),
  { header: true, skipEmptyLines: true },
);

if (errors.length) {
  throw new Error(`Failed to parse scores.csv: ${JSON.stringify(errors)}`);
}

const scores: Record<string, { ex: number }[]> = {};
let totalScores = 0;

for (const row of data) {
  const score = {
    name: row.members_name,
    memberId: Number(row.scores_member_id),
    chartHash: row.scores_chart_hash,
    ex: Number(row.scores_ex),
    percent: Number(row.scores_percent),
    fantasticPlus: Number(row.scores_fantastic_plus),
    fantastic: Number(row.scores_fantastic),
    excellent: Number(row.scores_excellent),
    great: Number(row.scores_great),
    decent: Number(row.scores_decent),
    wayOff: Number(row.scores_way_off),
    miss: Number(row.scores_miss),
    minesHit: Number(row.scores_mines_hit),
    holdsHeld: Number(row.scores_holds_held),
    rollsHeld: Number(row.scores_rolls_held),
    clearType: Number(row.scores_clear_type),
    usedCmod: row.scores_used_cmod === "1",
    comments: toNullableString(row.scores_comments),
    rate: toNullableNumber(row.scores_rate),
    lastUpdated: applyGrooveStatsTimeOffset(row.scores_last_updated),
    exLastUpdated: toNullableGrooveStatsDate(row.scores_ex_last_updated),
  };

  (scores[row.scores_chart_hash] ??= []).push(score);
  totalScores++;
}

for (const chartScores of Object.values(scores)) {
  chartScores.sort((a, b) => b.ex - a.ex);
}

await writeFile(outPath, JSON.stringify(scores, null, 2));

console.log(
  `Wrote ${totalScores} scores across ${Object.keys(scores).length} charts to ${outPath}`,
);
