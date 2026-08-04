import { useMemo } from "react";
import { PoolPlayer } from "../state/event.slice";
import { useAppState } from "../state/store";

import styles from "./pools.css";

interface PoolPlayerResult extends PoolPlayer {
  wins: number[];
  rank: number;
  averageEx: number;
}

function sum(prevSum: number, currentValue: number): number {
  return prevSum + currentValue;
}

function getRankClassName(rank: number): string {
  switch (rank) {
    case 1:
      return `${styles.rank} ${styles.rankFirst}`;
    case 2:
      return `${styles.rank} ${styles.rankSecond}`;
    case 3:
      return `${styles.rank} ${styles.rankThird}`;
    default:
      return styles.rank;
  }
}

function PlayerName({
  player,
  medal,
}: {
  player: PoolPlayer;
  medal?: string | null;
}) {
  if (!player.gamerTag) return <>--</>;
  return (
    <>
      <span className={styles.gamerTag}>{player.gamerTag}</span> {medal}
      {player.prefix && (
        <div className={styles.prefix}>{player.prefix}</div>
      )}
    </>
  );
}

function getPoolPlayersResults(poolPlayers: PoolPlayer[]): PoolPlayerResult[] {
  const numSongs = poolPlayers[0]?.scores.length ?? 0;
  const poolPlayersResults: PoolPlayerResult[] = poolPlayers
    .filter((poolPlayer) => !poolPlayer.isDisabled)
    .map((poolPlayer) => {
      const scoresSum = poolPlayer.scores.reduce(
        (sum, score) => sum + (score.exScore ?? 0),
        0,
      );
      return {
        ...poolPlayer,
        averageEx: poolPlayer.scores.length
          ? scoresSum / poolPlayer.scores.length
          : 0,
        wins: [],
        rank: 0,
      };
    });

  for (let songIndex = 0; songIndex < numSongs; songIndex++) {
    poolPlayersResults.sort(
      (a, b) =>
        (b.scores[songIndex]?.exScore ?? 0) -
        (a.scores[songIndex]?.exScore ?? 0),
    );
    const allSongScores = poolPlayersResults.reduce(
      (prevScores, currentPoolPlayer) => {
        return [...prevScores, currentPoolPlayer.scores[songIndex]?.exScore ?? 0];
      },
      [] as number[],
    );

    for (
      let playerIndex = 0;
      playerIndex < poolPlayersResults.length;
      playerIndex++
    ) {
      // ties are broken by giving players points for each player they tied with (highest points)
      const wins =
        allSongScores.filter(
          (songScore) =>
            (poolPlayersResults[playerIndex].scores[songIndex]?.exScore ?? 0) >=
            songScore,
          // exclude oneself from their win count
        ).length - 1;
      poolPlayersResults[playerIndex].wins.push(wins);
    }
  }

  poolPlayersResults.sort(
    (a, b) => b.wins.reduce(sum, 0) - a.wins.reduce(sum, 0),
  );

  let currentWinTarget: number | null = null;
  for (
    let poolPlayerResultIndex = 0;
    poolPlayerResultIndex < poolPlayersResults.length;
    poolPlayerResultIndex++
  ) {
    const poolPlayerResult = poolPlayersResults[poolPlayerResultIndex];
    const expectedRank = poolPlayerResultIndex + 1;

    if (currentWinTarget === null) {
      poolPlayerResult.rank = expectedRank;
      currentWinTarget = poolPlayerResult.wins.reduce(sum, 0);
    } else if (currentWinTarget === poolPlayerResult.wins.reduce(sum, 0)) {
      const prevPoolPlayerResult =
        poolPlayersResults[poolPlayerResultIndex - 1];
      poolPlayerResult.rank = prevPoolPlayerResult.rank;
    } else {
      poolPlayerResult.rank = expectedRank;
      currentWinTarget = poolPlayerResult.wins.reduce(sum, 0);
    }
  }

  poolPlayersResults.sort((a, b) => {
    const sortByWins = b.wins.reduce(sum, 0) - a.wins.reduce(sum, 0);
    if (sortByWins !== 0) {
      return sortByWins;
    }
    return b.averageEx - a.averageEx;
  });

  return poolPlayersResults;
}

function getDisplayScore(score: number): string {
  return `${score.toFixed(2)}%`;
}

export function PoolsLive() {
  const poolPlayers =
    useAppState((s) => s.event.tournament?.poolState?.players) ?? [];
  return <Pools poolPlayers={poolPlayers} />;
}

export function Pools({ poolPlayers }: { poolPlayers: PoolPlayer[] }) {
  const numSongs = poolPlayers[0]?.scores.length ?? 0;
  const poolPlayersResults = useMemo(() => {
    return getPoolPlayersResults(poolPlayers);
  }, [poolPlayers]);

  if (poolPlayersResults.length === 0) {
    return null;
  }

  if (numSongs === 0) {
    return (
      <table className={styles.poolsScoresTable}>
        <thead>
          <tr>
            <th className={styles.playersHeader}>
              <h3>Players</h3>
            </th>
          </tr>
        </thead>
        <tbody>
          {poolPlayersResults.map((player, poolPlayerResultIndex) => {
            return (
              <tr key={poolPlayerResultIndex}>
                <td className={styles.playerNameCentered}>
                  <PlayerName player={player} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  }

  return (
    <table className={styles.poolsScoresTable}>
      <thead>
        <tr>
          <th></th>
          <th></th>
          {Array.from({ length: numSongs }).map((_, index) => (
            <th key={index}>
              <h3 className={styles.rank}>
                <span className={styles.squish}>Song {index + 1}</span>
              </h3>
            </th>
          ))}
          <th className={styles.rank}>
            <span className={styles.squish}>Wins</span>
          </th>
        </tr>
      </thead>
      <tbody>
        {poolPlayersResults.map((player, poolPlayerResultIndex) => {
          const { scores, wins, rank, averageEx, isEliminated } = player;
          const medal = ((): string | null => {
            if (isEliminated) {
              return "💀";
            }

            switch (rank) {
              case 1:
                return "🥇";
              case 2:
                return "🥈";
              // only two players advance from pools
              default:
                return null;
            }
          })();

          return (
            <tr key={poolPlayerResultIndex}>
              <td className={getRankClassName(rank)}>
                <b className={styles.squish}>{rank}</b>
              </td>
              <td className={styles.playerName}>
                <b>
                  <PlayerName player={player} medal={medal} />
                </b>
              </td>
              {scores.map((score, scoreIndex) => (
                <td key={scoreIndex}>
                  {getDisplayScore(score.exScore ?? 0)}
                  <div className={styles.avg}>
                    <div>{wins[scoreIndex] > 0 && ` +${wins[scoreIndex]}`}</div>
                  </div>
                </td>
              ))}
              <td>
                <b>{wins.reduce(sum, 0)} wins</b>
                <div className={styles.avg}>
                  <i>Avg. {getDisplayScore(averageEx)}</i>
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
