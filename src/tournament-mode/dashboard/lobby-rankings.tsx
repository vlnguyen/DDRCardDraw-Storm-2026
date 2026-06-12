import { Button, FormGroup, H3, InputGroup } from "@blueprintjs/core";
import { useEffect, useState } from "react";
import { useLiveRankings } from "../../obs-sources/useLiveRankings";
import { eventSlice } from "../../state/event.slice";
import { useAppDispatch, useAppState } from "../../state/store";
import { toaster } from "../../toaster";
import styles from "./lobby-rankings.css";

export function LobbyRankings() {
  const lobbyConnection = useAppState(
    (s) => s.event.tournament?.lobbyConnection
  );
  const dispatch = useAppDispatch();
  const gameState = useLiveRankings("Stream Dashboard");

  const [url, setUrl] = useState(lobbyConnection?.url ?? "");
  const [port, setPort] = useState(lobbyConnection?.port?.toString() ?? "");
  const [code, setCode] = useState(lobbyConnection?.code ?? "");
  const [password, setPassword] = useState(lobbyConnection?.password ?? "");

  useEffect(() => {
    if (lobbyConnection) {
      setUrl(lobbyConnection.url ?? "");
      setPort(lobbyConnection.port?.toString() ?? "");
      setCode(lobbyConnection.code ?? "");
      setPassword(lobbyConnection.password ?? "");
    }
  }, [lobbyConnection]);

  const submit = () => {
    dispatch(
      eventSlice.actions.updateLobbyConnection({
        url,
        port: Number(port) || 0,
        code,
        password,
      })
    );
    toaster.show({
      message: "Lobby connection info has been updated.",
      intent: "success",
    });
  };

  return (
    <div className={styles.lobbyRankings}>
      <section className={styles.lobbyConnectionInfo}>
        <H3>Lobby Connection Info</H3>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
        >
          <FormGroup label="URL">
            <InputGroup value={url} onChange={(e) => setUrl(e.target.value)} />
          </FormGroup>
          <FormGroup label="Port">
            <InputGroup
              type="number"
              value={port}
              onChange={(e) => setPort(e.target.value)}
            />
          </FormGroup>
          <FormGroup label="Code">
            <InputGroup
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
          </FormGroup>
          <FormGroup label="Password">
            <InputGroup
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </FormGroup>
          <Button type="submit" intent="primary">
            Submit
          </Button>
        </form>
      </section>
      <section className={styles.lobbyState}>
        <H3>Lobby State</H3>
        <pre>{JSON.stringify(gameState, null, 2)}</pre>
      </section>
    </div>
  );
}
