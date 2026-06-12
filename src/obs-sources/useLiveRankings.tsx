import { useEffect, useState } from "react";
import { LobbyStatePayload } from "./lobby.types";
import { SYNCSTART_PORT, SYNCSTART_URL } from "./syncstart-connection";

export function useLiveRankings({
  name,
  code,
  password,
}: {
  name: string;
  code: string;
  password?: string;
}): LobbyStatePayload | null {
  const [gameState, setGameState] = useState<LobbyStatePayload | null>(null);

  useEffect(() => {
    if (!code) {
      setGameState(null);
      return;
    }

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
