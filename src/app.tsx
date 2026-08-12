import "normalize.css";
import "@blueprintjs/core/lib/css/blueprint.css";
import "@blueprintjs/table/lib/css/table.css";
import "@blueprintjs/icons/lib/css/blueprint-icons.css";
import "@blueprintjs/select/lib/css/blueprint-select.css";
import "@blueprintjs/datetime/lib/css/blueprint-datetime.css";

import { FocusStyleManager } from "@blueprintjs/core";

FocusStyleManager.onlyShowFocusOnTabs();

import { UpdateManager } from "./update-manager";
import { IntlProviderWrapper } from "./intl-provider";
import { ThemeSyncWidget } from "./theme-toggle";
import { Provider } from "react-redux";
import { createClientStore, useAppState } from "./state/store";
import { PartySocketManager } from "./party/client";

import {
  createBrowserRouter,
  Outlet,
  RouterProvider,
  useParams,
  Link,
} from "react-router-dom";
import { nanoid } from "nanoid";
import { ClassicModeShell } from "./classic-mode";
import { useMemo } from "react";
import { ToasterHost } from "./toaster";

const router = createBrowserRouter([
  {
    path: "/",
    Component: () => {
      return (
        <div style={{ padding: "1em" }}>
          <h1>DDR Tools Event Mode</h1>
          <h2 style={{ fontStyle: "italic" }}>Alpha Preview</h2>
          <p>
            You need to pick an event first. Would you like to:{" "}
            <Link to={`/e/${nanoid()}`}>Create New Event?</Link>
          </p>
          <p>
            Or... perhaps just use the app in{" "}
            <Link to="/classic">Classic Mode</Link>
          </p>
          <p>
            No idea what this is?{" "}
            <a href="https://youtu.be/4Gpj9jTNcfM">Here's a video</a> trying to
            explain how to use it!
          </p>
        </div>
      );
    },
  },
  {
    path: "classic",
    Component: ClassicModeShell,
    children: [
      {
        index: true,
        lazy: async () => {
          const mod = await import("./drawing-list");
          return { Component: mod.DrawingList };
        },
      },
      {
        path: "charts",
        lazy: async () => {
          const mod = await import("./eligible-charts");
          return { Component: mod.default };
        },
      },
      {
        path: "config/:configId?",
        lazy: async () => {
          const mod = await import("./controls/config-page");
          return { Component: mod.ConfigPage };
        },
      },
    ],
  },
  {
    path: "preview/:roomName",
    async loader(f) {
      const { roomName } = f.params;
      const mod = await import("./preview-mode/shell");
      return mod.PreviewShell.loader(roomName);
    },
    lazy: async () => {
      const mod = await import("./preview-mode/shell");
      return { Component: mod.PreviewShell };
    },
    children: [
      {
        index: true,
        lazy: async () => {
          const mod = await import("./preview-mode/shell");
          return { Component: mod.PreviewView };
        },
      },
    ],
  },
  {
    path: "e/:roomName",
    lazy: async () => ({
      Component: (await import("./tournament-mode")).TournamentModeAppShell,
    }),
    children: [
      {
        index: true,
        lazy: async () => ({
          Component: (await import("./tournament-mode")).TournamentModeAppMain,
        }),
      },
      {
        path: "config/:configId?",
        lazy: async () => {
          const { ConfigPage } = await import("./controls/config-page");
          return { Component: ConfigPage };
        },
      },
      {
        path: "dash",
        lazy: async () => {
          const { Dashboard } = await import(
            "./tournament-mode/dashboard/dashboard"
          );
          return { Component: Dashboard };
        },
      },
    ],
  },
  {
    path: "e/:roomName/bracket",
    element: <ObsSource />,
    children: [
      {
        index: true,
        lazy: async () => {
          const { Bracket } = await import("./obs-sources/bracket");
          return { Component: Bracket };
        },
      },
    ],
  },
  {
    path: "e/:roomName/obs-globals/:labelId",
    element: <ObsSource />,
    children: [
      {
        index: true,
        lazy: async () => {
          const { GlobalLabel } = await import("./obs-sources/text");
          return { Component: GlobalLabel };
        },
      },
    ],
  },
  {
    path: "e/:roomName/live-rankings",
    element: <ObsSource />,
    children: [
      {
        index: true,
        lazy: async () => {
          const { LiveRankings } = await import("./obs-sources/lobby");
          return { Component: LiveRankings };
        },
      },
    ],
  },
  {
    path: "e/:roomName/step-stats",
    element: <ObsSource />,
    children: [
      {
        index: true,
        lazy: async () => {
          const { StepStats } = await import("./obs-sources/step-stats");
          return { Component: StepStats };
        },
      },
    ],
  },
  {
    path: "e/:roomName/pool-player-name",
    element: <ObsSource />,
    children: [
      {
        index: true,
        lazy: async () => {
          const { PoolPlayerName } = await import("./obs-sources/text");
          return { Component: PoolPlayerName };
        },
      },
    ],
  },
  {
    path: "e/:roomName/pools",
    element: <ObsSource />,
    children: [
      {
        index: true,
        lazy: async () => {
          const { PoolsLive } = await import("./obs-sources/pools");
          return { Component: PoolsLive };
        },
      },
    ],
  },
  {
    path: "e/:roomName/pools-condensed",
    element: <ObsSource />,
    children: [
      {
        index: true,
        lazy: async () => {
          const { PoolsCondensed } = await import(
            "./obs-sources/pools-condensed"
          );
          return { Component: PoolsCondensed };
        },
      },
    ],
  },
  {
    path: "e/:roomName/chart-leaderboard",
    element: <ObsSource />,
    children: [
      {
        index: true,
        lazy: async () => {
          const { ChartLeaderboard } = await import(
            "./obs-sources/chart-leaderboard"
          );
          return { Component: ChartLeaderboard };
        },
      },
    ],
  },
  {
    path: "e/:roomName/persona-3-circle",
    element: <ObsSource />,
    children: [
      {
        index: true,
        lazy: async () => {
          const { Persona3Circle } = await import("./obs-sources/persona-3-circle");
          return { Component: Persona3Circle };
        },
      },
    ],
  },
  {
    path: "e/:roomName/triangles",
    element: <ObsSource />,
    children: [
      {
        index: true,
        lazy: async () => {
          const { Triangles } = await import("./obs-sources/triangles");
          return { Component: Triangles };
        },
      },
    ],
  },
  {
    path: "e/:roomName/stars",
    element: <ObsSource />,
    children: [
      {
        index: true,
        lazy: async () => {
          const { Stars } = await import("./obs-sources/stars");
          return { Component: Stars };
        },
      },
    ],
  },
  {
    path: "e/:roomName/stage-progression",
    element: <ObsSource />,
    children: [
      {
        index: true,
        lazy: async () => {
          const { StageProgression } = await import(
            "./obs-sources/stage-progression"
          );
          return { Component: StageProgression };
        },
      },
    ],
  },
  {
    path: "e/:roomName/rules",
    element: <ObsSource />,
    children: [
      {
        index: true,
        lazy: async () => {
          const { Rules } = await import("./obs-sources/rules");
          return { Component: Rules };
        },
      },
    ],
  },
  {
    path: "e/:roomName/upcoming-pool",
    element: <ObsSource />,
    children: [
      {
        index: true,
        lazy: async () => {
          const { UpcomingPool } = await import(
            "./obs-sources/upcoming-pool"
          );
          return { Component: UpcomingPool };
        },
      },
    ],
  },
  {
    path: "e/:roomName/vs-meter",
    element: <ObsSource />,
    children: [
      {
        index: true,
        lazy: async () => {
          const { VsMeter } = await import("./obs-sources/vs-meter");
          return { Component: VsMeter };
        },
      },
    ],
  },
  {
    path: "e/:roomName/lower-third",
    element: <ObsSource />,
    children: [
      {
        index: true,
        lazy: async () => {
          const { LowerThird } = await import("./obs-sources/lower-third");
          return { Component: LowerThird };
        },
      },
    ],
  },
  {
    path: "e/:roomName/weigh-in",
    element: <ObsSource />,
    children: [
      {
        index: true,
        lazy: async () => {
          const { WeighIn } = await import("./obs-sources/weigh-in");
          return { Component: WeighIn };
        },
      },
    ],
  },
  {
    path: "e/:roomName/schedule",
    element: <ObsSource />,
    children: [
      {
        index: true,
        lazy: async () => {
          const { Schedule } = await import("./obs-sources/schedule");
          return { Component: Schedule };
        },
      },
    ],
  },
  {
    path: "e/:roomName/current-time",
    element: <ObsSource />,
    children: [
      {
        index: true,
        lazy: async () => {
          const { CurrentTime } = await import("./obs-sources/text");
          return { Component: CurrentTime };
        },
      },
    ],
  },
  {
    path: "e/:roomName/pool-song-counter",
    element: <ObsSource />,
    children: [
      {
        index: true,
        lazy: async () => {
          const { PoolSongCounter } = await import("./obs-sources/text");
          return { Component: PoolSongCounter };
        },
      },
    ],
  },
  {
    path: "e/:roomName/cab/:cabId/source",
    element: <ObsSource />,
    children: [
      {
        path: "cards",
        lazy: async () => {
          const { CabCards } = await import("./obs-sources/cards");
          return { Component: CabCards };
        },
      },
      {
        path: "phase",
        lazy: async () => {
          const { PhaseName } = await import("./obs-sources/text");
          return { Component: PhaseName };
        },
      },
      {
        path: "title",
        lazy: async () => {
          const { CabTitle } = await import("./obs-sources/text");
          return { Component: CabTitle };
        },
      },
      {
        path: "players",
        lazy: async () => {
          const { CabPlayers } = await import("./obs-sources/text");
          return { Component: CabPlayers };
        },
      },
      {
        path: "player/:playerIndex/:displayType?",
        lazy: async () => {
          const { CabPlayer, toDisplayType } =
            await import("./obs-sources/text");
          return {
            Component: function PlayerSource() {
              const { playerIndex, displayType } = useParams();
              return (
                <CabPlayer
                  p={+playerIndex!}
                  displayType={toDisplayType(displayType)}
                />
              );
            },
          };
        },
      },
      {
        path: "p1",
        lazy: async () => {
          const { CabPlayer } = await import("./obs-sources/text");
          return { element: <CabPlayer p={1} /> };
        },
      },
      {
        path: "p1-name",
        lazy: async () => {
          const { CabPlayer } = await import("./obs-sources/text");
          return { element: <CabPlayer p={1} displayType="name" /> };
        },
      },
      {
        path: "p1-score",
        lazy: async () => {
          const { CabPlayer } = await import("./obs-sources/text");
          return { element: <CabPlayer p={1} displayType="score" /> };
        },
      },
      {
        path: "p2",
        lazy: async () => {
          const { CabPlayer } = await import("./obs-sources/text");
          return { element: <CabPlayer p={2} /> };
        },
      },
      {
        path: "p2-name",
        lazy: async () => {
          const { CabPlayer } = await import("./obs-sources/text");
          return { element: <CabPlayer p={2} displayType="name" /> };
        },
      },
      {
        path: "p2-score",
        lazy: async () => {
          const { CabPlayer } = await import("./obs-sources/text");
          return { element: <CabPlayer p={2} displayType="score" /> };
        },
      },
    ],
  },
]);

function ObsSource() {
  const params = useParams<"roomName" | "cabId">();
  const store = useMemo(() => createClientStore(), []);
  if (!params.roomName) {
    return null;
  }
  return (
    <Provider store={store}>
      <PartySocketManager roomName={params.roomName} hideConnectingState>
        <ObsStyles />
        <Outlet />
      </PartySocketManager>
    </Provider>
  );
}

function ObsStyles() {
  const cssText = useAppState((s) => s.event.obsCss);
  return <style>{cssText}</style>;
}

export function App() {
  return (
    <IntlProviderWrapper>
      <ThemeSyncWidget />
      <UpdateManager />
      <RouterProvider router={router} />
      <ToasterHost />
    </IntlProviderWrapper>
  );
}
