import { useAppState } from "../state/store";
import styles from "./lower-third.css";

export function LowerThird() {
  const { title, line1, line2 } = useAppState(
    (s) =>
      s.event.tournament?.lowerThird ?? { title: "", line1: "", line2: "" },
  );

  if (!title && !line1 && !line2) {
    return <div className={styles.canvas} />;
  }

  return (
    <div className={styles.canvas}>
      <div className={styles.lowerThird}>
        {title && (
          <div className={styles.titleWrap}>
            <h1 aria-hidden="true" className={styles.titleStroke}>
              {title}
            </h1>
            <h1 className={styles.title}>{title}</h1>
          </div>
        )}
        {line1 && <p className={styles.line}>{line1}</p>}
        {line2 && <p className={styles.line}>{line2}</p>}
      </div>
    </div>
  );
}
