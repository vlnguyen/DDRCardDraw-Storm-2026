import styles from "./vs-meter.css";

export function VsMeter() {
  return (
    <div className={styles.canvas}>
      <div className={styles.verticalLine} />
      <div className={styles.line}>
        <div className={styles.lineP1} />
        <div className={styles.lineP2} />
        <div className={styles.circle} />
      </div>
    </div>
  );
}
