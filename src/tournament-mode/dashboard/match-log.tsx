import { Button, Card, Checkbox, H3, H4 } from "@blueprintjs/core";
import { Download, Edit, Locate, Refresh } from "@blueprintjs/icons";
import { useEffect, useMemo, useState } from "react";
import { Match, PlayerScore, ServerMessage } from "../../obs-sources/lobby.types";
import {
  SYNCSTART_PORT,
  SYNCSTART_URL,
} from "../../obs-sources/syncstart-connection";
import { formatTimeAgo, useCurrentTime } from "../../hooks/useCurrentTime";
import { useMatchLogStore } from "./match-log.store";
import {
  exportMatchLogCsv,
  exportMatchLogJson,
  isLabelledMatch,
} from "./match-log-export";
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
  const [labelledOnly, setLabelledOnly] = useState(false);
  // ticks once/sec purely to keep the "time ago" text below live
  useCurrentTime();

  const displayedMatches = useMemo(
    () => (labelledOnly ? matches.filter(isLabelledMatch) : matches),
    [matches, labelledOnly],
  );

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

  const totalScores = displayedMatches.reduce(
    (sum, match) => sum + match.scores.length,
    0,
  );

  return (
    <section className={styles.container}>
      <H3>
        Match Log{" "}
        <Button icon={<Refresh />} onClick={fetchMatches} />
      </H3>
      <div className={styles.exportControls}>
        <Checkbox
          checked={labelledOnly}
          label="Labelled matches only"
          onChange={(e) => setLabelledOnly(e.currentTarget.checked)}
        />
        <Button
          icon={<Download />}
          text="Export Log (.json)"
          disabled={displayedMatches.length === 0}
          onClick={() => exportMatchLogJson(displayedMatches)}
        />
        <Button
          icon={<Download />}
          text="Export Log (.csv)"
          disabled={displayedMatches.length === 0}
          onClick={() => exportMatchLogCsv(displayedMatches)}
        />
      </div>
      {lastUpdated && (
        <p className={styles.refreshInfo}>
          Last updated: {lastUpdated.toLocaleString()} (
          {formatTimeAgo(lastUpdated)})
          <br />
          Received {displayedMatches.length} matches and {totalScores} scores.
        </p>
      )}
      {error && <p>{error}</p>}
      {displayedMatches.map((match) => (
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
  const timeAgo = formatTimeAgo(match.dateAdded);
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
          <div>
            {match.lobbyCode} &mdash; {date} ({timeAgo})
          </div>
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
