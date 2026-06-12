import { useEffect, useState } from "react";
import { useAppState } from "../state/store";
import { LobbyStatePayload } from "./lobby.types";
import { SYNCSTART_PORT, SYNCSTART_URL } from "./syncstart-connection";

export const DEFAULT_LOBBY_CONNECTION = {
  code: "ERGK",
  password: "YYZ",
};

export function useLiveRankings(
  name = "DDRCardDraw Spectator",
): LobbyStatePayload | null {
  const lobbyConnection = useAppState(
    (s) => s.event.tournament?.lobbyConnection,
  );

  const code = lobbyConnection?.code ?? DEFAULT_LOBBY_CONNECTION.code;
  const password =
    lobbyConnection?.password ?? DEFAULT_LOBBY_CONNECTION.password;

  const [gameState, setGameState] = useState<LobbyStatePayload | null>(null);

  useEffect(() => {
    const socket = new WebSocket(`ws://${SYNCSTART_URL}:${SYNCSTART_PORT}`);

    socket.addEventListener("open", () => {
      socket.send(
        JSON.stringify({
          event: "spectateLobby",
          data: {
            spectator: { profileName: name },
            code,
            password,
          },
        }),
      );
    });

    socket.addEventListener("message", (ev) => {
      try {
        const message = JSON.parse(ev.data);
        if (message.event === "lobbyState") {
          setGameState(message.data);
        }
      } catch {
        // ignore malformed messages
      }
    });

    socket.addEventListener("error", () => {
      setGameState(null);
    });

    socket.addEventListener("close", () => {
      setGameState(null);
    });

    return () => {
      socket.close();
    };
  }, [code, password, name]);

  return gameState;
}
