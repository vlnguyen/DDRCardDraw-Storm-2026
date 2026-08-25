import { Match } from "../../obs-sources/lobby.types";
import { buildDataUri, dateForFilename, downloadDataUrl } from "../../utils/share";

export function isLabelledMatch(match: Match) {
  return !!match.label;
}

function sortChronologically(matches: Match[]) {
  return [...matches].sort((a, b) => a.dateAdded - b.dateAdded);
}

export function exportMatchLogJson(matches: Match[]) {
  const json = JSON.stringify(sortChronologically(matches), null, 2);
  downloadDataUrl(
    buildDataUri(json, "application/json", "url"),
    `match-log-${dateForFilename()}.json`,
  );
}

const CSV_HEADER = [
  "matchDate",
  "matchLabel",
  "songTitle",
  "profileName",
  "playerId",
  "exScore",
  "fantasticPlus",
  "fantastics",
  "excellents",
  "greats",
  "decents",
  "wayOffs",
  "misses",
  "minesHit",
  "totalMines",
  "holdsHeld",
  "totalHolds",
  "rollsHeld",
  "totalRolls",
  "matchId",
  "lobbyCode",
  "songArtist",
  "songPath",
  "totalSteps",
  "scoreId",
  "score",
  "isValid",
];

export async function exportMatchLogCsv(matches: Match[]) {
  const pp = await import("papaparse");

  const rows = sortChronologically(matches).flatMap((match) =>
    match.scores.map((score) => [
      new Date(match.dateAdded).toISOString(),
      match.label,
      match.songTitle,
      score.profileName,
      score.playerId,
      score.exScore,
      score.fantasticPlus,
      score.fantastics,
      score.excellents,
      score.greats,
      score.decents,
      score.wayOffs,
      score.misses,
      score.minesHit,
      match.totalMines,
      score.holdsHeld,
      match.totalHolds,
      score.rollsHeld,
      match.totalRolls,
      match.id,
      match.lobbyCode,
      match.songArtist,
      match.songPath,
      match.totalSteps,
      score.id,
      score.score,
      score.isValid,
    ]),
  );

  const csv = pp.unparse([CSV_HEADER, ...rows]);
  downloadDataUrl(
    buildDataUri(csv, "text/csv", "url"),
    `match-log-${dateForFilename()}.csv`,
  );
}
