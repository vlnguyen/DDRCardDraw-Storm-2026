import { Flipped, Flipper } from "react-flip-toolkit";
import { Player } from "./lobby.types";
import { useLiveRankings } from "./useLiveRankings";
import styles from "./lobby.css";

export function LiveRankings() {
  const gameState = useLiveRankings("OBS Live Rankings");

  return <Ranking players={gameState?.players} />;
}

function Ranking({ players }: { players?: Array<Player> }) {
  if (!players || players.length === 0) return null;

  return (
    <Flipper flipKey={players.map((p) => p.profileName).join("")}>
      <ul className={styles.list}>
        {players.map((p, i) => (
          <Flipped key={p.profileName} flipId={p.profileName}>
            <li>
              <div className={styles.row}>
                <div className={styles.rankOrdinal}>
                  {p.exScore !== undefined && `${i + 1}.`} {p.profileName}
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
        ))}
      </ul>
    </Flipper>
  );
}
