import { Popover } from "@blueprintjs/core";
import classNames from "classnames";
import { type JSX, useCallback, useEffect, useRef, useState } from "react";
import { useConfigState } from "../state/hooks";
import { CHART_PLACEHOLDER, DrawnChart } from "../models/Drawing";
import { SongSearch } from "../song-search";
import { CardLabel, LabelType } from "./card-label";
import { FillPlaceholderList, ActionMenu } from "./acton-menu";
import styles from "./persona-song-card.css";
import { getJacketUrl } from "../utils/jackets";
import { copyTextToClipboard } from "../utils/share";
import { useChartRandomSelected } from "../tournament-mode/highlight-random";

import { baseChartValues } from "./variants";
import {
  type PlayerIdx,
  type SongCardBaseProps as Props,
  useIconCallbacksForChart,
} from "./song-card";

export function PersonaSongCard(props: Props) {
  const {
    chart,
    vetoedBy,
    protectedBy,
    replacedBy,
    replacedWith,
    winner,
    actionsEnabled,
    CenterContent,
    FooterContent,
  } = props;
  const hideVetos = useConfigState((s) => s.hideVetos);

  const [wasRandomlySelected, clearRandomSelection] =
    useChartRandomSelected(chart);
  const rootRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (wasRandomlySelected && rootRef.current) {
      rootRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [wasRandomlySelected]);

  const [showingContextMenu, setContextMenuOpen] = useState(false);
  const showMenu = () => setContextMenuOpen(true);
  const hideMenu = () => setContextMenuOpen(false);

  const [pocketPickPendingForPlayer, setPocketPickPendingForPlayer] =
    useState<PlayerIdx | null>(null);

  const baseChartIsPlaceholder =
    "type" in chart && chart.type === CHART_PLACEHOLDER;

  const { name, diffAbbr, jacket } = replacedWith || baseChartValues(chart);

  const hasLabel = !!(
    vetoedBy !== undefined ||
    protectedBy !== undefined ||
    replacedBy !== undefined
  );
  const hasWinner = typeof winner === "number";

  let jacketBg = {};
  if (jacket) {
    jacketBg = { backgroundImage: `url("${getJacketUrl(jacket)}")` };
  }

  const iconCallbacks = useIconCallbacksForChart((chart as DrawnChart).id);
  const handleCopy = useCallback(async () => {
    if (!diffAbbr) {
      return;
    }
    await copyTextToClipboard(
      `${name} [${diffAbbr.toUpperCase()}]`,
      "Copied name & difficulty",
    );
  }, [name, diffAbbr]);
  const canCopy = !!name && !!diffAbbr;

  let menuContent: undefined | JSX.Element;
  if (actionsEnabled && !hasWinner) {
    if (replacedWith === undefined && baseChartIsPlaceholder) {
      menuContent = (
        <FillPlaceholderList
          onFillPlaceholder={setPocketPickPendingForPlayer}
        />
      );
    } else if (!hasLabel) {
      menuContent = (
        <ActionMenu
          onProtect={iconCallbacks.onProtect}
          onStartPocketPick={setPocketPickPendingForPlayer}
          onVeto={iconCallbacks.onVeto}
          onRedraw={iconCallbacks.onRedraw}
          onSetWinner={iconCallbacks.onSetWinner}
          onCopy={handleCopy}
        />
      );
    } else if (vetoedBy === undefined) {
      menuContent = (
        <ActionMenu
          onSetWinner={iconCallbacks.onSetWinner}
          onCopy={handleCopy}
        />
      );
    }
  }

  const rootClassname = classNames(styles.chart, {
    [styles.vetoed]: vetoedBy !== undefined,
    [styles.protected]: protectedBy !== undefined,
    [styles.replaced]: replacedBy !== undefined && !baseChartIsPlaceholder,
    [styles.picked]: replacedBy !== undefined && baseChartIsPlaceholder,
    [styles.clickable]: !!menuContent || !!props.onClick || canCopy,
    [styles.hideVeto]: hideVetos,
    [styles.randomSelected]: wasRandomlySelected,
  });

  const handleCardClick = menuContent ? showMenu : props.onClick || handleCopy;

  const actionLabels = (
    <>
      {vetoedBy !== undefined && (
        <CardLabel
          playerIdx={vetoedBy}
          type={LabelType.Ban}
          onRemove={iconCallbacks?.onReset}
        />
      )}
      {protectedBy !== undefined && (
        <CardLabel
          playerIdx={protectedBy}
          type={LabelType.Protect}
          onRemove={iconCallbacks?.onReset}
        />
      )}
      {replacedBy !== undefined && (
        <CardLabel
          playerIdx={replacedBy}
          type={baseChartIsPlaceholder ? LabelType.FreePick : LabelType.Pocket}
          onRemove={iconCallbacks?.onReset}
        />
      )}
    </>
  );

  return (
    <Popover
      isOpen={wasRandomlySelected}
      onClose={clearRandomSelection}
      content={<div style={{ padding: "0.5em" }}>This one!</div>}
      targetTagName="div"
      className={styles.popoverWrapper}
    >
      <div
        ref={rootRef}
        className={rootClassname}
        onClick={
          showingContextMenu || pocketPickPendingForPlayer !== null
            ? undefined
            : handleCardClick
        }
        style={jacketBg}
      >
        <SongSearch
          isOpen={pocketPickPendingForPlayer !== null}
          onSongSelect={(song, chart) => {
            if (actionsEnabled && chart) {
              iconCallbacks.onReplace(pocketPickPendingForPlayer!, chart);
            }
            setPocketPickPendingForPlayer(null);
          }}
          onCancel={() => setPocketPickPendingForPlayer(null)}
        />
        <div className={styles.clickTarget}>
          <div className={styles.cardCenter}>
            {actionLabels}
            <CenterContent chart={replacedWith || chart} />
          </div>

          <Popover
            content={menuContent}
            isOpen={showingContextMenu}
            onClose={hideMenu}
            placement="top"
            modifiers={{
              offset: { options: { offset: [0, 35] } },
            }}
          >
            <FooterContent chart={replacedWith || chart} winner={winner} />
          </Popover>
        </div>
      </div>
    </Popover>
  );
}
