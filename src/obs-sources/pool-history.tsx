import styles from "./pool-history.css";

export const SPREADSHEET_URL =
  "https://docs.google.com/spreadsheets/d/13_BozVhnQf7nYyP5F2qJlq5Ly-mb0LtJyMWisswBoCc" as const;

export const STAGE_GIDS: Readonly<Record<`stage${1 | 2 | 3 | 4 | 5 | 6 | 7}`, string>> = {
  stage1: "1158920643",
  stage2: "1418881493",
  stage3: "1085633045",
  stage4: "1359413595",
  stage5: "244654487",
  stage6: "699616213",
  stage7: "700473128",
};

export function PoolHistory() {
  return <div className={styles.canvas} />;
}
