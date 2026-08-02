import { useEffect, useRef, useState } from "react";
import { useAppState } from "../state/store";
import styles from "./lower-third.css";
import lowerThirdBg from "../assets/img/lower-third-blue.png";

const DISPLAY_TIME_SECONDS = 10;
const FADE_MS = 600;
// DEBUG: force the lower third to stay visible for layout iteration.
const DEBUG_ALWAYS_VISIBLE = false;

export function LowerThird() {
  const { title, line1, line2 } = useAppState(
    (s) =>
      s.event.tournament?.lowerThird ?? { title: "", line1: "", line2: "" },
  );
  const toggled = useAppState(
    (s) => s.event.tournament?.toggleLowerThird ?? false,
  );
  const [visible, setVisible] = useState(false);
  const isFirstRun = useRef(true);

  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }
    setVisible(true);
    const hideTimer = setTimeout(() => {
      setVisible(false);
    }, DISPLAY_TIME_SECONDS * 1000);
    return () => clearTimeout(hideTimer);
  }, [toggled]);

  if (!DEBUG_ALWAYS_VISIBLE && !title && !line1 && !line2) {
    return <div className={styles.canvas} />;
  }

  return (
    <div className={styles.canvas}>
      <div
        className={styles.lowerThird}
        style={{
          opacity: DEBUG_ALWAYS_VISIBLE || visible ? 1 : 0,
          transition: `opacity ${FADE_MS}ms ease`,
        }}
      >
        <img src={lowerThirdBg} alt="" className={styles.background} />
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
