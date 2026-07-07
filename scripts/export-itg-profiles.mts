/**
 * Generates a local ITGmania profile for each tournament entrant, based on
 * the "Project Storm" template profile in src/assets/LocalProfiles.
 */
import { randomBytes } from "node:crypto";
import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";

const projectRoot = join(import.meta.dirname, "..");
const templateDir = join(
  projectRoot,
  "src/assets/LocalProfiles/Project Storm",
);
const entrantsFile = join(projectRoot, "src/assets/entrants/entrants.json");
const outDir = join(projectRoot, "out/LocalProfiles");

const LAST_PLAYED_DATE = "2026-08-14 00:00:00";
const LAST_PLAYED_DATE_DATE_ONLY = "2026-08-14";
const EMPTY_SUBFOLDERS = ["EditCourses", "Edits", "Rivals", "Screenshots"];

const usedGuids = new Set<string>();

function generateUniqueGuid(): string {
  let guid: string;
  do {
    guid = randomBytes(8).toString("hex");
  } while (usedGuids.has(guid));
  usedGuids.add(guid);
  return guid;
}

interface Entrant {
  id: number;
  gamerTag: string;
  prefix: string;
}

function toDirectoryName(gamerTag: string): string {
  const alphanumeric = gamerTag.replace(/[^a-zA-Z0-9]/g, "");
  if (!alphanumeric) {
    throw new Error(
      `gamerTag "${gamerTag}" has no alphanumeric characters to form a directory name`,
    );
  }
  return alphanumeric;
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

const entrants: Entrant[] = JSON.parse(
  await readFile(entrantsFile, { encoding: "utf-8" }),
);

const editableTemplate = await readFile(
  join(templateDir, "Editable.ini"),
  "utf-8",
);
const statsTemplate = await readFile(join(templateDir, "Stats.xml"), "utf-8");
const typeTemplate = await readFile(join(templateDir, "Type.ini"), "utf-8");

await rm(outDir, { recursive: true, force: true });
await mkdir(outDir, { recursive: true });

for (const entrant of entrants) {
  const profileDir = join(outDir, toDirectoryName(entrant.gamerTag));
  await cp(templateDir, profileDir, { recursive: true });

  await Promise.all(
    EMPTY_SUBFOLDERS.map((name) =>
      mkdir(join(profileDir, name), { recursive: true }),
    ),
  );

  const editableIni = editableTemplate.replace(
    /^DisplayName=.*$/m,
    `DisplayName=${entrant.gamerTag}`,
  );
  await writeFile(join(profileDir, "Editable.ini"), editableIni);

  const statsXml = statsTemplate
    .replace(
      /<DisplayName>.*?<\/DisplayName>/,
      `<DisplayName>${escapeXml(entrant.gamerTag)}</DisplayName>`,
    )
    .replace(/<Guid>.*?<\/Guid>/, `<Guid>${generateUniqueGuid()}</Guid>`)
    .replace(
      /<LastPlayedDate>.*?<\/LastPlayedDate>/,
      `<LastPlayedDate>${LAST_PLAYED_DATE_DATE_ONLY}</LastPlayedDate>`,
    );
  await writeFile(join(profileDir, "Stats.xml"), statsXml);

  const typeIni = typeTemplate.replace(
    /^LastPlayedDate=.*$/m,
    `LastPlayedDate=${LAST_PLAYED_DATE}`,
  );
  await writeFile(join(profileDir, "Type.ini"), typeIni);
}

console.log(`Exported ${entrants.length} ITG profiles to ${outDir}`);
