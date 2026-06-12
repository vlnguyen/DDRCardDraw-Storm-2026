import {
  AnchorButton,
  Button,
  ButtonGroup,
  Card,
  CardList,
  Dialog,
  DialogBody,
  DialogFooter,
  FormGroup,
  H3,
  H4,
  InputGroup,
  Tab,
  Tabs,
} from "@blueprintjs/core";
import { Add, Duplicate, Edit, FloppyDisk } from "@blueprintjs/icons";
import { css } from "@codemirror/lang-css";
import ReactCodeMirror from "@uiw/react-codemirror";
import { nanoid } from "nanoid";
import React, { useRef, useState } from "react";
import { useHref } from "react-router-dom";
import { eventSlice } from "../../state/event.slice";
import { useAppDispatch, useAppState } from "../../state/store";
import { useTheme } from "../../theme-toggle";
import { copyObsSource, routableGlobalSourcePath } from "../copy-obs-source";
import styles from "./dashboard.css";
import { LobbyRankings } from "./lobby-rankings";
import { MatchLog } from "./match-log";

type DashboardTabId = "obs-text-sources" | "lobby-rankings" | "match-log";

export function Dashboard() {
  const [currentTab, setCurrentTab] =
    useState<DashboardTabId>("obs-text-sources");

  return (
    <div className={styles.container}>
      <Tabs
        id="dashboard"
        size="large"
        selectedTabId={currentTab}
        onChange={(newTabId: DashboardTabId) => setCurrentTab(newTabId)}
      >
        <Tab id="obs-text-sources" panel={<ObsTextSources />}>
          OBS Text Sources
        </Tab>
        <Tab id="lobby-rankings" panel={<LobbyRankings />}>
          Lobby Rankings
        </Tab>
        <Tab id="match-log" panel={<MatchLog />}>
          Match Log
        </Tab>
      </Tabs>
    </div>
  );
}

function ObsTextSources() {
  const [currentEdit, setCurrentEdit] = useState<string | null>(null);
  const labels = useAppState((s) => s.event.obsLabels);

  return (
    <>
      <section style={{ maxWidth: "600px" }}>
        <EditDialog sourceId={currentEdit} close={() => setCurrentEdit(null)} />
        <H3>
          OBS Text Sources{" "}
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
      <CssEditor />
    </>
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
