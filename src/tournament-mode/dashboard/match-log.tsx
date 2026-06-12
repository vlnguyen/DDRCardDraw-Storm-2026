import { Button, Card, H3, H4 } from "@blueprintjs/core";
import { Refresh } from "@blueprintjs/icons";
import { useEffect, useState } from "react";
import { Match } from "../../obs-sources/lobby.types";
import {
  SYNCSTART_PORT,
  SYNCSTART_URL,
} from "../../obs-sources/syncstart-connection";
import styles from "./match-log.css";

export function formatRatio(numerator: number | null, total: number | null) {
  if (numerator == null || total == null) return "-";
  return `${numerator}/${total}`;
}

export function MatchLog() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchMatches = () => {
    setError(null);
    fetch(`http://${SYNCSTART_URL}:${SYNCSTART_PORT}/match/list`)
      .then((res) => res.json())
      .then((data: Match[]) => {
        setMatches(data);
        setLastUpdated(new Date());
      })
      .catch(() => setError("Failed to load match log."));
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  useEffect(() => {
    const socket = new WebSocket(`ws://${SYNCSTART_URL}:${SYNCSTART_PORT}`);

    socket.addEventListener("message", (ev) => {
      try {
        const message = JSON.parse(ev.data);
        if (message.event === "matchLogged") {
          const match: Match = message.data;
          setMatches((prev) => [match, ...prev]);
          setLastUpdated(new Date());
        }
      } catch {
        // ignore malformed messages
      }
    });

    return () => {
      socket.close();
    };
  }, []);

  const totalScores = matches.reduce(
    (sum, match) => sum + match.scores.length,
    0,
  );

  return (
    <section className={styles.container}>
      <H3>
        Match Log{" "}
        <Button icon={<Refresh />} onClick={fetchMatches} variant="minimal" />
      </H3>
      {lastUpdated && (
        <p className={styles.refreshInfo}>
          Last updated: {lastUpdated.toLocaleString()}
          <br />
          Received {matches.length} matches and {totalScores} scores.
        </p>
      )}
      {error && <p>{error}</p>}
      {matches.map((match) => (
        <MatchCard key={match.id} match={match} />
      ))}
    </section>
  );
}

function MatchCard({ match }: { match: Match }) {
  const date = new Date(match.dateAdded).toLocaleString();
  const sortedScores = [...match.scores].sort(
    (a, b) => (b.exScore ?? -1) - (a.exScore ?? -1),
  );

  return (
    <Card className={styles.matchCard}>
      <div className={styles.matchHeader}>
        <H4>
          {match.lobbyCode} &mdash; {date}
        </H4>
        {match.songTitle && (
          <span>
            {match.songTitle}
            {match.songArtist && ` - ${match.songArtist}`}
          </span>
        )}
      </div>
      <table className={styles.scoreTable}>
        <thead>
          <tr>
            <th>Player</th>
            <th className={styles.numericCell}>EX%</th>
            <th className={`${styles.numericCell} ${styles.fantasticPlus}`}>
              FA+
            </th>
            <th className={`${styles.numericCell} ${styles.fantastic}`}>
              FA
            </th>
            <th className={`${styles.numericCell} ${styles.excellent}`}>
              EXC
            </th>
            <th className={`${styles.numericCell} ${styles.great}`}>
              Great
            </th>
            <th className={`${styles.numericCell} ${styles.decent}`}>
              Decent
            </th>
            <th className={`${styles.numericCell} ${styles.wayOff}`}>
              W/O
            </th>
            <th className={`${styles.numericCell} ${styles.miss}`}>Miss</th>
            <th className={styles.numericCell}>Mines</th>
            <th className={styles.numericCell}>Holds</th>
            <th className={styles.numericCell}>Rolls</th>
          </tr>
        </thead>
        <tbody>
          {sortedScores.map((score) => (
            <tr
              key={score.playerId}
              className={!score.isValid ? styles.invalidRow : undefined}
            >
              <td>{score.profileName}</td>
              <td className={styles.numericCell}>
                {score.exScore != null
                  ? Number(score.exScore / 100).toLocaleString(undefined, {
                      style: "percent",
                      minimumFractionDigits: 2,
                    })
                  : "-"}
              </td>
              <td className={`${styles.numericCell} ${styles.fantasticPlus}`}>
                {score.fantasticPlus ?? "-"}
              </td>
              <td className={`${styles.numericCell} ${styles.fantastic}`}>
                {score.fantastics ?? "-"}
              </td>
              <td className={`${styles.numericCell} ${styles.excellent}`}>
                {score.excellents ?? "-"}
              </td>
              <td className={`${styles.numericCell} ${styles.great}`}>
                {score.greats ?? "-"}
              </td>
              <td className={`${styles.numericCell} ${styles.decent}`}>
                {score.decents ?? "-"}
              </td>
              <td className={`${styles.numericCell} ${styles.wayOff}`}>
                {score.wayOffs ?? "-"}
              </td>
              <td className={`${styles.numericCell} ${styles.miss}`}>
                {score.misses ?? "-"}
              </td>
              <td className={styles.numericCell}>
                {formatRatio(
                  score.minesHit != null && match.totalMines != null
                    ? match.totalMines - score.minesHit
                    : null,
                  match.totalMines,
                )}
              </td>
              <td className={styles.numericCell}>
                {formatRatio(score.holdsHeld, match.totalHolds)}
              </td>
              <td className={styles.numericCell}>
                {formatRatio(score.rollsHeld, match.totalRolls)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
