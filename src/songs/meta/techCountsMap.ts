import techCountsData from "./storm2026_tech_counts.json";

export interface ChartTechCounts {
  hash: string;
}

export const techCounts = techCountsData as Record<
  string,
  ChartTechCounts | undefined
>;
