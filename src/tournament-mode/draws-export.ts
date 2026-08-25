import {
  CHART_DRAWN,
  Drawing,
  DrawnChart,
  getAllPlayers,
  PlayerPickPlaceholder,
  playerNameById,
} from "../models/Drawing";
import { buildDataUri, dateForFilename, downloadDataUrl } from "../utils/share";

function songInfo(drawing: Drawing, chart: DrawnChart | PlayerPickPlaceholder) {
  const source =
    chart.type === CHART_DRAWN ? chart : drawing.pocketPicks[chart.id]?.pick;
  return {
    songTitle: source?.name ?? null,
    folder: source?.folder ?? null,
    artist: source?.artist ?? null,
    diffAbbr: source?.diffAbbr ?? null,
    level: source?.level ?? null,
  };
}

function playerFor(
  drawing: Drawing,
  record: Record<string, { player: string } | null>,
  chartId: string,
) {
  const entry = record[chartId];
  return entry ? playerNameById(drawing.meta, entry.player) : null;
}

function buildChart(drawing: Drawing, chart: DrawnChart | PlayerPickPlaceholder) {
  const winnerId = drawing.winners[chart.id];
  return {
    ...songInfo(drawing, chart),
    protectedBy: playerFor(drawing, drawing.protects, chart.id),
    vetoedBy: playerFor(drawing, drawing.bans, chart.id),
    winner: winnerId ? playerNameById(drawing.meta, winnerId) : null,
    pocketPickedBy: playerFor(drawing, drawing.pocketPicks, chart.id),
    id: chart.id,
    type: chart.type,
  };
}

export function buildDrawExportData(drawings: Drawing[]) {
  return drawings.map((drawing) => ({
    label: drawing.meta.title,
    participants: getAllPlayers(drawing),
    subDrawings: Object.values(drawing.subDrawings).map((sub) => ({
      id: sub.compoundId[1],
      charts: sub.charts.map((chart) => buildChart(drawing, chart)),
    })),
    id: drawing.id,
  }));
}

export function exportDrawsJson(drawings: Drawing[]) {
  const json = JSON.stringify(buildDrawExportData(drawings), null, 2);
  downloadDataUrl(
    buildDataUri(json, "application/json", "url"),
    `draws-${dateForFilename()}.json`,
  );
}

const CSV_HEADER = [
  "drawingLabel",
  "songTitle",
  "folder",
  "participants",
  "protectedBy",
  "vetoedBy",
  "winner",
  "pocketPickedBy",
  "artist",
  "diffAbbr",
  "level",
  "drawingId",
  "subDrawingId",
  "chartId",
  "chartType",
];

export async function exportDrawsCsv(drawings: Drawing[]) {
  const pp = await import("papaparse");

  const rows = buildDrawExportData(drawings).flatMap((drawing) =>
    drawing.subDrawings.flatMap((sub) =>
      sub.charts.map((chart) => [
        drawing.label,
        chart.songTitle,
        chart.folder,
        drawing.participants.join("; "),
        chart.protectedBy,
        chart.vetoedBy,
        chart.winner,
        chart.pocketPickedBy,
        chart.artist,
        chart.diffAbbr,
        chart.level,
        drawing.id,
        sub.id,
        chart.id,
        chart.type,
      ]),
    ),
  );

  const csv = pp.unparse([CSV_HEADER, ...rows]);
  downloadDataUrl(
    buildDataUri(csv, "text/csv", "url"),
    `draws-${dateForFilename()}.csv`,
  );
}
