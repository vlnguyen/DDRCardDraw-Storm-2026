import { Button, Card, H3, H4 } from "@blueprintjs/core";
import { Refresh } from "@blueprintjs/icons";
import { useEffect, useState } from "react";
import { Lobby, Player } from "../../obs-sources/lobby.types";
import { useLiveRankings } from "../../obs-sources/useLiveRankings";
import {
  SYNCSTART_PORT,
  SYNCSTART_URL,
} from "../../obs-sources/syncstart-connection";
import { eventSlice } from "../../state/event.slice";
import { useAppDispatch, useAppState } from "../../state/store";
import styles from "./lobbies.css";

export function Lobbies() {
  const lobbyConnection = useAppState(
    (s) => s.event.tournament?.lobbyConnection,
  );
  const dispatch = useAppDispatch();
  const gameState = useLiveRankings("Stream Dashboard");

  const [lobbies, setLobbies] = useState<Lobby[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchLobbies = () => {
    setError(null);
    fetch(`http://${SYNCSTART_URL}:${SYNCSTART_PORT}/lobby/list`)
      .then((res) => res.json())
      .then((data: Lobby[]) => setLobbies(data))
      .catch(() => setError("Failed to load lobby list."));
  };

  useEffect(() => {
    fetchLobbies();
  }, []);

  useEffect(() => {
    const socket = new WebSocket(`ws://${SYNCSTART_URL}:${SYNCSTART_PORT}`);

    socket.addEventListener("message", (ev) => {
      try {
        const message = JSON.parse(ev.data);
        switch (message.event) {
          case "lobbyAdded": {
            const lobby: Lobby = message.data;
            setLobbies((prev) => [
              ...prev.filter((l) => l.code !== lobby.code),
              lobby,
            ]);
            break;
          }
          case "lobbyUpdated": {
            const lobby: Lobby = message.data;
            setLobbies((prev) =>
              prev.map((l) => (l.code === lobby.code ? lobby : l)),
            );
            break;
          }
          case "lobbyRemoved": {
            const { code }: { code: string } = message.data;
            setLobbies((prev) => prev.filter((l) => l.code !== code));
            break;
          }
        }
      } catch {
        // ignore malformed messages
      }
    });

    return () => {
      socket.close();
    };
  }, []);

  const toggleSpectateLobby = (lobby: Lobby) => {
    const isActive = lobby.code === lobbyConnection?.code;
    dispatch(
      eventSlice.actions.updateLobbyConnection(
        isActive
          ? { code: "", password: "" }
          : { code: lobby.code, password: lobby.password },
      ),
    );
  };

  return (
    <div className={styles.lobbies}>
      <section className={styles.lobbyList}>
        <H3>
          Lobbies{" "}
          <Button icon={<Refresh />} onClick={fetchLobbies} variant="minimal" />
        </H3>
        {error && <p>{error}</p>}
        <div className={styles.lobbyCards}>
          {lobbies.map((lobby) => {
            const players = Object.values(lobby.machines).flatMap(
              (machine) =>
                [machine.player1, machine.player2].filter(
                  (player): player is Player => player !== undefined,
                ),
            );
            const spectators = Object.values(lobby.spectators);
            const songLabel = lobby.songInfo
              ? `${lobby.songInfo.title}${
                  lobby.songInfo.artist ? ` - ${lobby.songInfo.artist}` : ""
                }`
              : "---";
            const isActive = lobby.code === lobbyConnection?.code;

            return (
              <Card
                key={lobby.code}
                className={isActive ? styles.activeCard : undefined}
                interactive
                onClick={() => toggleSpectateLobby(lobby)}
              >
                <H4>{lobby.code}</H4>
                <p>Song: {songLabel}</p>
                {players.length > 0 && (
                  <>
                    <p>Players</p>
                    <ul className={styles.playerList}>
                      {players.map((player) => (
                        <li key={player.playerId}>{player.profileName}</li>
                      ))}
                    </ul>
                  </>
                )}
                {spectators.length > 0 && (
                  <>
                    <p>Spectators</p>
                    <ul className={styles.playerList}>
                      {spectators.map((spectator, i) => (
                        <li key={spectator.socketId ?? i}>
                          {spectator.profileName}
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </Card>
            );
          })}
        </div>
      </section>
      <section className={styles.lobbyState}>
        <H3>Lobby State</H3>
        {gameState && <pre>{JSON.stringify(gameState, null, 2)}</pre>}
      </section>
    </div>
  );
}
