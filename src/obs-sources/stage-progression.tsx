import { useLayoutEffect, useMemo, useRef, useState } from "react";
import type { PoolHistoryStage } from "../state/event.slice";
import { useAppState } from "../state/store";
import { getPoolCodesForStage, parsePoolPlayers } from "./pool-history";
import { Pools, getPoolPlayersResults } from "./pools";
import { entrantsMap, SEED_UNSEEDED } from "../assets/entrants/entrantsMap";
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
  // "exiting" = sliding offscreen (old content); "entering" = sliding back
  // into view (new content, mid-transition); "idle" = fully settled. The
  // center panel's fade-in waits on this reaching "idle" after a stage
  // change, rather than running on its own independent timer.
  const [sidebarPhase, setSidebarPhase] = useState<
    "idle" | "exiting" | "entering"
  >("idle");
  // Tracks the last committedStage seen, so a change can be detected and
  // reacted to during render instead of in an effect (avoids an extra
  // effect-triggered render pass for what's fundamentally derived state).
  const [prevCommittedStage, setPrevCommittedStage] =
    useState(committedStage);
  if (committedStage !== prevCommittedStage) {
    setPrevCommittedStage(committedStage);
    if (committedStage !== displayedStage) {
      setSidebarPhase("exiting");
    }
  }

  const handleSidebarTransitionEnd = (
    e: React.TransitionEvent<HTMLDivElement>,
  ) => {
    if (e.target !== e.currentTarget || e.propertyName !== "transform") {
      return;
    }
    if (sidebarPhase === "exiting") {
      setDisplayedStage(committedStage);
      setSidebarPhase("entering");
    } else if (sidebarPhase === "entering") {
      setSidebarPhase("idle");
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

  // The stage+pool actually rendered in the center panel — lags behind the
  // committed values while it's fading out, so old content stays visible
  // until fully transparent, then swaps before fading back in. Independent
  // of the sidebar's displayedStage since this fades on pool-only changes
  // too, not just stage changes.
  const [displayedCenterStage, setDisplayedCenterStage] =
    useState<PoolHistoryStage>(committedStage);
  const [displayedCenterPool, setDisplayedCenterPool] = useState(
    selectedPool,
  );
  const [isCenterFading, setIsCenterFading] = useState(false);
  // Once the center panel's own fade-out transition has finished (opacity
  // reached 0). On a stage change we still hold at opacity 0 after this
  // until the sidebar also reaches "idle", instead of fading back in on
  // our own independent timer.
  const [centerFadeOutDone, setCenterFadeOutDone] = useState(false);
  const [centerFadeWaitsForSidebar, setCenterFadeWaitsForSidebar] =
    useState(false);
  const committedCenterKey = `${committedStage}:${selectedPool}`;
  const [prevCommittedCenterKey, setPrevCommittedCenterKey] = useState(
    committedCenterKey,
  );
  if (committedCenterKey !== prevCommittedCenterKey) {
    setPrevCommittedCenterKey(committedCenterKey);
    if (
      committedStage !== displayedCenterStage ||
      selectedPool !== displayedCenterPool
    ) {
      setIsCenterFading(true);
      setCenterFadeOutDone(false);
      setCenterFadeWaitsForSidebar(committedStage !== displayedCenterStage);
    }
  }

  // Once faded out, swap to the new content and start fading back in —
  // immediately for a pool-only change, or once the sidebar has fully
  // settled back into view for a stage change.
  if (
    isCenterFading &&
    centerFadeOutDone &&
    (!centerFadeWaitsForSidebar || sidebarPhase === "idle")
  ) {
    setDisplayedCenterStage(committedStage);
    setDisplayedCenterPool(selectedPool);
    setIsCenterFading(false);
    setCenterFadeOutDone(false);
    setCenterFadeWaitsForSidebar(false);
  }

  const handleCenterPanelTransitionEnd = (
    e: React.TransitionEvent<HTMLDivElement>,
  ) => {
    if (e.target !== e.currentTarget || e.propertyName !== "opacity") {
      return;
    }
    if (isCenterFading && !centerFadeOutDone) {
      setCenterFadeOutDone(true);
    }
  };

  const centerRows = useAppState(
    (s) =>
      s.event.tournament?.poolHistory?.data?.[displayedCenterStage] as
        | string[][]
        | undefined,
  );

  const centerPoolPlayers = useMemo(() => {
    if (!centerRows || !displayedCenterPool) return [];
    return parsePoolPlayers(centerRows, displayedCenterPool);
  }, [centerRows, displayedCenterPool]);

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
          isCenterFading
            ? `${styles.centerPanel} ${styles.centerPanelFading}`
            : styles.centerPanel
        }
        onTransitionEnd={handleCenterPanelTransitionEnd}
      >
        <Pools poolPlayers={centerPoolPlayers} forcePlayerAdvancement />
      </div>
      <div
        className={
          sidebarPhase === "exiting"
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
                {players.map((player, i) => {
                  const seed =
                    player.entrantId != null
                      ? (entrantsMap[player.entrantId]?.seed ?? null)
                      : null;
                  return (
                    <li key={i} className={styles.player}>
                      <span>
                        {player.gamerTag}
                        {seed != null && seed !== SEED_UNSEEDED && (
                          <sub className={styles.seed}>{seed}</sub>
                        )}
                      </span>
                      {player.advancement === "1st" && (
                        <span className={styles.medal}>🥇</span>
                      )}
                      {player.advancement === "2nd" && (
                        <span className={styles.medal}>🥈</span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
