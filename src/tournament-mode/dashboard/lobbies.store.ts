import { create } from "zustand";
import { Lobby } from "../../obs-sources/lobby.types";
import {
  SYNCSTART_PORT,
  SYNCSTART_URL,
} from "../../obs-sources/syncstart-connection";

interface LobbiesState {
  lobbies: Lobby[];
  error: string | null;
  fetchLobbies(this: void): Promise<void>;
  addLobby(this: void, lobby: Lobby): void;
  updateLobby(this: void, lobby: Lobby): void;
  removeLobby(this: void, code: string): void;
}

export const useLobbiesStore = create<LobbiesState>((set) => ({
  lobbies: [],
  error: null,
  async fetchLobbies() {
    set({ error: null });
    try {
      const res = await fetch(
        `http://${SYNCSTART_URL}:${SYNCSTART_PORT}/lobby/list`,
      );
      const data: Lobby[] = await res.json();
      set({ lobbies: data });
    } catch {
      set({ error: "Failed to load lobby list." });
    }
  },
  addLobby(lobby) {
    set((prev) => ({
      lobbies: [...prev.lobbies.filter((l) => l.code !== lobby.code), lobby],
    }));
  },
  updateLobby(lobby) {
    set((prev) => ({
      lobbies: prev.lobbies.map((l) => (l.code === lobby.code ? lobby : l)),
    }));
  },
  removeLobby(code) {
    set((prev) => ({
      lobbies: prev.lobbies.filter((l) => l.code !== code),
    }));
  },
}));
