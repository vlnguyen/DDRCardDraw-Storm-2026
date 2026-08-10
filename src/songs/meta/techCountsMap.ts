import techCountsData from "./storm2026_tech_counts.json";

export interface ChartTechCounts {
  hash: string;
  credit: string;
  description: string;
  total_steps: number;
  min_bpm: number;
  max_bpm: number;
  total_holds: number;
  total_rolls: number;
  total_mines: number;
  total_jumps: number;
  brackets: number;
  crossovers: number;
  footswitches: number;
  jacks: number;
  doublesteps: number;
  sideswitches: number;
}

export const techCounts = techCountsData as Record<
  string,
  ChartTechCounts | undefined
>;
