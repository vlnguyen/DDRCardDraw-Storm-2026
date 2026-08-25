import { Button, Tabs, Tab, TabsExpander } from "@blueprintjs/core";
import { Download } from "@blueprintjs/icons";
import { PlayerNamesControls } from "../controls/player-names";
import { DrawingList } from "../drawing-list";
import { atom, useAtom } from "jotai";
import styles from "./main-view.css";
import { lazy, Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { ErrorFallback } from "../utils/error-fallback";
import { DelayedSpinner } from "../common-components/delayed-spinner";
import { Drawing } from "../models/Drawing";
import { useAppState } from "../state/store";
import { exportDrawsCsv, exportDrawsJson } from "./draws-export";

export type MainTabId = "drawings" | "players" | "sets";
export const mainTabAtom = atom<MainTabId>("drawings");

const EligibleChartsList = lazy(() => import("../eligible-charts"));

export function MainView() {
  const [currentTab, setCurrentTab] = useAtom(mainTabAtom);
  const drawings = useAppState((s) =>
    s.drawings.ids
      .map((id) => s.drawings.entities[id])
      .filter((d): d is Drawing => !!d),
  );
  return (
    <Tabs
      id="main-view"
      className={styles.mainView}
      large
      selectedTabId={currentTab}
      onChange={(newTabId: MainTabId) => setCurrentTab(newTabId)}
    >
      <Tab id="drawings" panel={<DrawingList />}>
        Drawings
      </Tab>
      <Tab
        id="eligible"
        panel={
          <ErrorBoundary fallback={<ErrorFallback />}>
            <Suspense fallback={<DelayedSpinner />}>
              <EligibleChartsList />
            </Suspense>
          </ErrorBoundary>
        }
      >
        Eligible Charts
      </Tab>
      <Tab id="players" panel={<PlayerNamesControls />}>
        Start.gg Sync
      </Tab>
      <TabsExpander />
      <Button
        minimal
        icon={<Download />}
        text="Export draws (.csv)"
        disabled={drawings.length === 0}
        onClick={() => exportDrawsCsv(drawings)}
      />
      <Button
        minimal
        icon={<Download />}
        text="Export draws (.json)"
        disabled={drawings.length === 0}
        onClick={() => exportDrawsJson(drawings)}
      />
    </Tabs>
  );
}
