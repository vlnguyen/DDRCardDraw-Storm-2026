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
  socketId?: string;
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

export interface Spectator {
  profileName: string;
  socketId?: string;
}

export interface Machine {
  player1?: Player;
  player2?: Player;
  socketId?: string;
}

export interface Lobby {
  code: string;
  password: string;
  machines: Record<string, Machine>;
  spectators: Record<string, Spectator>;
  songInfo?: SongInfo;
  lastUpdate: number;
}

/**
 * Mirrors syncstart's src/MatchLog/MatchLog.types.ts.
 */
export interface PlayerScore {
  id: number;
  playerId: Player["playerId"];
  profileName: string;
  score: number | null;
  exScore: number | null;
  fantasticPlus: number | null;
  fantastics: number | null;
  excellents: number | null;
  greats: number | null;
  decents: number | null;
  wayOffs: number | null;
  misses: number | null;
  minesHit: number | null;
  holdsHeld: number | null;
  rollsHeld: number | null;
  /** 1 if the sum of judgments matches the match's totalSteps, 0 otherwise. */
  isValid: number;
}

export interface Match {
  id: string;
  dateAdded: number;
  lobbyCode: string;
  songTitle: string | null;
  songArtist: string | null;
  songPath: string | null;
  totalSteps: number | null;
  totalHolds: number | null;
  totalRolls: number | null;
  totalMines: number | null;
  scores: PlayerScore[];
}

export type ServerMessage =
  | { event: "matchLogged"; data: Match }
  | { event: "lobbyAdded"; data: Lobby }
  | { event: "lobbyUpdated"; data: Lobby }
  | { event: "lobbyRemoved"; data: { code: string } };
