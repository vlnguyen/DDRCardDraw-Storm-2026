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

function formatName(player: PoolPlayer): string {
  if (!player.gamerTag) return "--";
  return player.prefix
    ? `${player.gamerTag} [${player.prefix}]`
    : player.gamerTag;
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

export function Pools() {
  const poolPlayers =
    useAppState((s) => s.event.tournament?.poolState?.players) ?? [];
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
            <th>
              <h3>Players</h3>
            </th>
          </tr>
        </thead>
        <tbody>
          {poolPlayersResults.map((player, poolPlayerResultIndex) => {
            return (
              <tr key={poolPlayerResultIndex}>
                <td>{formatName(player)}</td>
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
          {Array.from({ length: numSongs }).map((_, index) => (
            <th key={index}>
              <h3>Song {index + 1}</h3>
            </th>
          ))}
          <th>Wins</th>
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
              <td>
                {medal}{" "}
                <b>
                  {rank}. {formatName(player)}
                </b>
              </td>
              {scores.map((score, scoreIndex) => (
                <td key={scoreIndex}>
                  {getDisplayScore(score.exScore ?? 0)}
                  {wins[scoreIndex] > 0 && ` (+${wins[scoreIndex]})`}
                </td>
              ))}
              <td>
                <b>{wins.reduce(sum, 0)} wins</b> (
                <i>Avg. {getDisplayScore(averageEx)}</i>)
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
