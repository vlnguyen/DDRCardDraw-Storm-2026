/**
 * Mirrors types from syncstart's src/types/models.types.ts and
 * src/events/events.types.ts (no shared package between repos).
 */
export interface Judgments {
  fantasticPlus: number;
  fantastics: number;
  excellents: number;
  greats: number;
  decents?: number;
  wayOffs?: number;
  misses: number;
  totalSteps: number;
  minesHit: number;
  totalMines: number;
  holdsHeld: number;
  totalHolds: number;
  rollsHeld: number;
  totalRolls: number;
}

export interface Player {
  playerId: "P1" | "P2";
  profileName: string;
  screenName:
    | "NoScreen"
    | "ScreenSelectMusic"
    | "ScreenGameplay"
    | "ScreenPlayerOptions"
    | "ScreenEvaluationStage";
  ready: boolean;
  judgments?: Judgments;
  score?: number;
  exScore?: number;
  songProgression?: {
    currentTime: number;
    totalTime: number;
  };
}

export interface SongInfo {
  songPath: string;
  title: string;
  artist: string;
  songLength: number;
}

export interface LobbyStatePayload {
  players: Array<Player>;
  spectators: Array<string>;
  code: string;
  songInfo?: SongInfo;
}
