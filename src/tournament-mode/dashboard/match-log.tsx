import { Button, Card, H3, H4 } from "@blueprintjs/core";
import { Edit, Locate, Refresh } from "@blueprintjs/icons";
import { useEffect } from "react";
import { Match, PlayerScore, ServerMessage } from "../../obs-sources/lobby.types";
import {
  SYNCSTART_PORT,
  SYNCSTART_URL,
} from "../../obs-sources/syncstart-connection";
import { useMatchLogStore } from "./match-log.store";
import styles from "./match-log.css";

export function formatRatio(numerator: number | null, total: number | null) {
  if (numerator == null || total == null) return "-";
  return `${numerator}/${total}`;
}

export function MatchLog({
  onScoreSelected,
  onLabelEdit,
}: {
  onScoreSelected?: (score: PlayerScore) => void;
  onLabelEdit?: (match: Match) => void;
}) {
  const matches = useMatchLogStore((s) => s.matches);
  const error = useMatchLogStore((s) => s.error);
  const lastUpdated = useMatchLogStore((s) => s.lastUpdated);
  const fetchMatches = useMatchLogStore((s) => s.fetchMatches);
  const addMatch = useMatchLogStore((s) => s.addMatch);
  const patchMatch = useMatchLogStore((s) => s.patchMatch);

  useEffect(() => {
    fetchMatches();
  }, [fetchMatches]);

  useEffect(() => {
    const socket = new WebSocket(`ws://${SYNCSTART_URL}:${SYNCSTART_PORT}`);

    socket.addEventListener("message", (ev) => {
      try {
        const message: ServerMessage = JSON.parse(ev.data);
        if (message.event === "matchLogged") {
          addMatch(message.data);
        } else if (message.event === "matchUpdated") {
          patchMatch(message.data);
        }
      } catch {
        // ignore malformed messages
      }
    });

    return () => socket.close();
  }, [addMatch, patchMatch]);

  const totalScores = matches.reduce(
    (sum, match) => sum + match.scores.length,
    0,
  );

  return (
    <section className={styles.container}>
      <H3>
        Match Log{" "}
        <Button icon={<Refresh />} onClick={fetchMatches} />
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
        <MatchCard
          key={match.id}
          match={match}
          onScoreSelected={onScoreSelected}
          onLabelEdit={onLabelEdit}
        />
      ))}
    </section>
  );
}

function MatchCard({
  match,
  onScoreSelected,
  onLabelEdit,
}: {
  match: Match;
  onScoreSelected?: (score: PlayerScore) => void;
  onLabelEdit?: (match: Match) => void;
}) {
  const date = new Date(match.dateAdded).toLocaleString();
  const sortedScores = [...match.scores].sort(
    (a, b) => (b.exScore ?? -1) - (a.exScore ?? -1),
  );

  return (
    <Card className={styles.matchCard}>
      <div className={styles.matchHeader}>
        <H4>{match.songTitle}</H4>
        <div style={{ textAlign: "right" }}>
          <div className={styles.matchLabel}>
            <b>{match.label ?? `Match ${match.id}`}</b>
            {onLabelEdit && (
              <Button
                icon={<Edit />}
                style={{ height: "1.25em", minHeight: "unset", padding: 0, lineHeight: 1 }}
                onClick={() => onLabelEdit(match)}
              />
            )}
          </div>
          <div>{match.lobbyCode} &mdash; {date}</div>
        </div>
      </div>
      <table className={styles.scoreTable}>
        <thead>
          <tr>
            <th className={styles.playerNameCell}>Player</th>
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
              key={score.id}
              className={!score.isValid ? styles.invalidRow : undefined}
            >
              <td>
                {onScoreSelected && (
                  <Button
                    icon={<Locate />}
                    onClick={() => onScoreSelected(score)}
                  />
                )}{" "}
                {score.profileName}
              </td>
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
