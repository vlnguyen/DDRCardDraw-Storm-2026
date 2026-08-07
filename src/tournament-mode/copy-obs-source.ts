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
export const routablePersona3CirclePath = () => `../persona-3-circle`;
export const routableTrianglesPath = () => `../triangles`;
export const routableVsMeterPath = () => `../vs-meter`;
export const routableLowerThirdPath = () => `../lower-third`;
export const routableCurrentTimePath = () => `../current-time`;
export const routableBracketPath = () => `../bracket`;
export const routableSchedulePath = (day: "fri" | "sat" | "sun") =>
  `../schedule?day=${day}`;
export const routableStarsPath = () => `../stars`;
export const routableStageProgressionPath = () => `../stage-progression`;
export const routableUpcomingPoolPath = () => `../upcoming-pool`;
export const routablePoolSongCounterPath = () => `../pool-song-counter`;

export function copyObsSource(href: string) {
  void copyPlainTextToClipboard(href, "Copied OBS source URL to clipboard");
}
