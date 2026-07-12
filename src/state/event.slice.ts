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

interface EventState {
  eventName: string;
  cabs: Record<string, CabInfo>;
  tournament: TournamentState;
  obsLabels: Record<string, { label: string; value: string }>;
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

export interface PoolPlayer {
  gamerTag?: string;
  prefix?: string;
  entrantId?: number;
  scores: PoolPlayerScore[];
  isEliminated: boolean;
  isDisabled: boolean;
}

export interface PoolState {
  songs?: string[];
  players?: PoolPlayer[];
}

/**
 * Event state properties that are unique to use at Project Storm
 */
interface TournamentState {
  lobbyConnection?: {
    code?: string;
    password?: string;
  };
  poolState?: PoolState;
  machineCodeCab1?: string;
  machineCodeCab2?: string;
  chartLeaderboard?: string;
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
    addCab(state, action: PayloadAction<string>) {
      const newCab: CabInfo = {
        id: nanoid(5),
        name: action.payload,
        activeMatch: null,
      };
      state.cabs[newCab.id] = newCab;
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
      action: PayloadAction<{ id: string; value: string; label: string }>,
    ) {
      state.obsLabels[action.payload.id] = {
        label: action.payload.label,
        value: action.payload.value,
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
      state.tournament.chartLeaderboard = action.payload;
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
