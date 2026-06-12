import { useEffect, useState } from "react";
import { useAppState } from "../state/store";
import { LobbyStatePayload } from "./lobby.types";

const DEFAULT_LOBBY_CONNECTION = {
  url: "syncservice.groovestats.com",
  port: 1337,
  code: "ERGK",
  password: "YYZ",
};

export function useLiveRankings(
  name = "DDRCardDraw Spectator",
): LobbyStatePayload | null {
  const lobbyConnection = useAppState(
    (s) => s.event.tournament?.lobbyConnection,
  );

  const url = lobbyConnection?.url ?? DEFAULT_LOBBY_CONNECTION.url;
  const port = lobbyConnection?.port ?? DEFAULT_LOBBY_CONNECTION.port;
  const code = lobbyConnection?.code ?? DEFAULT_LOBBY_CONNECTION.code;
  const password = lobbyConnection?.password ?? DEFAULT_LOBBY_CONNECTION.password;

  const [gameState, setGameState] = useState<LobbyStatePayload | null>(null);

  useEffect(() => {
    const socket = new WebSocket(`ws://${url}:${port}`);

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
  }, [url, port, code, password, name]);

  return gameState;
}
