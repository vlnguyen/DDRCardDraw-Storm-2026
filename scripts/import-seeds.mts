#!/usr/bin/env node
import { readFile, writeFile } from "node:fs/promises";

const SPREADSHEET_URL =
  "https://docs.google.com/spreadsheets/d/1bWj8QnYeLFyWdON8XQjbcfqv1AsPf33nKg0qVJcSbm0";
const SEEDS_GID = "1463525298";
const ENTRANTS_JSON_PATH = "src/assets/entrants/entrants.json";
const ENTRANTS_MAP_PATH = "src/assets/entrants/entrantsMap.ts";
// Keep in sync with the exported `SEED_DROPPED` in entrantsMap.ts.
const SEED_DROPPED = -1;

interface Entrant {
  id: number;
  discriminator: string;
  gamerTag: string;
  prefix: string;
}

async function fetchSeedRows(): Promise<string[][]> {
  const res = await fetch(
    `${SPREADSHEET_URL}/export?format=csv&gid=${SEEDS_GID}`,
  );
  if (!res.ok) {
    throw new Error(
      `Failed to fetch seeds sheet: ${res.status} ${res.statusText}`,
    );
  }
  const text = await res.text();
  // plain Node ESM doesn't flatten papaparse's default export the way
  // webpack does, so `.parse` lives at `.default.parse` here.
  const pp = (await import("papaparse")).default;
  return pp.parse<string[]>(text, { skipEmptyLines: false }).data;
}

/** Seed/player pairs live at A5:B (0-indexed row 4+) — rows above are sheet
 * metadata (Unseeded list, Duplicates, Notes, a "0,Player" label row). */
function parseSeedsByName(rows: string[][]): Map<string, number> {
  const seedByName = new Map<string, number>();
  for (const row of rows.slice(4)) {
    const seedText = row[0]?.trim();
    const name = row[1]?.trim();
    if (!seedText || !name) continue;
    const seed = Number.parseInt(seedText, 10);
    if (Number.isNaN(seed)) continue;
    seedByName.set(name.toLowerCase(), seed);
  }
  return seedByName;
}

function commentFor(entrant: Entrant): string {
  return entrant.prefix
    ? `${entrant.gamerTag} [${entrant.prefix}]`
    : entrant.gamerTag;
}

interface MapEntry {
  id: number;
  comment: string;
  /** Everything inside the entry's braces (id/discriminator/membersId/
   * entrantPlacements lines) except any seed line — that's always
   * re-derived and re-appended fresh so re-running this script is safe. */
  coreBody: string;
}

// One entrantsMap.ts entry:
//   \n  // <comment>\n  [<id>]: {\n<core body>\n  },
// The entry-level closing "  }," is always at exactly 2-space indent,
// which distinguishes it from entrantPlacements' nested "    },".
const ENTRY_RE =
  /\n {2}\/\/([^\n]*)\n {2}\[(\d+)\]: \{\n([\s\S]*?)\n {2}\},(?=\n|$)/g;
const SEED_LINE_RE = /\n {4}seed: (?:-?\d+|null),$/;

function parseEntries(body: string): MapEntry[] {
  const entries: MapEntry[] = [];
  let match: RegExpExecArray | null;
  let lastEnd = 0;
  ENTRY_RE.lastIndex = 0;
  while ((match = ENTRY_RE.exec(body))) {
    if (match.index !== lastEnd) {
      throw new Error(
        `Unexpected content in entrantsMap.ts between entries (offset ${lastEnd}): ${JSON.stringify(
          body.slice(lastEnd, match.index),
        )}`,
      );
    }
    const [full, comment, idStr, innerBody] = match;
    entries.push({
      id: Number(idStr),
      comment: comment.trim(),
      coreBody: innerBody.replace(SEED_LINE_RE, ""),
    });
    lastEnd = match.index + full.length;
  }
  if (lastEnd !== body.length) {
    throw new Error(
      `Unparsed trailing content in entrantsMap.ts: ${JSON.stringify(
        body.slice(lastEnd),
      )}`,
    );
  }
  return entries;
}

function serializeEntry(entry: MapEntry, seed: number | null): string {
  const seedLine = `\n    seed: ${seed === null ? "null" : seed},`;
  return `\n  // ${entry.comment}\n  [${entry.id}]: {\n${entry.coreBody}${seedLine}\n  },`;
}

const entrants: Entrant[] = JSON.parse(
  await readFile(ENTRANTS_JSON_PATH, "utf8"),
);

const seedRows = await fetchSeedRows();
const seedByName = parseSeedsByName(seedRows);

const seedByEntrantId = new Map<number, number>();
for (const entrant of entrants) {
  const seed = seedByName.get(entrant.gamerTag.toLowerCase());
  seedByEntrantId.set(entrant.id, seed ?? SEED_DROPPED);
}

const entrantById = new Map(entrants.map((e) => [e.id, e]));

const source = await readFile(ENTRANTS_MAP_PATH, "utf8");
const startMarker = "export const entrantsMap: Record<";
const startIdx = source.indexOf(startMarker);
if (startIdx === -1) {
  throw new Error(
    "Could not find the `entrantsMap` declaration in entrantsMap.ts",
  );
}
const openBraceIdx = source.indexOf("= {", startIdx);
if (openBraceIdx === -1) {
  throw new Error("Could not find entrantsMap's opening brace");
}
const bodyStart = openBraceIdx + 3;
const closeIdx = source.lastIndexOf("\n};");
if (closeIdx === -1) {
  throw new Error("Could not find entrantsMap's closing brace");
}

const before = source.slice(0, bodyStart);
const body = source.slice(bodyStart, closeIdx);
const after = source.slice(closeIdx);

const existingEntries = parseEntries(body);
const existingIds = new Set(existingEntries.map((e) => e.id));

const finalEntries: { entry: MapEntry; seed: number | null }[] = [];

for (const entry of existingEntries) {
  const entrant = entrantById.get(entry.id);
  // Still registered for this event: a real seed, or SEED_DROPPED if they
  // didn't end up seeded. Not in this event's entrants list: seed is
  // null, and the rest of the entry is left exactly as it was.
  const seed = entrant
    ? (seedByEntrantId.get(entry.id) ?? SEED_DROPPED)
    : null;
  finalEntries.push({ entry, seed });
}

for (const entrant of entrants) {
  if (existingIds.has(entrant.id)) continue;
  finalEntries.push({
    entry: {
      id: entrant.id,
      comment: commentFor(entrant),
      coreBody: `    id: ${entrant.id},\n    discriminator: "${entrant.discriminator}",\n    entrantPlacements: {},`,
    },
    seed: seedByEntrantId.get(entrant.id) ?? SEED_DROPPED,
  });
}

finalEntries.sort((a, b) =>
  a.entry.comment.toLowerCase().localeCompare(b.entry.comment.toLowerCase()),
);

const newBody =
  finalEntries.map(({ entry, seed }) => serializeEntry(entry, seed)).join(
    "",
  ) + "\n";

await writeFile(ENTRANTS_MAP_PATH, before + newBody + after);

const registeredCount = entrants.length;
const newCount = finalEntries.length - existingEntries.length;
console.log(
  `Updated ${ENTRANTS_MAP_PATH}: ${finalEntries.length} entries total ` +
    `(${registeredCount} registered for this event, ${newCount} newly added).`,
);
