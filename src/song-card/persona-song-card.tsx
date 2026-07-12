import classNames from "classnames";
import { useEffect, useRef } from "react";
import { useConfigState } from "../state/hooks";
import { CHART_PLACEHOLDER } from "../models/Drawing";
import styles from "./persona-song-card.css";
import protectIcon from "../assets/img/protect.svg";
import vetoIcon from "../assets/img/veto.svg";
import coffinBlueIcon from "../assets/img/coffin-blue.svg";
import { getJacketUrl } from "../utils/jackets";
import { useChartRandomSelected } from "../tournament-mode/highlight-random";
import { usePlayerLabelForId } from "./use-player-label";

import { baseChartValues } from "./variants";
import { type SongCardBaseProps as Props } from "./song-card";

export function PersonaSongCard(props: Props) {
  const {
    chart,
    vetoedBy,
    protectedBy,
    replacedBy,
    replacedWith,
    winner,
    CenterContent,
    FooterContent,
  } = props;
  const hideVetos = useConfigState((s) => s.hideVetos);

  const [wasRandomlySelected] = useChartRandomSelected(chart);
  const rootRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (wasRandomlySelected && rootRef.current) {
      rootRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [wasRandomlySelected]);

  const baseChartIsPlaceholder =
    "type" in chart && chart.type === CHART_PLACEHOLDER;

  const { jacket, bpm } = replacedWith || baseChartValues(chart);

  const isVetoed = vetoedBy !== undefined;
  const headerPlayer = vetoedBy ?? protectedBy ?? replacedBy;
  const hasHeaderPlayer = headerPlayer !== undefined;
  const headerLabel = usePlayerLabelForId(headerPlayer ?? "");
  const headerVisibility = hasHeaderPlayer ? "visible" : "hidden";

  let jacketBg = {};
  if (jacket) {
    jacketBg = { backgroundImage: `url("${getJacketUrl(jacket)}")` };
  }

  const rootClassname = classNames(styles.chart, {
    [styles.vetoed]: vetoedBy !== undefined,
    [styles.protected]: protectedBy !== undefined,
    [styles.replaced]: replacedBy !== undefined && !baseChartIsPlaceholder,
    [styles.picked]: replacedBy !== undefined && baseChartIsPlaceholder,
    [styles.hideVeto]: hideVetos,
    [styles.randomSelected]: wasRandomlySelected,
  });

  return (
    <div className={styles.cardSlot}>
      <div ref={rootRef} className={rootClassname} style={jacketBg}>
        <div className={styles.clickTarget}>
          <div className={styles.cardHeader}>
            <img
              className={styles.headerIcon}
              src={isVetoed ? vetoIcon : protectIcon}
              alt=""
              style={{ visibility: headerVisibility }}
            />
            <span
              className={isVetoed ? styles.vetoLabel : styles.protectLabel}
              style={{ visibility: headerVisibility }}
            >
              {headerLabel}
            </span>
          </div>
          <div className={styles.cardCenter}>
            <CenterContent chart={replacedWith || chart} />
          </div>
          <FooterContent chart={replacedWith || chart} winner={winner} />
        </div>
      </div>
      <div className={styles.coffinCorner}>
        <img src={coffinBlueIcon} alt="" />
        <div className={styles.coffinCornerTextBox}>
          <span className={styles.coffinCornerText}>
            {bpm} bpm
          </span>
        </div>
      </div>
    </div>
  );
}
