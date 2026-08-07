import {
  AnchorButton,
  Button,
  ButtonGroup,
  Callout,
  Card,
  CardList,
  Checkbox,
  Dialog,
  DialogBody,
  DialogFooter,
  Divider,
  FileInput,
  FormGroup,
  H3,
  H4,
  HTMLSelect,
  InputGroup,
  MenuItem,
  Radio,
  RadioGroup,
  Tab,
  Tabs,
  TextArea,
  Tooltip,
} from "@blueprintjs/core";
import { TimePicker } from "@blueprintjs/datetime";
import { Suggest } from "@blueprintjs/select";
import {
  Add,
  Download,
  Duplicate,
  Edit,
  FloppyDisk,
  Plus,
  Trash,
  Upload,
  WarningSign,
} from "@blueprintjs/icons";
import { css } from "@codemirror/lang-css";
import ReactCodeMirror from "@uiw/react-codemirror";
import { nanoid } from "nanoid";
import React, { useMemo, useRef, useState } from "react";
import { useHref } from "react-router-dom";
import {
  type CardDrawPhase,
  type EventState,
  type ObsLabelType,
  type ObsTextAlign,
  type PoolHistoryStage,
  type ScheduleDay,
  type ScheduleItem,
  eventSlice,
} from "../../state/event.slice";
import { useStockGameData } from "../../state/game-data.atoms";
import { useAppDispatch, useAppState } from "../../state/store";
import { useTheme } from "../../theme-toggle";
import format from "date-fns/format";
import {
  EASTERN_TIME_ZONE,
  formatDate,
  formatTimeAgo,
  useCurrentTime,
} from "../../hooks/useCurrentTime";
import {
  copyObsSource,
  routableBracketPath,
  routableChartLeaderboardPath,
  routableCurrentTimePath,
  routableGlobalSourcePath,
  routableLowerThirdPath,
  routablePersona3CirclePath,
  routableSchedulePath,
  routableStageProgressionPath,
  routableStarsPath,
  routableTrianglesPath,
  routableUpcomingPoolPath,
  routableVsMeterPath,
} from "../copy-obs-source";
import {
  fetchStageRows,
  getPoolCodesForStage,
} from "../../obs-sources/pool-history";
import styles from "./dashboard.css";
import { Lobbies } from "./lobbies";
import { useLobbiesStore } from "./lobbies.store";
import { MatchLog } from "./match-log";
import { useMatchLogStore } from "./match-log.store";
import { Match } from "../../obs-sources/lobby.types";
import { toaster } from "../../toaster";
import {
  SYNCSTART_PORT,
  SYNCSTART_URL,
} from "../../obs-sources/syncstart-connection";
import { Players } from "./players";
import { downloadDataUrl } from "../../utils/share";

type DashboardTabId =
  | "sources"
  | "lobbies"
  | "match-log"
  | "players"
  | "schedule"
  | "import-export";

export function Dashboard() {
  const [currentTab, setCurrentTab] =
    useState<DashboardTabId>("sources");
  const matchCount = useMatchLogStore((s) => s.matches.length);
  const lobbyCount = useLobbiesStore((s) => s.lobbies.length);

  return (
    <div className={styles.container}>
      <Tabs
        id="dashboard"
        className={styles.tabs}
        size="large"
        selectedTabId={currentTab}
        onChange={(newTabId: DashboardTabId) => setCurrentTab(newTabId)}
      >
        <Tab id="sources" panel={<Sources />}>
          Sources
        </Tab>
        <Tab id="players" panel={<Players />}>
          Players
        </Tab>
        <Tab id="lobbies" panel={<Lobbies />}>
          Lobbies ({lobbyCount})
        </Tab>
        <Tab id="match-log" panel={<MatchLogPanel />}>
          Match Log ({matchCount})
        </Tab>
        <Tab id="schedule" panel={<Schedule />}>
          Schedule
        </Tab>
        <Tab id="import-export" panel={<ImportExport />}>
          Import/Export
        </Tab>
      </Tabs>
    </div>
  );
}

function emptyScheduleItem(): ScheduleItem {
  return { time: "", event: "", description: "" };
}

// Schedule times are wall-clock, as typed by the user (e.g. "20:30" for
// 8:30 PM) — stored and rendered as-is, with no timezone conversion.
function parseScheduleTime(time: string | undefined): Date | null {
  if (!time) return null;
  const [hours, minutes] = time.split(":").map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date;
}

function formatScheduleTime(date: Date): string {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

const SCHEDULE_DAYS: { id: ScheduleDay; label: string }[] = [
  { id: "fri", label: "Friday" },
  { id: "sat", label: "Saturday" },
  { id: "sun", label: "Sunday" },
];

function ScheduleDayLink({
  day,
  label,
  disableBackground,
}: {
  day: ScheduleDay;
  label: string;
  disableBackground: boolean;
}) {
  const href = useHref(routableSchedulePath(day));
  return (
    <Tooltip content="Schedule (3840x2160)">
      <AnchorButton
        icon={<Duplicate />}
        onClick={(e) => {
          e.preventDefault();
          const url = new URL(href, document.location.href);
          if (disableBackground) {
            url.searchParams.set("bgaOff", "true");
          }
          copyObsSource(url.href);
        }}
        href={href}
      >
        {label}
      </AnchorButton>
    </Tooltip>
  );
}

function Schedule() {
  const [currentDay, setCurrentDay] = useState<ScheduleDay>("fri");
  const [disableBackground, setDisableBackground] = useState(false);

  return (
    <section className={styles.autoWidthSection}>
      <H3>Schedule</H3>
      <div className={styles.formRow}>
        {SCHEDULE_DAYS.map(({ id, label }) => (
          <ScheduleDayLink
            key={id}
            day={id}
            label={label}
            disableBackground={disableBackground}
          />
        ))}
      </div>
      <Checkbox
        label="Disable background"
        checked={disableBackground}
        onChange={(e) => setDisableBackground(e.currentTarget.checked)}
      />
      <Tabs
        id="schedule-days"
        selectedTabId={currentDay}
        onChange={(newDay: ScheduleDay) => setCurrentDay(newDay)}
      >
        {SCHEDULE_DAYS.map(({ id, label }) => (
          <Tab key={id} id={id} panel={<ScheduleDayEditor day={id} />}>
            {label}
          </Tab>
        ))}
      </Tabs>
    </section>
  );
}

function ScheduleDayEditor({ day }: { day: ScheduleDay }) {
  const dispatch = useAppDispatch();
  const savedSchedule = useAppState(
    (s) => s.event.tournament?.schedules?.[day]?.items ?? [],
  );
  const [schedule, setSchedule] = useState<ScheduleItem[]>(savedSchedule);
  const isDirty = JSON.stringify(schedule) !== JSON.stringify(savedSchedule);

  function updateRow(index: number, patch: Partial<ScheduleItem>) {
    setSchedule((prev) =>
      prev.map((row, i) => (i === index ? { ...row, ...patch } : row)),
    );
  }

  function addRow() {
    setSchedule((prev) => [...prev, emptyScheduleItem()]);
  }

  function removeRow(index: number) {
    setSchedule((prev) => prev.filter((_, i) => i !== index));
  }

  function submit() {
    dispatch(eventSlice.actions.updateSchedule({ day, items: schedule }));
  }

  function sortByTime() {
    setSchedule((prev) =>
      [...prev].sort((a, b) => (a.time ?? "").localeCompare(b.time ?? "")),
    );
  }

  return (
    <>
      <table className={styles.scheduleTable}>
        <thead>
          <tr>
            <th>Time</th>
            <th>Event</th>
            <th>Description</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {schedule.map((row, i) => (
            <tr key={i}>
              <td>
                <TimePicker
                  precision="minute"
                  useAmPm
                  value={parseScheduleTime(row.time)}
                  onChange={(newTime) =>
                    updateRow(i, { time: formatScheduleTime(newTime) })
                  }
                />
              </td>
              <td>
                <InputGroup
                  value={row.event ?? ""}
                  onChange={(e) => updateRow(i, { event: e.target.value })}
                />
              </td>
              <td>
                <InputGroup
                  value={row.description ?? ""}
                  onChange={(e) =>
                    updateRow(i, { description: e.target.value })
                  }
                />
              </td>
              <td>
                <Button icon={<Trash />} onClick={() => removeRow(i)} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <Button
        icon={<Plus />}
        onClick={addRow}
        className={styles.scheduleAddRow}
      />{" "}
      <Button disabled={schedule.length < 2} onClick={sortByTime}>
        Sort
      </Button>{" "}
      <Button
        disabled={!isDirty}
        intent={isDirty ? "primary" : undefined}
        onClick={submit}
      >
        Submit
      </Button>
    </>
  );
}

function StageProgressionLink() {
  const href = useHref(routableStageProgressionPath());
  return (
    <Tooltip content="Stage Progression (3840x2160)">
      <AnchorButton
        icon={<Duplicate />}
        onClick={(e) => {
          e.preventDefault();
          copyObsSource(new URL(href, document.location.href).href);
        }}
        href={href}
      />
    </Tooltip>
  );
}

function UpcomingPoolLink() {
  const href = useHref(routableUpcomingPoolPath());
  return (
    <Tooltip content="Upcoming Pool (3840x3840), crop 1500">
      <AnchorButton
        icon={<Duplicate />}
        onClick={(e) => {
          e.preventDefault();
          copyObsSource(new URL(href, document.location.href).href);
        }}
        href={href}
      />
    </Tooltip>
  );
}

const POOL_HISTORY_STAGES: { value: PoolHistoryStage; label: string }[] = [
  { value: "stage1", label: "Stage 1" },
  { value: "stage2", label: "Stage 2" },
  { value: "stage3", label: "Stage 3" },
  { value: "stage4", label: "Stage 4" },
  { value: "stage5", label: "Stage 5" },
  { value: "stage6", label: "Stage 6" },
  { value: "stage7", label: "Stage 7" },
];

/** Stage -> pool codes, recomputed only when the fetched spreadsheet data
 * changes rather than on every stage/pool selection. */
function useStagePoolCodes(): Record<PoolHistoryStage, string[]> {
  const data = useAppState((s) => s.event.tournament?.poolHistory?.data);
  return useMemo(() => {
    const map = {} as Record<PoolHistoryStage, string[]>;
    for (const { value: stage } of POOL_HISTORY_STAGES) {
      map[stage] = getPoolCodesForStage(
        data?.[stage] as string[][] | undefined,
      );
    }
    return map;
  }, [data]);
}

/** Shared by any dashboard section that needs a stage+pool picker backed
 * by the same fetched spreadsheet data (Stage Progression, Upcoming Pool,
 * ...) — only what's submitted to differs between callers. */
function StagePoolSelect({
  savedStage,
  savedPool,
  onSubmit,
}: {
  savedStage: PoolHistoryStage;
  savedPool: string;
  onSubmit: (selection: { stage: PoolHistoryStage; pool: string }) => void;
}) {
  const dispatch = useAppDispatch();
  const lastFetched = useAppState(
    (s) => s.event.tournament?.poolHistory?.lastFetched,
  );
  const stagePoolCodes = useStagePoolCodes();
  const [selectedStage, setSelectedStage] =
    useState<PoolHistoryStage>(savedStage);
  const [selectedPool, setSelectedPool] = useState(savedPool);
  const [isFetching, setIsFetching] = useState(false);
  const isDirty = selectedStage !== savedStage || selectedPool !== savedPool;
  // ticks once/sec purely to keep the "time ago" text below live
  useCurrentTime();

  const poolCodes = stagePoolCodes[selectedStage];

  const fetchData = async () => {
    setIsFetching(true);
    try {
      const results = await Promise.all(
        POOL_HISTORY_STAGES.map(async ({ value: stage }) => {
          const data = await fetchStageRows(stage);
          return [stage, data] as const;
        }),
      );
      dispatch(
        eventSlice.actions.setPoolHistoryData({
          data: Object.fromEntries(results),
          lastFetched: new Date().toISOString(),
        }),
      );
    } catch (e) {
      console.warn("failed to fetch pool history spreadsheet data", e);
      toaster.show({
        message: "Failed to fetch pool history data from the spreadsheet",
        intent: "danger",
      });
    } finally {
      setIsFetching(false);
    }
  };

  return (
    <>
      <div className={styles.formRow}>
        <HTMLSelect
          value={selectedStage}
          onChange={(e) => {
            const stage = e.currentTarget.value as PoolHistoryStage;
            setSelectedStage(stage);
            setSelectedPool(stagePoolCodes[stage][0] ?? "");
          }}
        >
          {POOL_HISTORY_STAGES.map(({ value, label }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </HTMLSelect>
        <HTMLSelect
          value={selectedPool}
          onChange={(e) => setSelectedPool(e.currentTarget.value)}
        >
          {poolCodes.length === 0 && (
            <option value="" disabled>
              --
            </option>
          )}
          {poolCodes.map((code) => (
            <option key={code} value={code}>
              {code}
            </option>
          ))}
        </HTMLSelect>
        <Button
          disabled={!isDirty}
          intent={isDirty ? "primary" : undefined}
          onClick={() =>
            onSubmit({ stage: selectedStage, pool: selectedPool })
          }
        >
          Submit
        </Button>
        <Button loading={isFetching} onClick={fetchData}>
          Fetch
        </Button>
      </div>
      <div style={{ fontSize: "0.85em", opacity: 0.7 }}>
        Last updated:{" "}
        {lastFetched
          ? `${formatLastFetched(lastFetched)} (${formatTimeAgo(lastFetched)})`
          : "never"}
      </div>
    </>
  );
}

function StageProgressionSelect() {
  const dispatch = useAppDispatch();
  const savedStage = useAppState(
    (s) => s.event.tournament?.stageProgression?.selectedStage ?? "stage1",
  );
  const savedPool = useAppState(
    (s) => s.event.tournament?.stageProgression?.selectedPool ?? "",
  );
  return (
    <StagePoolSelect
      savedStage={savedStage}
      savedPool={savedPool}
      onSubmit={(selection) =>
        dispatch(eventSlice.actions.setStageProgressionSelection(selection))
      }
    />
  );
}

function UpcomingPoolSelect() {
  const dispatch = useAppDispatch();
  const savedStage = useAppState(
    (s) => s.event.tournament?.upcomingPool?.selectedStage ?? "stage1",
  );
  const savedPool = useAppState(
    (s) => s.event.tournament?.upcomingPool?.selectedPool ?? "",
  );
  return (
    <StagePoolSelect
      savedStage={savedStage}
      savedPool={savedPool}
      onSubmit={(selection) =>
        dispatch(eventSlice.actions.setUpcomingPoolSelection(selection))
      }
    />
  );
}

function formatLastFetched(iso: string): string {
  const zoned = new Date(
    new Date(iso).toLocaleString("en-US", { timeZone: EASTERN_TIME_ZONE }),
  );
  return `${format(zoned, "M/d/yyyy h:mm:ss a")} ET`;
}

function Sources() {
  const [currentEdit, setCurrentEdit] = useState<string | null>(null);
  const labels = useAppState((s) => s.event.obsLabels);
  const dispatch = useAppDispatch();

  return (
    <div className={styles.formStack}>
      <Card className={styles.autoWidthSection}>
        <EditDialog sourceId={currentEdit} close={() => setCurrentEdit(null)} />
        <H3>
          Sources{" "}
          <Button
            icon={<Add />}
            onClick={() => setCurrentEdit(nanoid())}
          ></Button>
        </H3>
        <CardList>
          {Object.entries(labels).map(([id, { label, value, labelType }]) => (
            <LabelCard
              key={id}
              id={id}
              label={label}
              value={value}
              labelType={labelType}
              onEdit={() => setCurrentEdit(id)}
              onDelete={() =>
                dispatch(eventSlice.actions.removeLabel({ id }))
              }
            />
          ))}
        </CardList>
      </Card>
      <Card className={styles.autoWidthSection}>
        <H3>
          Upcoming Pool <UpcomingPoolLink />
        </H3>
        <UpcomingPoolSelect />
      </Card>
      <Card className={styles.autoWidthSection}>
        <LowerThirdEditor />
      </Card>
      <Card className={styles.autoWidthSection}>
        <CardDrawPhaseSelect />
      </Card>
      <Card className={styles.autoWidthSection}>
        <H3>
          Stage Progression <StageProgressionLink />
        </H3>
        <StageProgressionSelect />
      </Card>
      <Card className={styles.autoWidthSection}>
        <ChartLeaderboardSelect />
      </Card>
      <OtherSources />
      <CssEditor />
    </div>
  );
}

function isEventState(value: unknown): value is EventState {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }
  const v = value as Record<string, unknown>;
  return (
    typeof v.eventName === "string" &&
    typeof v.cabs === "object" &&
    v.cabs !== null &&
    typeof v.tournament === "object" &&
    v.tournament !== null &&
    typeof v.obsLabels === "object" &&
    v.obsLabels !== null &&
    typeof v.obsCss === "string"
  );
}

function ImportExport() {
  const dispatch = useAppDispatch();
  const eventState = useAppState((s) => s.event);
  const [fileName, setFileName] = useState<string | null>(null);
  const [parsed, setParsed] = useState<EventState | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);

  function handleExport() {
    const json = JSON.stringify(eventState, null, 2);
    const dataUrl = `data:application/json;charset=utf-8,${encodeURIComponent(json)}`;
    const safeName = (eventState.eventName || "event").replace(
      /[^a-z0-9-_]+/gi,
      "_",
    );
    downloadDataUrl(
      dataUrl,
      `${safeName}-export-${new Date().toISOString().slice(0, 10)}.json`,
    );
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setFileName(file.name);
    setParsed(null);
    setParseError(null);
    file
      .text()
      .then((text) => {
        const data = JSON.parse(text);
        if (!isEventState(data)) {
          throw new Error(
            "File does not look like an event export (missing expected fields).",
          );
        }
        setParsed(data);
      })
      .catch((err) => {
        setParseError(err instanceof Error ? err.message : String(err));
      });
  }

  function commitImport() {
    if (!parsed) return;
    if (
      confirm(
        "This will replace ALL current event data (sources, players, schedule, lobby settings, etc.) with the contents of the imported file. This cannot be undone. Continue?",
      )
    ) {
      dispatch(eventSlice.actions.replaceState(parsed));
      toaster.show({ message: "Event data imported.", intent: "success" });
      setParsed(null);
      setFileName(null);
    }
  }

  return (
    <section className={styles.autoWidthSection}>
      <H3>Export</H3>
      <p>
        Download the entire current event state (sources, players, schedule,
        lobby settings, etc.) as a JSON file.
      </p>
      <Button icon={<Download />} onClick={handleExport}>
        Export event data
      </Button>

      <Divider />

      <H3>Import</H3>
      <p>
        Select a previously exported JSON file to preview, then commit it to
        replace the current event data.
      </p>
      <FileInput
        text={fileName ?? "Choose .json file..."}
        hasSelection={!!fileName}
        inputProps={{ accept: "application/json,.json" }}
        onInputChange={handleFileChange}
      />
      {parseError && (
        <Callout intent="danger" icon={<WarningSign />} style={{ marginTop: 8 }}>
          Failed to read file: {parseError}
        </Callout>
      )}
      {parsed && (
        <>
          <H4>Preview</H4>
          <Card className={styles.importPreview}>
            <pre>{JSON.stringify(parsed, null, 2)}</pre>
          </Card>
          <Button
            icon={<Upload />}
            intent="danger"
            onClick={commitImport}
            style={{ marginTop: 8 }}
          >
            Commit Import
          </Button>
        </>
      )}
    </section>
  );
}

function isCardDrawPhase(value: string): value is CardDrawPhase {
  return value === "pools" || value === "de-bo3" || value === "de-bo5";
}

function CardDrawPhaseSelect() {
  const dispatch = useAppDispatch();
  const savedPhase = useAppState((s) => s.event.tournament?.cardDrawPhase);
  const [localPhase, setLocalPhase] = useState(savedPhase);
  const isDirty = localPhase !== savedPhase;

  return (
    <FormGroup label="Card Draw Phase">
      <div className={styles.formRow}>
        <RadioGroup
          inline
          selectedValue={localPhase}
          onChange={(e) => {
            const { value } = e.currentTarget;
            if (isCardDrawPhase(value)) {
              setLocalPhase(value);
            }
          }}
        >
          <Radio label="Pools" value="pools" />
          <Radio label="DE BO3" value="de-bo3" />
          <Radio label="DE BO5" value="de-bo5" />
        </RadioGroup>
        <Button
          disabled={!isDirty}
          intent={isDirty ? "primary" : undefined}
          onClick={() =>
            dispatch(eventSlice.actions.setCardDrawPhase(localPhase!))
          }
        >
          Submit
        </Button>
      </div>
    </FormGroup>
  );
}

type SongOption = { value: string; label: string };

function fuzzyMatch(query: string, item: SongOption): boolean {
  const q = query.toLowerCase();
  const s = item.label.toLowerCase();
  let qi = 0;
  for (let si = 0; si < s.length && qi < q.length; si++) {
    if (s[si] === q[qi]) qi++;
  }
  return qi === q.length;
}

function ChartLeaderboardSelect() {
  const dispatch = useAppDispatch();
  const gameData = useStockGameData("storm2026");
  const savedChartLeaderboard = useAppState(
    (s) => s.event.tournament?.chartLeaderboard ?? "",
  );
  const [localChartLeaderboard, setLocalChartLeaderboard] = useState(
    savedChartLeaderboard,
  );
  const isDirty = localChartLeaderboard !== savedChartLeaderboard;
  const href = useHref(routableChartLeaderboardPath());

  const songOptions: SongOption[] = (gameData?.songs ?? [])
    .filter((song) => song.folder)
    .map((song) => ({
      value: song.folder!,
      label: song.name_translation || song.name,
    }));

  return (
    <FormGroup label="Chart Leaderboard">
      <div className={styles.formRow}>
        <Suggest<SongOption>
          items={songOptions}
          resetOnClose
          inputProps={{ className: styles.chartLeaderboardInput }}
          selectedItem={
            songOptions.find((option) => option.value === localChartLeaderboard) ??
            null
          }
          itemPredicate={(query, item) => fuzzyMatch(query, item)}
          itemRenderer={(item, { handleClick, handleFocus, modifiers }) => (
            <MenuItem
              key={item.value}
              text={item.label}
              active={modifiers.active}
              disabled={modifiers.disabled}
              onClick={handleClick}
              onFocus={handleFocus}
            />
          )}
          onItemSelect={(item) => setLocalChartLeaderboard(item.value)}
          inputValueRenderer={(item) => item.label}
          noResults={<MenuItem disabled text="No matching songs" />}
        />
        <Button
          disabled={!isDirty}
          intent={isDirty ? "primary" : undefined}
          onClick={() =>
            dispatch(
              eventSlice.actions.setChartLeaderboard(localChartLeaderboard),
            )
          }
        >
          Submit
        </Button>
        <AnchorButton
          icon={<Duplicate />}
          onClick={(e) => {
            e.preventDefault();
            copyObsSource(new URL(href, document.location.href).href);
          }}
          href={href}
        />
      </div>
    </FormGroup>
  );
}

function LowerThirdEditor() {
  const dispatch = useAppDispatch();
  const saved = useAppState(
    (s) =>
      s.event.tournament?.lowerThird ?? { title: "", line1: "", line2: "" },
  );
  const [title, setTitle] = useState(saved.title);
  const [line1, setLine1] = useState(saved.line1);
  const [line2, setLine2] = useState(saved.line2);
  const isDirty =
    title !== saved.title || line1 !== saved.line1 || line2 !== saved.line2;
  const href = useHref(routableLowerThirdPath());
  const toggled = useAppState(
    (s) => s.event.tournament?.toggleLowerThird ?? false,
  );

  const submit = () => {
    dispatch(eventSlice.actions.updateLowerThird({ title, line1, line2 }));
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === "Enter" && !e.altKey && !e.ctrlKey && !e.shiftKey && !e.metaKey) {
      submit();
    }
  };

  return (
    <>
      <H3>
        Lower Third{" "}
        <Tooltip content="Lower Third (3840x2160)">
          <AnchorButton
            icon={<Duplicate />}
            onClick={(e) => {
              e.preventDefault();
              copyObsSource(new URL(href, document.location.href).href);
            }}
            href={href}
          />
        </Tooltip>
      </H3>
      <div className={styles.formRow}>
        <FormGroup label="Title">
          <InputGroup
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </FormGroup>
        <FormGroup label="Line 1">
          <InputGroup
            value={line1}
            onChange={(e) => setLine1(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </FormGroup>
        <FormGroup label="Line 2">
          <InputGroup
            value={line2}
            onChange={(e) => setLine2(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </FormGroup>
        <Button
          disabled={!isDirty}
          intent={isDirty ? "primary" : undefined}
          onClick={submit}
        >
          Submit
        </Button>
        <Button
          onClick={() =>
            dispatch(eventSlice.actions.setToggleLowerThird(!toggled))
          }
        >
          Show
        </Button>
      </div>
    </>
  );
}

function LabelCard(props: {
  id: string;
  label: string;
  value: string;
  labelType?: ObsLabelType;
  onEdit(this: void): void;
  onDelete(this: void): void;
}) {
  const href = useHref(routableGlobalSourcePath(props.id));
  return (
    <Card className={styles.textSourceCard}>
      <div>
        <p>
          {props.label} [{props.labelType ?? "dialog"}]
        </p>
        <H4 className={styles.textSourceValue}>{props.value}</H4>
      </div>
      <ButtonGroup>
        <Button icon={<Edit />} onClick={props.onEdit} />
        <AnchorButton
          icon={<Duplicate />}
          onClick={(e) => {
            e.preventDefault();
            copyObsSource(new URL(href, document.location.href).href);
          }}
          href={href}
        />
        <Button
          icon={<Trash />}
          intent="danger"
          onClick={() => {
            if (
              confirm(
                `Delete the "${props.label}" text source? This cannot be undone.`,
              )
            ) {
              props.onDelete();
            }
          }}
        />
      </ButtonGroup>
    </Card>
  );
}

function EditDialog({
  sourceId,
  close,
}: {
  sourceId: string | null;
  close(this: void): void;
}) {
  const label = useAppState((s) =>
    sourceId ? s.event.obsLabels[sourceId] : null
  ) || { label: "", value: "", labelType: undefined, textAlign: undefined };
  const dispatch = useAppDispatch();
  const nameInput = useRef<HTMLInputElement>(null);
  const valueInput = useRef<HTMLTextAreaElement>(null);
  const [labelType, setLabelType] = useState<ObsLabelType>(
    label.labelType ?? "dialog",
  );
  const [textAlign, setTextAlign] = useState<ObsTextAlign>(
    label.textAlign ?? "center",
  );
  if (!label || !sourceId) {
    return null;
  }
  const submit = () => {
    dispatch(
      eventSlice.actions.updateLabel({
        id: sourceId,
        label: nameInput.current?.value || "",
        value: valueInput.current?.value || "",
        labelType,
        textAlign,
      })
    );
    close();
  };
  const handleInputKeydown: React.KeyboardEventHandler<
    HTMLInputElement | HTMLTextAreaElement
  > = (e) => {
    if (e.key === "Enter" && e.ctrlKey) {
      e.preventDefault();
      submit();
    }
  };
  return (
    <Dialog isOpen={!!sourceId} title="Edit Custom OBS label" onClose={close}>
      <DialogBody>
        <form action={submit}>
          <FormGroup label="Label Name">
            <InputGroup
              inputRef={nameInput}
              defaultValue={label.label}
              onKeyDown={handleInputKeydown}
            />
          </FormGroup>
          <FormGroup label="Value">
            <TextArea
              inputRef={valueInput}
              defaultValue={label.value}
              onKeyDown={handleInputKeydown}
              fill
              autoResize
            />
          </FormGroup>
          <FormGroup label="Type">
            <HTMLSelect
              value={labelType}
              onChange={(e) => setLabelType(e.target.value as ObsLabelType)}
            >
              <option value="dialog">Dialog</option>
              <option value="title">Title</option>
            </HTMLSelect>
          </FormGroup>
          <FormGroup label="Alignment">
            <HTMLSelect
              value={textAlign}
              onChange={(e) => setTextAlign(e.target.value as ObsTextAlign)}
            >
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
            </HTMLSelect>
          </FormGroup>
        </form>
      </DialogBody>
      <DialogFooter
        actions={
          <>
            <Button onClick={close}>Cancel</Button>
            <Button intent="primary" onClick={submit}>
              Save
            </Button>
          </>
        }
      />
    </Dialog>
  );
}

function MatchLogPanel() {
  const patchMatch = useMatchLogStore((s) => s.patchMatch);
  const [editingMatch, setEditingMatch] = useState<Match | null>(null);
  const [labelText, setLabelText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleLabelSubmit() {
    if (!editingMatch) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(
        `http://${SYNCSTART_URL}:${SYNCSTART_PORT}/match/${editingMatch.id}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ label: labelText || null }),
        },
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const updated: Match = await res.json();
      patchMatch(updated);
      setEditingMatch(null);
      toaster.show({ message: "Match label updated.", intent: "success" });
    } catch {
      toaster.show({ message: "Failed to update match label.", intent: "danger" });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <MatchLog
        onLabelEdit={(match) => {
          setEditingMatch(match);
          setLabelText(match.label ?? "");
        }}
      />
      <Dialog
        isOpen={editingMatch !== null}
        onClose={() => setEditingMatch(null)}
        title="Edit Match Label"
      >
        <DialogBody>
          <FormGroup label="Label">
            <InputGroup
              autoFocus
              disabled={isSubmitting}
              value={labelText}
              onChange={(e) => setLabelText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.altKey && !e.ctrlKey && !e.metaKey) {
                  void handleLabelSubmit();
                }
              }}
            />
          </FormGroup>
        </DialogBody>
        <DialogFooter
          actions={
            <Button intent="primary" loading={isSubmitting} onClick={() => void handleLabelSubmit()}>
              Submit
            </Button>
          }
        />
      </Dialog>
    </>
  );
}

function CssEditor() {
  const cleanDoc = useAppState((s) => s.event.obsCss);
  const [isDirty, setIsDirty] = useState(false);
  const [localDoc, setLocalDoc] = useState(cleanDoc);
  const dispatch = useAppDispatch();
  const theme = useTheme();

  return (
    <Card>
      <H3>
        Global OBS Source Styles{" "}
        <Button
          icon={<FloppyDisk />}
          disabled={!isDirty}
          intent={isDirty ? "primary" : undefined}
          onClick={() => {
            dispatch(eventSlice.actions.updateObsCss(localDoc));
            setIsDirty(false);
          }}
        />
      </H3>
      <ReactCodeMirror
        height="200"
        minHeight="5"
        theme={theme}
        value={isDirty ? localDoc : cleanDoc}
        extensions={[css()]}
        onChange={(newDoc) => {
          if (newDoc === cleanDoc) {
            setIsDirty(false);
          } else {
            setIsDirty(true);
          }
          setLocalDoc(newDoc);
        }}
      />
    </Card>
  );
}

function OtherSources() {
  return (
    <Card className={styles.autoWidthSection}>
      <H3>Other Sources</H3>
      <CardList>
        <OtherSourceCard label="Persona 3 Circle (3840x2160)" path={routablePersona3CirclePath()} />
        <OtherSourceCard label="Triangles (3840x2160)" path={routableTrianglesPath()} />
        <OtherSourceCard label="VS Meter (EX Delta) (3840x2160)" path={routableVsMeterPath()} />
        <CurrentTimeCard />
        <OtherSourceCard label="Bracket (3840x2160)" path={routableBracketPath()} />
        <OtherSourceCard label="Stars (3840x2160)" path={routableStarsPath()} />
      </CardList>
    </Card>
  );
}

function OtherSourceCard(props: { label: string; path: string }) {
  const href = useHref(props.path);
  return (
    <Card className={styles.otherSourceCard}>
      <AnchorButton
        icon={<Duplicate />}
        onClick={(e) => {
          e.preventDefault();
          copyObsSource(new URL(href, document.location.href).href);
        }}
        href={href}
      />
      <p>{props.label}</p>
    </Card>
  );
}

function CurrentTimeCard() {
  const now = useCurrentTime();
  const [applyStroke, setApplyStroke] = useState(false);
  const href = useHref(routableCurrentTimePath());

  return (
    <Card className={styles.otherSourceCard}>
      <AnchorButton
        icon={<Duplicate />}
        onClick={(e) => {
          e.preventDefault();
          const url = new URL(href, document.location.href);
          if (applyStroke) {
            url.searchParams.set("stroke", "true");
          }
          copyObsSource(url.href);
        }}
        href={href}
      />
      <p>{formatDate(now, "currentTime")}</p>
      <Checkbox
        label="Apply text stroke"
        checked={applyStroke}
        onChange={(e) => setApplyStroke(e.currentTarget.checked)}
      />
    </Card>
  );
}
