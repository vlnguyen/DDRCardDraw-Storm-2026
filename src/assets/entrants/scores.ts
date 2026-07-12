import scoresData from "./scores.json";

export interface GrooveStatsScore {
  name: string;
  memberId: number;
  chartHash: string;
  ex: number;
  percent: number;
  fantasticPlus: number;
  fantastic: number;
  excellent: number;
  great: number;
  decent: number;
  wayOff: number;
  miss: number;
  minesHit: number;
  holdsHeld: number;
  rollsHeld: number;
  clearType: number;
  usedCmod: boolean;
  comments: string | null;
  rate: number | null;
  lastUpdated: string;
  exLastUpdated: string | null;
}

export const scores = scoresData as Record<
  string,
  GrooveStatsScore[] | undefined
>;
