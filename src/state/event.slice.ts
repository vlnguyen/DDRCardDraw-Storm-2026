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

export type CardDrawPhase = "pools" | "de";

export interface LowerThirdState {
  title: string;
  line1: string;
  line2: string;
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
  cardDrawPhase?: CardDrawPhase;
  lowerThird?: LowerThirdState;
  toggleLowerThird?: boolean;
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
    setPoolSongs(state, action: PayloadAction<string[]>) {
      if (!state.tournament.poolState) {
        state.tournament.poolState = {};
      }
      state.tournament.poolState.songs = action.payload;
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
