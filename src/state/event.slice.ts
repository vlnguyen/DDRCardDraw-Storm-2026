import { PayloadAction, createSelector, createSlice } from "@reduxjs/toolkit";
import { nanoid } from "nanoid";
import { CompoundSetId } from "../models/Drawing";
import { mergeDraws } from "./central";

export interface CabInfo {
  /** drawing id if active */
  activeMatch: CompoundSetId | string | null;
  name: string;
  id: string;
}

export type ObsLabelType = "dialog" | "title";
export type ObsTextAlign = "left" | "center" | "right";

export interface EventState {
  eventName: string;
  cabs: Record<string, CabInfo>;
  tournament: TournamentState;
  obsLabels: Record<string, {
    label: string;
    value: string;
    labelType?: ObsLabelType;
    textAlign?: ObsTextAlign;
  }>;
  obsCss: string;
}

export interface PoolPlayerScore {
  /** 
   * The scoreId from a specific match or undefined if the 
   * score is not associated with a specific match.
   * 
  * If the scoreId is defined then the exScore and judgement counts
   * can be populated from the match data, otherwise the scoreId can 
   * remain null and the judgement counts can be entered manually.
   */
  scoreId?: number;
  
  // judgement counts and ex score
  exScore?: number;
  fantasticPlus?: number;
  fantastics?: number;
  excellents?: number;
  greats?: number;
  decents?: number;
  wayOffs?: number;
  misses?: number;
  minesHit?: number;
  holdsHeld?: number;
  rollsHeld?: number;
}

export type PlayerAdvancement = "" | "1st" | "2nd";

export interface PoolPlayer {
  gamerTag?: string;
  prefix?: string;
  entrantId?: number;
  scores: PoolPlayerScore[];
  isEliminated: boolean;
  isDisabled: boolean;
  advancement?: PlayerAdvancement;
}

export interface PoolState {
  songs?: string[];
  players?: PoolPlayer[];
  numPlayersAdvance?: number;
  totalSongs?: number;
  currentSong?: number;
}

export type CardDrawPhase = "pools" | "pools-4" | "de-bo3" | "de-bo5";

export interface LowerThirdState {
  title: string;
  line1: string;
  line2: string;
}

export interface ScheduleItem {
  time?: string;
  event?: string;
  description?: string;
}

export type ScheduleDay = "fri" | "sat" | "sun";

export interface ScheduleDayState {
  items: ScheduleItem[];
}

export type SchedulesState = Partial<Record<ScheduleDay, ScheduleDayState>>;

export type PoolHistoryStage = `stage${1 | 2 | 3 | 4 | 5 | 6 | 7}`;

export interface PoolHistoryState {
  /** UTC timestamp (ISO string) of the last successful fetch across all stages */
  lastFetched?: string;
  /** raw fetch data from Google Sheets, keyed by stage */
  data?: Partial<Record<PoolHistoryStage, any>>;
}

export interface StageProgressionState {
  /** same stage keys as pool history, but not broken out by pool */
  selectedStage?: PoolHistoryStage;
  selectedPool?: string;
}

export interface UpcomingPoolState {
  selectedStage?: PoolHistoryStage;
  selectedPool?: string;
  /** overrides the "Stage # - Pool ##" text shown in pools-condensed; undefined means use the default text */
  stageNameOverride?: string;
}

export interface ChartDetailState {
  /** folder name of the song whose chart is shown on the leaderboard */
  songDir?: string;
}

/**
 * Event state properties that are unique to use at Project Storm
 */
export interface TournamentState {
  lobbyConnection?: {
    code?: string;
    password?: string;
  };
  poolState?: PoolState;
  machineCodeCab1?: string;
  machineCodeCab2?: string;
  chartLeaderboard?: ChartDetailState;
  cardDrawPhase?: CardDrawPhase;
  lowerThird?: LowerThirdState;
  toggleLowerThird?: boolean;
  schedules?: SchedulesState;
  poolHistory?: PoolHistoryState;
  stageProgression?: StageProgressionState;
  upcomingPool?: UpcomingPoolState;
}


const initialState: EventState = {
  eventName: "",
  cabs: {
    default: {
      id: "default",
      name: "Primary Cab",
      activeMatch: null,
    },
  },
  tournament: {
    lobbyConnection: {
      code: "",
      password: "",
    },
    poolState: {
      songs: [],
      players: [],
    },
  },
  obsLabels: {},
  obsCss: `h1 {
  /* add text styles here */
}`,
};

export const eventSlice = createSlice({
  name: "event",
  initialState,
  reducers: {
    /** add a cab with its name */
    addCab: {
      // the id must be minted here rather than in the reducer: actions
      // replay on the party server and other clients, and every replica
      // has to produce an identical cab
      prepare(name: string) {
        return { payload: { name, id: nanoid(5) } };
      },
      reducer(state, action: PayloadAction<{ name: string; id: string }>) {
        state.cabs[action.payload.id] = {
          id: action.payload.id,
          name: action.payload.name,
          activeMatch: null,
        };
      },
    },
    removeCab(state, action: PayloadAction<string>) {
      delete state.cabs[action.payload];
    },
    clearCabAssignment(state, action: PayloadAction<string>) {
      const cab = state.cabs[action.payload];
      if (!cab) return;
      cab.activeMatch = null;
    },
    assignMatchToCab(
      state,
      action: PayloadAction<{ cabId: string; matchId: string }>,
    ) {
      const cab = state.cabs[action.payload.cabId];
      if (!cab) return;
      cab.activeMatch = action.payload.matchId;
    },
    assignSetToCab(
      state,
      action: PayloadAction<{ cabId: string; matchId: CompoundSetId }>,
    ) {
      const cab = state.cabs[action.payload.cabId];
      if (!cab) return;
      cab.activeMatch = action.payload.matchId;
    },
    updateLabel(
      state,
      action: PayloadAction<{
        id: string;
        value: string;
        label: string;
        labelType?: ObsLabelType;
        textAlign?: ObsTextAlign;
      }>,
    ) {
      state.obsLabels[action.payload.id] = {
        label: action.payload.label,
        value: action.payload.value,
        labelType: action.payload.labelType,
        textAlign: action.payload.textAlign,
      };
    },
    removeLabel(state, action: PayloadAction<{ id: string }>) {
      delete state.obsLabels[action.payload.id];
    },
    updateObsCss(state, action: PayloadAction<string>) {
      state.obsCss = action.payload;
    },
    setPoolPlayers(state, action: PayloadAction<PoolPlayer[]>) {
      if (!state.tournament.poolState) {
        state.tournament.poolState = {};
      }
      state.tournament.poolState.players = action.payload;
    },
    setPoolSongs(state, action: PayloadAction<string[]>) {
      if (!state.tournament.poolState) {
        state.tournament.poolState = {};
      }
      state.tournament.poolState.songs = action.payload;
    },
    setPoolSettings(
      state,
      action: PayloadAction<{
        numPlayersAdvance?: number;
        totalSongs?: number;
        currentSong?: number;
      }>,
    ) {
      if (!state.tournament.poolState) {
        state.tournament.poolState = {};
      }
      state.tournament.poolState.numPlayersAdvance =
        action.payload.numPlayersAdvance;
      state.tournament.poolState.totalSongs = action.payload.totalSongs;
      state.tournament.poolState.currentSong = action.payload.currentSong;
    },
    updateLobbyConnection(
      state,
      action: PayloadAction<{
        code: string;
        password: string;
      }>,
    ) {
      if (!state.tournament) {
        state.tournament = {};
      }
      state.tournament.lobbyConnection = action.payload;
    },
    setCabMachines(
      state,
      action: PayloadAction<{ cab1: string; cab2: string }>,
    ) {
      if (!state.tournament) {
        state.tournament = {};
      }
      state.tournament.machineCodeCab1 = action.payload.cab1;
      state.tournament.machineCodeCab2 = action.payload.cab2;
    },
    setChartLeaderboard(state, action: PayloadAction<string>) {
      if (!state.tournament) {
        state.tournament = {};
      }
      state.tournament.chartLeaderboard = { songDir: action.payload };
    },
    setCardDrawPhase(state, action: PayloadAction<CardDrawPhase>) {
      if (!state.tournament) {
        state.tournament = {};
      }
      state.tournament.cardDrawPhase = action.payload;
    },
    updateLowerThird(state, action: PayloadAction<LowerThirdState>) {
      if (!state.tournament) {
        state.tournament = {};
      }
      state.tournament.lowerThird = action.payload;
    },
    setToggleLowerThird(state, action: PayloadAction<boolean>) {
      if (!state.tournament) {
        state.tournament = {};
      }
      state.tournament.toggleLowerThird = action.payload;
    },
    updateSchedule(
      state,
      action: PayloadAction<{ day: ScheduleDay; items: ScheduleItem[] }>,
    ) {
      if (!state.tournament) {
        state.tournament = {};
      }
      if (!state.tournament.schedules) {
        state.tournament.schedules = {};
      }
      state.tournament.schedules[action.payload.day] = {
        ...state.tournament.schedules[action.payload.day],
        items: action.payload.items,
      };
    },
    setPoolHistoryData(
      state,
      action: PayloadAction<{
        data: Partial<Record<PoolHistoryStage, any>>;
        lastFetched: string;
      }>,
    ) {
      if (!state.tournament) {
        state.tournament = {};
      }
      if (!state.tournament.poolHistory) {
        state.tournament.poolHistory = {};
      }
      state.tournament.poolHistory.data = action.payload.data;
      state.tournament.poolHistory.lastFetched = action.payload.lastFetched;
    },
    setStageProgressionSelection(
      state,
      action: PayloadAction<{ stage: PoolHistoryStage; pool: string }>,
    ) {
      if (!state.tournament) {
        state.tournament = {};
      }
      if (!state.tournament.stageProgression) {
        state.tournament.stageProgression = {};
      }
      state.tournament.stageProgression.selectedStage = action.payload.stage;
      state.tournament.stageProgression.selectedPool = action.payload.pool;
    },
    setUpcomingPoolSelection(
      state,
      action: PayloadAction<{ stage: PoolHistoryStage; pool: string }>,
    ) {
      if (!state.tournament) {
        state.tournament = {};
      }
      if (!state.tournament.upcomingPool) {
        state.tournament.upcomingPool = {};
      }
      state.tournament.upcomingPool.selectedStage = action.payload.stage;
      state.tournament.upcomingPool.selectedPool = action.payload.pool;
    },
    setUpcomingPoolStageNameOverride(
      state,
      action: PayloadAction<string | undefined>,
    ) {
      if (!state.tournament) {
        state.tournament = {};
      }
      if (!state.tournament.upcomingPool) {
        state.tournament.upcomingPool = {};
      }
      state.tournament.upcomingPool.stageNameOverride = action.payload;
    },
    replaceState(_state, action: PayloadAction<EventState>) {
      return action.payload;
    },
    /**
     * Shallow-merges only the top-level keys present in the payload, leaving
     * the rest of state untouched. `tournament` is merged one level deeper
     * so a partial tournament import doesn't clobber untouched sub-fields.
     */
    mergeState(state, action: PayloadAction<Partial<EventState>>) {
      const { tournament, ...rest } = action.payload;
      Object.assign(state, rest);
      if (tournament) {
        if (!state.tournament) {
          state.tournament = {};
        }
        Object.assign(state.tournament, tournament);
      }
    },
  },
  extraReducers(builder) {
    builder.addCase(mergeDraws, (state, { payload }) => {
      for (const cab of Object.values(state.cabs)) {
        if (
          Array.isArray(cab.activeMatch) &&
          cab.activeMatch[0] === payload.drawingId
        ) {
          cab.activeMatch[1] = payload.newSubdrawId;
        }
      }
    });
  },
  selectors: {
    allCabs: createSelector([(state: EventState) => state.cabs], (cabs) => {
      return Object.values(cabs);
    }),
  },
});

export function addObsLabels(state: EventState) {
  if (!state.obsLabels) {
    state.obsLabels = {};
  }
}
