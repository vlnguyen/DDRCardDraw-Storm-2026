import type { CardDrawPhase } from "../state/event.slice";
import { useAppState } from "../state/store";
import styles from "./rules.css";

interface Ruleset {
  title: string;
  rules: string[];
}

const RULES_BY_PHASE: Partial<Record<CardDrawPhase, Ruleset>> = {
  "pools-6-lower": {
    title: "Rules (Stage 1-4)",
    rules: [
      "Pad preference assigned in seed order",
      "Draw 6 charts from Base + Lower, +1 additional chart for each player",
      "One veto per player in reverse seed order",
      "Songs are played in display order",
      "Players receive +1 win for each player they beat or tie on each song",
      "Ties in points are broken by avg. EX%, then by single song draw",
      "Top 1 player advances to the next stage",
    ],
  },
  "pools-6-upper": {
    title: "Rules (Stage 5-6)",
    rules: [
      "Pad preference assigned in seed order",
      "Draw 6 charts from Base + Upper, +1 additional chart for each player",
      "One veto per player in reverse seed order",
      "Songs are played in display order",
      "Players receive +1 win for each player they beat or tie on each song",
      "Ties in points are broken by avg. EX%, then by single song draw",
      "Top 2 players advance to the next stage",
    ],
  },
  "pools-4": {
    title: "Rules (Women/NB)",
    rules: [
      "Pad preference assigned in seed order",
      "Draw 4 charts, +1 additional chart for each player",
      "One veto per player in reverse seed order",
      "Songs are played in display order",
      "Players receive +1 win for each player they beat or tie on each song",
      "Ties in points are broken by avg. EX%, then by single song draw",
      "Top 1 player advances to the next stage",
      "Winner of the final stage is the tournament champion",
    ],
  },
  "pools-6-final": {
    title: "Rules (Stage 7, Top 8 Qualifier)",
    rules: [
      "Pad preference assigned in seed order",
      "Draw 6 charts from Base + Upper, +1 additional chart for each player",
      "One veto per player in reverse seed order",
      "Songs are played in display order",
      "Players receive +1 win for each player they beat or tie on each song",
      "Ties in points are broken by avg. EX%, then by single song draw",
      "Top 2 players advance to Top 8, 1st in Winner's, 2nd in Loser's",
    ],
  },
  "de-bo3": {
    title: "Rules (Best of 3)",
    rules: [
      "Draw 5 charts from Base + Upper",
      "Higher seed gets priority between pad side, protect order, or veto order",
      "Each player protects one song, then each player vetoes one song",
      "Songs are played in protect order",
      "2 points to win, neither player receives a point in the event of a tie",
      "Tiebreaker determined by single song draw until tie is broken",
    ],
  },
  "de-bo5": {
    title: "Rules (Best of 5)",
    rules: [
      "Draw 7 charts from Base + Upper",
      "Higher seed gets priority between pad side or protect order",
      "One round of protects, then vetoes, then protects are done in ABBAAB order",
      "1st protect is played first",
      "Loser of the previous song gets to play their next protect.",
      "3 points to win, neither player receives a point in the event of a tie",
      "Tiebreaker determined by single song draw until tie is broken",
    ],
  },
};

export function Rules() {
  const phase = useAppState((s) => s.event.tournament?.cardDrawPhase);
  const ruleset = phase ? RULES_BY_PHASE[phase] : undefined;

  return (
    <div className={styles.canvas}>
      {ruleset && (
        <div className={styles.content}>
          <h1 className={styles.title}>{ruleset.title}</h1>
          <ul className={styles.rulesList}>
            {ruleset.rules.map((rule, i) => (
              <li key={i} className={styles.rule}>
                {rule}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
