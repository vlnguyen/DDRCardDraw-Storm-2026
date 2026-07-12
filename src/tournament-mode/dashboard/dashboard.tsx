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
  InputGroup,
  MenuItem,
  Tab,
  Tabs,
} from "@blueprintjs/core";
import { Suggest } from "@blueprintjs/select";
import { Add, Duplicate, Edit, FloppyDisk } from "@blueprintjs/icons";
import { css } from "@codemirror/lang-css";
import ReactCodeMirror from "@uiw/react-codemirror";
import { nanoid } from "nanoid";
import React, { useRef, useState } from "react";
import { useHref } from "react-router-dom";
import { eventSlice } from "../../state/event.slice";
import { useStockGameData } from "../../state/game-data.atoms";
import { useAppDispatch, useAppState } from "../../state/store";
import { useTheme } from "../../theme-toggle";
import {
  copyObsSource,
  routableChartLeaderboardPath,
  routableGlobalSourcePath,
} from "../copy-obs-source";
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
  | "players";

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
      </Tabs>
    </div>
  );
}

function Sources() {
  const [currentEdit, setCurrentEdit] = useState<string | null>(null);
  const labels = useAppState((s) => s.event.obsLabels);

  return (
    <>
      <section style={{ maxWidth: "600px" }}>
        <EditDialog sourceId={currentEdit} close={() => setCurrentEdit(null)} />
        <H3>
          Sources{" "}
          <Button
            icon={<Add />}
            onClick={() => setCurrentEdit(nanoid())}
          ></Button>
        </H3>
        <CardList>
          {Object.entries(labels).map(([id, { label, value }]) => (
            <LabelCard
              key={id}
              id={id}
              label={label}
              value={value}
              onEdit={() => setCurrentEdit(id)}
            />
          ))}
        </CardList>
      </section>
      <section>
        <ChartLeaderboardSelect />
      </section>
      <Divider />
      <CssEditor />
    </>
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
      <div className={styles.chartLeaderboardRow}>
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

function LabelCard(props: {
  id: string;
  label: string;
  value: string;
  onEdit(this: void): void;
}) {
  const href = useHref(routableGlobalSourcePath(props.id));
  return (
    <Card className={styles.textSourceCard}>
      <div>
        <p>{props.label}</p>
        <H4>{props.value}</H4>
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
  ) || { label: "", value: "" };
  const dispatch = useAppDispatch();
  const nameInput = useRef<HTMLInputElement>(null);
  const valueInput = useRef<HTMLInputElement>(null);
  if (!label || !sourceId) {
    return null;
  }
  const submit = () => {
    dispatch(
      eventSlice.actions.updateLabel({
        id: sourceId,
        label: nameInput.current?.value || "",
        value: valueInput.current?.value || "",
      })
    );
    close();
  };
  const handleInputKeydown: React.KeyboardEventHandler<HTMLInputElement> = (
    e
  ) => {
    if (
      e.key === "Enter" &&
      !e.altKey &&
      !e.ctrlKey &&
      !e.shiftKey &&
      !e.metaKey
    ) {
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
            <InputGroup
              inputRef={valueInput}
              defaultValue={label.value}
              onKeyDown={handleInputKeydown}
            />
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
