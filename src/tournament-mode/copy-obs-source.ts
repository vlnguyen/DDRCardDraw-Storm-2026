import { copyPlainTextToClipboard } from "../utils/share";

export const routableGlobalSourcePath = (labelId: string) =>
  `../obs-globals/${labelId}`;

export const routableCabSourcePath = (cabId: string, sourceName: string) =>
  `cab/${cabId}/source/${sourceName}`;
export const routableLiveRankingsPath = () => `../live-rankings`;
export const routableStepStatsPath = (cab: 1 | 2, player: 1 | 2) =>
  `../step-stats?cab=${cab}&player=${player}`;
export const routablePoolsPath = () => `../pools`;
export const routableChartLeaderboardPath = () => `../chart-leaderboard`;

export function copyObsSource(href: string) {
  void copyPlainTextToClipboard(href, "Copied OBS source URL to clipboard");
}
