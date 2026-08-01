import { useEffect } from "react";
import { Provider as UrqlProvider } from "urql";
import { Spinner } from "@blueprintjs/core";
import {
  phaseGroupIdFromBracketUrl,
  urqlClient,
  useStartggBracket,
} from "../startgg-gql";
import { inferShortname } from "../controls/player-names";
import styles from "./bracket.css";

// TODO (Storm 2026): replace with the actual bracket URL once it exists.
const START_GG_BRACKET_URL =
  "https://www.start.gg/tournament/ceo-2024-6/event/in-the-groove-2-sm5-1/brackets/1583769/2372293";

const REFRESH_INTERVAL_MS = 30_000;

type BracketSet = {
  id?: string | null;
  round?: number | null;
  fullRoundText?: string | null;
  displayScore?: string | null;
  winnerId?: number | null;
  slots?: Array<{
    entrant?: {
      id?: string | null;
      name?: string | null;
      participants?: Array<{
        id?: string | null;
        gamerTag?: string | null;
        prefix?: string | null;
      } | null> | null;
    } | null;
    standing?: {
      stats?: {
        score?: { value?: number | null } | null;
      } | null;
    } | null;
  } | null> | null;
};

function groupByRound(sets: BracketSet[]): Map<number, BracketSet[]> {
  const rounds = new Map<number, BracketSet[]>();
  for (const set of sets) {
    if (set.round == null) continue;
    const existing = rounds.get(set.round);
    if (existing) {
      existing.push(set);
    } else {
      rounds.set(set.round, [set]);
    }
  }
  return rounds;
}

// start.gg reports the Grand Final Reset under the same round number as the
// Grand Final, distinguished only by fullRoundText - split it into its own
// column immediately after the Grand Final so it renders as its own step.
const GRAND_FINAL_RESET_ROUND_OFFSET = 0.5;

function splitOutGrandFinalReset(
  rounds: Map<number, BracketSet[]>,
): Map<number, BracketSet[]> {
  const result = new Map<number, BracketSet[]>();
  for (const [round, roundSets] of rounds) {
    const resets = roundSets.filter((set) => /reset/i.test(set.fullRoundText ?? ""));
    const rest = roundSets.filter((set) => !/reset/i.test(set.fullRoundText ?? ""));
    if (rest.length) {
      result.set(round, rest);
    }
    if (resets.length) {
      result.set(round + GRAND_FINAL_RESET_ROUND_OFFSET, resets);
    }
  }
  return result;
}

function centerPercent(index: number, count: number): number {
  return ((index + 0.5) / count) * 100;
}

function BracketColumn({
  round,
  sets,
  hasNextRound,
}: {
  round: number;
  sets: BracketSet[];
  hasNextRound: boolean;
}) {
  const connectors: { top: number; height: number }[] = [];
  if (hasNextRound) {
    for (let i = 0; i + 1 < sets.length; i += 2) {
      const top = centerPercent(i, sets.length);
      const bottom = centerPercent(i + 1, sets.length);
      connectors.push({ top, height: bottom - top });
    }
  }

  return (
    <div className={styles.round}>
      <p className={styles.roundLabel}>{sets[0]?.fullRoundText || `Round ${round}`}</p>
      <div className={styles.matches}>
        {sets.map((set) => (
          <SetCard key={set.id} set={set} connect={hasNextRound} />
        ))}
        {connectors.map((connector, i) => (
          <div
            key={i}
            className={styles.connector}
            style={{ top: `${connector.top}%`, height: `${connector.height}%` }}
          />
        ))}
      </div>
    </div>
  );
}

function SetCard({ set, connect }: { set: BracketSet; connect: boolean }) {
  const slots = set.slots ?? [];
  return (
    <div className={`${styles.set} ${connect ? styles.setConnect : ""}`}>
      {slots.map((slot, i) => {
        const entrant = slot?.entrant;
        const participant = entrant?.participants?.[0];
        const gamerTag = participant?.gamerTag;
        const displayName = gamerTag
          ? inferShortname(gamerTag)
          : entrant?.name
            ? inferShortname(entrant.name)
            : "TBD";
        const prefix = gamerTag ? participant?.prefix : null;
        const score = slot?.standing?.stats?.score?.value;
        const isWinner =
          !!entrant?.id && String(set.winnerId) === entrant.id;
        return (
          <div
            key={entrant?.id ?? i}
            className={`${styles.slot} ${isWinner ? styles.slotWinner : ""}`}
          >
            <span className={styles.slotNames}>
              <span className={styles.slotName}>{displayName}</span>
              {prefix && <span className={styles.slotPrefix}>{prefix}</span>}
            </span>
            {score != null && <span className={styles.slotScore}>{score}</span>}
          </div>
        );
      })}
    </div>
  );
}

export function Bracket() {
  return (
    <UrqlProvider value={urqlClient}>
      <BracketView />
    </UrqlProvider>
  );
}

function BracketView() {
  const phaseGroupId = phaseGroupIdFromBracketUrl(START_GG_BRACKET_URL);
  const [result, refetch] = useStartggBracket(phaseGroupId);

  useEffect(() => {
    const interval = setInterval(() => {
      refetch({ requestPolicy: "network-only" });
    }, REFRESH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [refetch]);

  const phaseGroup = result.data?.phaseGroup;
  const sets = (phaseGroup?.sets?.nodes ?? []).filter(
    (set): set is BracketSet => !!set,
  );
  const rounds = splitOutGrandFinalReset(groupByRound(sets));
  const winnersRounds = [...rounds.keys()]
    .filter((round) => round > 0)
    .sort((a, b) => a - b);
  const losersRounds = [...rounds.keys()]
    .filter((round) => round < 0)
    .sort((a, b) => b - a);

  return (
    <div className={styles.canvas}>
      {result.fetching && !phaseGroup && <Spinner size={32} />}
      <div className={styles.sections}>
        {!phaseGroup && !result.fetching && (
          <p className={styles.empty}>Couldn't load bracket from start.gg</p>
        )}
        {winnersRounds.length > 0 && (
          <div className={`${styles.section} ${styles.sectionWinners}`}>
            <p className={styles.sectionLabel}>Winners Bracket</p>
            <div className={styles.rounds}>
              {winnersRounds.map((round, i) => (
                <BracketColumn
                  key={round}
                  round={round}
                  sets={rounds.get(round)!}
                  hasNextRound={i < winnersRounds.length - 1}
                />
              ))}
            </div>
          </div>
        )}
        {losersRounds.length > 0 && (
          <div className={`${styles.section} ${styles.sectionLosers}`}>
            <p className={styles.sectionLabel}>Losers Bracket</p>
            <div className={styles.rounds}>
              {losersRounds.map((round, i) => (
                <BracketColumn
                  key={round}
                  round={round}
                  sets={rounds.get(round)!}
                  hasNextRound={i < losersRounds.length - 1}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
