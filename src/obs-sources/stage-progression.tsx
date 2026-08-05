import { useLayoutEffect, useMemo, useRef, useState } from "react";
import type { PoolHistoryStage } from "../state/event.slice";
import { useAppState } from "../state/store";
import { getPoolCodesForStage, parsePoolPlayers } from "./pool-history";
import { getPoolPlayersResults } from "./pools";
import styles from "./stage-progression.css";

// How far the highlight box extends past each pool's own content box.
const HIGHLIGHT_MARGIN = 24;

// Scaffold OBS source — 3840x2160 canvas, transparent background, ready for
// dashboard-driven content once that state/controls are added.
export function StageProgression() {
  const committedStage = useAppState(
    (s) => s.event.tournament?.stageProgression?.selectedStage ?? "stage1",
  );
  const selectedPool = useAppState(
    (s) => s.event.tournament?.stageProgression?.selectedPool,
  );

  // The stage actually being rendered — lags behind `committedStage` while
  // the sidebar is sliding out, so old content stays visible until it's
  // fully offscreen, then swaps before sliding back in.
  const [displayedStage, setDisplayedStage] =
    useState<PoolHistoryStage>(committedStage);
  const [isExiting, setIsExiting] = useState(false);
  // Tracks the last committedStage seen, so a change can be detected and
  // reacted to during render instead of in an effect (avoids an extra
  // effect-triggered render pass for what's fundamentally derived state).
  const [prevCommittedStage, setPrevCommittedStage] =
    useState(committedStage);
  if (committedStage !== prevCommittedStage) {
    setPrevCommittedStage(committedStage);
    if (committedStage !== displayedStage) {
      setIsExiting(true);
    }
  }

  const handleSidebarTransitionEnd = (
    e: React.TransitionEvent<HTMLDivElement>,
  ) => {
    if (e.target !== e.currentTarget || e.propertyName !== "transform") {
      return;
    }
    if (isExiting) {
      setDisplayedStage(committedStage);
      setIsExiting(false);
    }
  };

  const stageNumber = displayedStage.slice("stage".length);
  const rows = useAppState(
    (s) =>
      s.event.tournament?.poolHistory?.data?.[displayedStage] as
        | string[][]
        | undefined,
  );

  const pools = useMemo(() => {
    if (!rows) return [];
    return getPoolCodesForStage(rows).map((poolCode) => ({
      poolCode,
      players: getPoolPlayersResults(parsePoolPlayers(rows, poolCode)),
    }));
  }, [rows]);

  const poolRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const highlightRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const highlightEl = highlightRef.current;
    if (!highlightEl) return;
    const el = selectedPool ? poolRefs.current[selectedPool] : null;
    if (!el) {
      highlightEl.style.display = "none";
      return;
    }
    highlightEl.style.display = "block";
    highlightEl.style.top = `${el.offsetTop - HIGHLIGHT_MARGIN}px`;
    highlightEl.style.left = `${el.offsetLeft - HIGHLIGHT_MARGIN}px`;
    highlightEl.style.width = `${el.offsetWidth + HIGHLIGHT_MARGIN * 2}px`;
    highlightEl.style.height = `${el.offsetHeight + HIGHLIGHT_MARGIN * 2}px`;
  }, [selectedPool, pools]);

  return (
    <div className={styles.canvas}>
      <div
        className={
          isExiting
            ? `${styles.sidebar} ${styles.sidebarSlideOut}`
            : styles.sidebar
        }
        onTransitionEnd={handleSidebarTransitionEnd}
      >
        <div className={styles.sidebarEdgeBlur} />
        <div className={styles.titleWrap}>
          <p className={styles.titleStroke}>Stage {stageNumber}</p>
          <p className={styles.title}>Stage {stageNumber}</p>
        </div>
        <div className={styles.pools}>
          <div
            ref={highlightRef}
            className={styles.poolHighlight}
            style={{ display: "none" }}
          />
          {pools.map(({ poolCode, players }) => (
            <div
              key={poolCode}
              ref={(el) => {
                poolRefs.current[poolCode] = el;
              }}
              className={styles.pool}
            >
              <p className={styles.poolName}>Pool {poolCode}</p>
              <ul className={styles.playerList}>
                {players.map((player, i) => (
                  <li key={i} className={styles.player}>
                    <span>{player.gamerTag}</span>
                    {player.advancement === "1st" && (
                      <span className={styles.medal}>🥇</span>
                    )}
                    {player.advancement === "2nd" && (
                      <span className={styles.medal}>🥈</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
