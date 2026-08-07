import { Flipped, Flipper } from "react-flip-toolkit";
import { useAppState } from "../state/store";
import { Player } from "./lobby.types";
import { useLiveRankings } from "./useLiveRankings";
import { findEntrant } from "./pool-history";
import { entrantsMap, SEED_UNSEEDED } from "../assets/entrants/entrantsMap";
import styles from "./lobby.css";

function seedForProfileName(profileName: string): number | null {
  const entrant = findEntrant(profileName);
  if (!entrant) return null;
  const seed = entrantsMap[entrant.id]?.seed ?? null;
  return seed != null && seed !== SEED_UNSEEDED ? seed : null;
}

export function LiveRankings() {
  const lobbyConnection = useAppState(
    (s) => s.event.tournament?.lobbyConnection,
  );
  const gameState = useLiveRankings({
    name: "OBS Live Rankings",
    code: lobbyConnection?.code ?? "",
    password: lobbyConnection?.password,
  });

  return (
    <div className={styles.canvas}>
      <Ranking players={gameState?.players} />
    </div>
  );
}

/** Standard competition ranking (1, 1, 3, 4, ...): players tied on exScore
 * share the best rank between them, and ranking resumes at the position
 * after the tied group rather than continuing consecutively. Players
 * without an exScore yet are left unranked. */
function computeRanks(players: Player[]): Map<string, number> {
  const ranked = players
    .filter((p) => p.exScore !== undefined)
    .slice()
    .sort((a, b) => b.exScore! - a.exScore!);

  const ranks = new Map<string, number>();
  let lastScore: number | null = null;
  let lastRank = 0;
  ranked.forEach((p, i) => {
    if (lastScore === null || p.exScore !== lastScore) {
      lastRank = i + 1;
      lastScore = p.exScore!;
    }
    ranks.set(p.profileName, lastRank);
  });
  return ranks;
}

function Ranking({ players }: { players?: Player[] }) {
  if (!players || players.length === 0) return null;

  const ranks = computeRanks(players);

  return (
    <Flipper flipKey={players.map((p) => p.profileName).join("")}>
      <ul className={styles.list}>
        {players.map((p) => {
          const rank = ranks.get(p.profileName);
          const seed = seedForProfileName(p.profileName);
          return (
            <Flipped key={p.profileName} flipId={p.profileName}>
              <li>
                <div className={styles.row}>
                  <div className={styles.rankOrdinal}>
                    <span
                      className={styles.rank}
                      style={{ visibility: rank !== undefined ? "visible" : "hidden" }}
                    >
                      {rank ?? 0}.{" "}
                    </span>
                    {p.profileName}
                    {seed != null && (
                      <sub className={styles.seed}>{seed}</sub>
                    )}
                  </div>
                  <div className={styles.rankOrdinal}>
                    {p.exScore !== undefined &&
                      Number(p.exScore / 100).toLocaleString(undefined, {
                        style: "percent",
                        minimumFractionDigits: 2,
                      })}
                  </div>
                </div>
              </li>
            </Flipped>
          );
        })}
      </ul>
    </Flipper>
  );
}
