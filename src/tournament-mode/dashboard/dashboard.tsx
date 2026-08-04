import {
  AnchorButton,
  Button,
  ButtonGroup,
  Card,
  CardList,
  Dialog,
  DialogBody,
  DialogFooter,
  Divider,
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
import { Add, Duplicate, Edit, FloppyDisk, Plus, Trash } from "@blueprintjs/icons";
import { css } from "@codemirror/lang-css";
import ReactCodeMirror from "@uiw/react-codemirror";
import { nanoid } from "nanoid";
import React, { useMemo, useRef, useState } from "react";
import { useHref } from "react-router-dom";
import {
  type CardDrawPhase,
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
  routablePoolHistoryLabelPath,
  routablePoolHistoryPath,
  routableSchedulePath,
  routableStarsPath,
  routableTrianglesPath,
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

type DashboardTabId =
  | "sources"
  | "lobbies"
  | "match-log"
  | "players"
  | "schedule";

export function Dashboard() {
  const [currentTab, setCurrentTab] =
    useState<DashboardTabId>("sources");
  const matchCount = useMatchLogStore((s) => s.matches.length);
  const lobbyCount = useLobbiesStore((s) => s.lobbies.length);

  return (
    <div className={styles.container}>
      <Tabs
        id="dashboard"
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

function ScheduleDayLink({ day, label }: { day: ScheduleDay; label: string }) {
  const href = useHref(routableSchedulePath(day));
  return (
    <AnchorButton
      icon={<Duplicate />}
      onClick={(e) => {
        e.preventDefault();
        copyObsSource(new URL(href, document.location.href).href);
      }}
      href={href}
    >
      {label}
    </AnchorButton>
  );
}

function Schedule() {
  const [currentDay, setCurrentDay] = useState<ScheduleDay>("fri");

  return (
    <section className={styles.autoWidthSection}>
      <H3>Schedule</H3>
      <div className={styles.formRow}>
        {SCHEDULE_DAYS.map(({ id, label }) => (
          <ScheduleDayLink key={id} day={id} label={label} />
        ))}
      </div>
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

function PoolHistoryLink() {
  const href = useHref(routablePoolHistoryPath());
  return (
    <Tooltip content="Table view">
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

function PoolHistoryLabelLink() {
  const href = useHref(routablePoolHistoryLabelPath());
  return (
    <Tooltip content="Selected pool label">
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

function formatLastFetched(iso: string): string {
  const zoned = new Date(
    new Date(iso).toLocaleString("en-US", { timeZone: EASTERN_TIME_ZONE }),
  );
  return `${format(zoned, "M/d/yyyy h:mm:ss a")} ET`;
}

interface PoolOption {
  value: string;
  label: string;
  stage: PoolHistoryStage;
  poolCode: string;
}

function usePoolHistoryOptions(): PoolOption[] {
  const data = useAppState((s) => s.event.tournament?.poolHistory?.data);
  return useMemo(() => {
    const options: PoolOption[] = [];
    for (const { value: stage, label: stageLabel } of POOL_HISTORY_STAGES) {
      for (const poolCode of getPoolCodesForStage(data?.[stage])) {
        options.push({
          value: `${stage}:${poolCode}`,
          label: `${stageLabel} - Pool ${poolCode}`,
          stage,
          poolCode,
        });
      }
    }
    return options;
  }, [data]);
}

function PoolHistorySelect() {
  const dispatch = useAppDispatch();
  const saved = useAppState(
    (s) =>
      s.event.tournament?.poolHistory?.selection ?? {
        stage: "stage1" as PoolHistoryStage,
        poolCode: "",
      },
  );
  const lastFetched = useAppState(
    (s) => s.event.tournament?.poolHistory?.lastFetched,
  );
  const poolOptions = usePoolHistoryOptions();
  const savedValue = saved.poolCode ? `${saved.stage}:${saved.poolCode}` : "";
  const [selectedValue, setSelectedValue] = useState(savedValue);
  const [isFetching, setIsFetching] = useState(false);
  const isDirty = selectedValue !== savedValue;
  // ticks once/sec purely to keep the "time ago" text below live
  useCurrentTime();

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
    <FormGroup label="Pool">
      <div className={styles.formRow}>
        <HTMLSelect
          value={selectedValue}
          onChange={(e) => setSelectedValue(e.currentTarget.value)}
        >
          <option value="" disabled>
            {poolOptions.length
              ? "Select a pool"
              : "--"}
          </option>
          {poolOptions.map(({ value, label }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </HTMLSelect>
        <Button
          disabled={!isDirty}
          intent={isDirty ? "primary" : undefined}
          onClick={() => {
            const selected = poolOptions.find(
              (option) => option.value === selectedValue,
            );
            if (!selected) return;
            dispatch(
              eventSlice.actions.setPoolHistorySelection({
                stage: selected.stage,
                poolCode: selected.poolCode,
              }),
            );
          }}
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
    </FormGroup>
  );
}

function Sources() {
  const [currentEdit, setCurrentEdit] = useState<string | null>(null);
  const labels = useAppState((s) => s.event.obsLabels);

  return (
    <>
      <section className={styles.autoWidthSection}>
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
            />
          ))}
        </CardList>
      </section>
      <section>
        <CardDrawPhaseSelect />
      </section>
      <section>
        <ChartLeaderboardSelect />
      </section>
      <section>
        <LowerThirdEditor />
      </section>
      <section className={styles.autoWidthSection}>
        <H3>
          Pool History <PoolHistoryLink /> <PoolHistoryLabelLink />
        </H3>
        <PoolHistorySelect />
      </section>
      <Divider />
      <CssEditor />
      <OtherSources />
    </>
  );
}

function isCardDrawPhase(value: string): value is CardDrawPhase {
  return value === "pools" || value === "de";
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
          <Radio label="Double Elimination" value="de" />
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
        <AnchorButton
          icon={<Duplicate />}
          onClick={(e) => {
            e.preventDefault();
            copyObsSource(new URL(href, document.location.href).href);
          }}
          href={href}
        />
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
    <section>
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
    </section>
  );
}

function OtherSources() {
  const now = useCurrentTime();

  return (
    <section className={styles.autoWidthSection}>
      <H3>Other Sources</H3>
      <CardList>
        <OtherSourceCard label="Persona 3 Circle (3840x2160)" path={routablePersona3CirclePath()} />
        <OtherSourceCard label="Triangles (3840x2160)" path={routableTrianglesPath()} />
        <OtherSourceCard label="VS Meter (EX Delta) (3840x2160)" path={routableVsMeterPath()} />
        <OtherSourceCard
          label={formatDate(now, "currentTime")}
          path={routableCurrentTimePath()}
        />
        <OtherSourceCard label="Bracket (3840x2160)" path={routableBracketPath()} />
        <OtherSourceCard label="Stars (3840x2160)" path={routableStarsPath()} />
      </CardList>
    </section>
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
