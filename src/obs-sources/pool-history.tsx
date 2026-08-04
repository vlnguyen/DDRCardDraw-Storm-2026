import { useEffect, useMemo, useState } from "react";
import type { PoolHistoryStage, PoolPlayer, PoolPlayerScore } from "../state/event.slice";
import { useAppState } from "../state/store";
import { Pools } from "./pools";

export const SPREADSHEET_URL =
  "https://docs.google.com/spreadsheets/d/13_BozVhnQf7nYyP5F2qJlq5Ly-mb0LtJyMWisswBoCc" as const;

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
const POOL_COLUMN = 18;
const GAMER_TAG_COLUMN = 1;
const SONGS_PER_POOL = 6;
const PENDING_MARKER = "--- PENDING ---";

function parseExScore(cell: string | undefined): number | undefined {
  if (!cell) return undefined;
  const value = parseFloat(cell.replace("%", ""));
  return Number.isNaN(value) ? undefined : value;
}

// Elimination/disable status has no source in the spreadsheet today —
// this is the seam for adding that mapping once the data supports it.
function derivePlayerStatus(_row: string[]): {
  isEliminated: boolean;
  isDisabled: boolean;
} {
  return { isEliminated: false, isDisabled: false };
}

function rowToPoolPlayer(row: string[]): PoolPlayer {
  const scores: PoolPlayerScore[] = [];
  for (let songIndex = 0; songIndex < SONGS_PER_POOL; songIndex++) {
    scores.push({ exScore: parseExScore(row[2 + songIndex * 2]) });
  }
  return {
    gamerTag: row[GAMER_TAG_COLUMN],
    scores,
    ...derivePlayerStatus(row),
  };
}

function parsePoolPlayers(rows: string[][], poolCode: string): PoolPlayer[] {
  return rows
    .filter((row) => row[POOL_COLUMN] === poolCode)
    .filter((row) => row[GAMER_TAG_COLUMN] !== PENDING_MARKER)
    .map(rowToPoolPlayer);
}

async function fetchStageRows(stage: PoolHistoryStage): Promise<string[][]> {
  const gid = STAGE_GIDS[stage];
  const res = await fetch(`${SPREADSHEET_URL}/export?format=csv&gid=${gid}`);
  const text = await res.text();
  const pp = await import("papaparse");
  return pp.parse<string[]>(text, { skipEmptyLines: false }).data;
}

export function PoolHistory() {
  const selection = useAppState(
    (s) => s.event.tournament?.poolHistorySelection,
  );
  const stage = selection?.stage;
  const [rows, setRows] = useState<string[][] | null>(null);

  useEffect(() => {
    if (!stage) {
      setRows(null);
      return;
    }
    let cancelled = false;
    fetchStageRows(stage).then((data) => {
      if (!cancelled) setRows(data);
    });
    return () => {
      cancelled = true;
    };
  }, [stage]);

  const poolPlayers = useMemo(() => {
    if (!rows || !selection?.poolCode) return [];
    return parsePoolPlayers(rows, selection.poolCode);
  }, [rows, selection?.poolCode]);

  return <Pools poolPlayers={poolPlayers} />;
}
