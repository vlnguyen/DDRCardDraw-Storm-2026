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
        {title && <h1 className={styles.title}>{title}</h1>}
        {line1 && <p className={styles.line1}>{line1}</p>}
        {line2 && <p className={styles.line2}>{line2}</p>}
      </div>
    </div>
  );
}
