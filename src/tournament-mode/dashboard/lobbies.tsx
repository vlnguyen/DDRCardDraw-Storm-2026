import { Button, Card, H3, H4 } from "@blueprintjs/core";
import { Refresh } from "@blueprintjs/icons";
import { useEffect, useState } from "react";
import { Lobby, Player } from "../../obs-sources/lobby.types";
import { useLiveRankings } from "../../obs-sources/useLiveRankings";
import {
  SYNCSTART_PORT,
  SYNCSTART_URL,
} from "../../obs-sources/syncstart-connection";
import { formatRatio } from "./match-log";
import matchLogStyles from "./match-log.css";
import styles from "./lobbies.css";

export function Lobbies() {
  const [selectedLobby, setSelectedLobby] = useState<Lobby | null>(null);

  const [lobbies, setLobbies] = useState<Lobby[]>([]);
  const [error, setError] = useState<string | null>(null);

  const gameState = useLiveRankings({
    name: "Stream Dashboard",
    code: selectedLobby?.code ?? "",
    password: selectedLobby?.password,
  });

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
    const isActive = lobby.code === selectedLobby?.code;
    setSelectedLobby(isActive ? null : lobby);
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
            const isActive = lobby.code === selectedLobby?.code;

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
        {gameState?.songInfo && (
          <p>
            {gameState.songInfo.title}
            {gameState.songInfo.artist && ` - ${gameState.songInfo.artist}`}
          </p>
        )}
        {groupPlayersByMachine(gameState?.players).map(
          ({ socketId, players }) => (
            <MachineStateCard
              key={socketId}
              socketId={socketId}
              players={players}
            />
          ),
        )}
      </section>
    </div>
  );
}

interface MachinePlayers {
  socketId: string;
  players: Player[];
}

function groupPlayersByMachine(
  players: Player[] | undefined,
): MachinePlayers[] {
  if (!players) return [];
  const machines = new Map<string, Map<string, Player>>();
  for (const player of players) {
    const socketId = player.socketId ?? "";
    let byPlayerId = machines.get(socketId);
    if (!byPlayerId) {
      byPlayerId = new Map();
      machines.set(socketId, byPlayerId);
    }
    byPlayerId.set(player.playerId, player);
  }
  return [...machines.entries()].map(([socketId, byPlayerId]) => ({
    socketId,
    players: [...byPlayerId.values()],
  }));
}

function MachineStateCard({ socketId, players }: MachinePlayers) {
  return (
    <Card className={matchLogStyles.matchCard}>
      <div className={matchLogStyles.matchHeader}>
        <H4>Machine {socketId}</H4>
        {players[0]?.screenName && <span>{players[0].screenName}</span>}
      </div>
      <table className={matchLogStyles.scoreTable}>
        <thead>
          <tr>
            <th className={styles.playerNameCell}>Player</th>
            <th className={matchLogStyles.numericCell}>EX%</th>
            <th
              className={`${matchLogStyles.numericCell} ${matchLogStyles.fantasticPlus}`}
            >
              FA+
            </th>
            <th
              className={`${matchLogStyles.numericCell} ${matchLogStyles.fantastic}`}
            >
              FA
            </th>
            <th
              className={`${matchLogStyles.numericCell} ${matchLogStyles.excellent}`}
            >
              EXC
            </th>
            <th
              className={`${matchLogStyles.numericCell} ${matchLogStyles.great}`}
            >
              Great
            </th>
            <th
              className={`${matchLogStyles.numericCell} ${matchLogStyles.decent}`}
            >
              Decent
            </th>
            <th
              className={`${matchLogStyles.numericCell} ${matchLogStyles.wayOff}`}
            >
              W/O
            </th>
            <th
              className={`${matchLogStyles.numericCell} ${matchLogStyles.miss}`}
            >
              Miss
            </th>
            <th className={matchLogStyles.numericCell}>Mines</th>
            <th className={matchLogStyles.numericCell}>Holds</th>
            <th className={matchLogStyles.numericCell}>Rolls</th>
          </tr>
        </thead>
        <tbody>
          {(["P1", "P2"] as const).map((playerId) => {
            const player = players.find((p) => p.playerId === playerId);
            const judgments = player?.judgments;
            const emoji = playerId === "P1" ? "1️⃣" : "2️⃣";
            return (
              <tr key={playerId}>
                <td className={styles.playerNameCell}>
                  {emoji} {player?.profileName ?? "-"}
                </td>
                <td className={matchLogStyles.numericCell}>
                  {player?.exScore != null
                    ? Number(player.exScore / 100).toLocaleString(undefined, {
                        style: "percent",
                        minimumFractionDigits: 2,
                      })
                    : "-"}
                </td>
                <td
                  className={`${matchLogStyles.numericCell} ${matchLogStyles.fantasticPlus}`}
                >
                  {judgments?.fantasticPlus ?? "-"}
                </td>
                <td
                  className={`${matchLogStyles.numericCell} ${matchLogStyles.fantastic}`}
                >
                  {judgments?.fantastics ?? "-"}
                </td>
                <td
                  className={`${matchLogStyles.numericCell} ${matchLogStyles.excellent}`}
                >
                  {judgments?.excellents ?? "-"}
                </td>
                <td
                  className={`${matchLogStyles.numericCell} ${matchLogStyles.great}`}
                >
                  {judgments?.greats ?? "-"}
                </td>
                <td
                  className={`${matchLogStyles.numericCell} ${matchLogStyles.decent}`}
                >
                  {judgments?.decents ?? "-"}
                </td>
                <td
                  className={`${matchLogStyles.numericCell} ${matchLogStyles.wayOff}`}
                >
                  {judgments?.wayOffs ?? "-"}
                </td>
                <td
                  className={`${matchLogStyles.numericCell} ${matchLogStyles.miss}`}
                >
                  {judgments?.misses ?? "-"}
                </td>
                <td className={matchLogStyles.numericCell}>
                  {formatRatio(
                    judgments
                      ? judgments.totalMines - judgments.minesHit
                      : null,
                    judgments?.totalMines ?? null,
                  )}
                </td>
                <td className={matchLogStyles.numericCell}>
                  {formatRatio(
                    judgments?.holdsHeld ?? null,
                    judgments?.totalHolds ?? null,
                  )}
                </td>
                <td className={matchLogStyles.numericCell}>
                  {formatRatio(
                    judgments?.rollsHeld ?? null,
                    judgments?.totalRolls ?? null,
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </Card>
  );
}
