import { create } from "zustand";
import { Match } from "../../obs-sources/lobby.types";
import {
  SYNCSTART_PORT,
  SYNCSTART_URL,
} from "../../obs-sources/syncstart-connection";

interface MatchLogState {
  matches: Match[];
  error: string | null;
  lastUpdated: Date | null;
  fetchMatches(this: void): Promise<void>;
  addMatch(this: void, match: Match): void;
}

export const useMatchLogStore = create<MatchLogState>((set) => ({
  matches: [],
  error: null,
  lastUpdated: null,
  async fetchMatches() {
    set({ error: null });
    try {
      const res = await fetch(
        `http://${SYNCSTART_URL}:${SYNCSTART_PORT}/match/list`,
      );
      const data: Match[] = await res.json();
      set({ matches: data, lastUpdated: new Date() });
    } catch {
      set({ error: "Failed to load match log." });
    }
  },
  addMatch(match) {
    set((prev) => ({
      matches: [match, ...prev.matches],
      lastUpdated: new Date(),
    }));
  },
}));
