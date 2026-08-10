import techCountsData from "./storm2026_tech_counts.json";

export interface ChartTechCounts {
  hash: string;
  credit: string;
  description: string;
}

export const techCounts = techCountsData as Record<
  string,
  ChartTechCounts | undefined
>;
