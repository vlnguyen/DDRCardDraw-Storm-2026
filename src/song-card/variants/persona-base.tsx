import { detectedLanguage } from "../../utils";
import styles from "../persona-song-card.css";
import winnerIcon from "../../assets/img/winner.svg";
import { usePlayerLabelForId } from "../use-player-label";
import {
  baseChartValues,
  type BaseFooterProps,
  type CardSectionProps,
} from "./base";

const isJapanese = detectedLanguage === "ja";

export function PersonaBaseCardCenter(props: CardSectionProps) {
  const { name, nameTranslation, dateAdded } = baseChartValues(props.chart);
  return (
    <>
      <div className={styles.name} title={nameTranslation}>
        {name}
      </div>
      {isJapanese ? null : (
        <div className={styles.nameTranslation}>{nameTranslation}</div>
      )}
      <div className={styles.dateAdded} title={dateAdded}>
        {dateAdded}
      </div>
    </>
  );
}

export function PersonaBaseCardFooter(props: BaseFooterProps) {
  const { winner } = props;
  const hasWinner = winner !== undefined && winner !== null;
  const winnerLabel = usePlayerLabelForId(winner ?? "");
  const visibility = hasWinner ? "visible" : "hidden";
  return (
    <div className={styles.cardFooter}>
      <img
        className={styles.winnerIcon}
        src={winnerIcon}
        alt=""
        style={{ visibility }}
      />
      <span className={styles.winnerLabel} style={{ visibility }}>
        {winnerLabel}
      </span>
    </div>
  );
}
