import { AnchorButton, Button, Card, Checkbox, Dialog, DialogBody, FormGroup, H3, HTMLSelect, InputGroup, MenuItem, Radio, RadioGroup, Tooltip } from "@blueprintjs/core";
import {
  Desktop,
  DragHandleVertical,
  Duplicate,
  Edit,
  Minus,
  Person,
  Plus,
  Trash,
  Unlink,
} from "@blueprintjs/icons";
import { Suggest } from "@blueprintjs/select";
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { useHref } from "react-router-dom";
import { List, arrayMove, type IItemProps } from "react-movable";
import { PoolPlayer, PoolPlayerScore, PoolState } from "../../state/event.slice";
import { toaster } from "../../toaster";
import { eventSlice } from "../../state/event.slice";
import { useAppDispatch, useAppState } from "../../state/store";
import entrants from "../../assets/entrants/entrants.json";
import { useLiveRankings } from "../../obs-sources/useLiveRankings";
import {
  copyObsSource,
  routablePoolPlayerNamePath,
  routablePoolSongCounterPath,
  routablePoolsPath,
} from "../copy-obs-source";
import { MatchLog } from "./match-log";
import { LobbyStateView } from "./lobbies";
import { useLobbiesStore } from "./lobbies.store";
import { poolSongCounterText } from "../../obs-sources/text";
import styles from "./players.css";

const sortedEntrants = [...entrants].sort((a, b) =>
  a.gamerTag.localeCompare(b.gamerTag),
);

const MIN_PLAYER_COUNT = 4;
const CAB_LABELS = ["Cab 1 [P1]", "Cab 1 [P2]", "Cab 2 [P1]", "Cab 2 [P2]"];

function makeEmptyPlayer(scoreCount: number): PoolPlayer {
  return {
    scores: Array.from({ length: scoreCount }, (): PoolPlayerScore => ({})),
    isEliminated: false,
    isDisabled: false,
  };
}

function padToPlayerCount(
  players: PoolPlayer[],
  scoreCount: number,
): PoolPlayer[] {
  const padded = [...players];
  while (padded.length < MIN_PLAYER_COUNT) {
    padded.push(makeEmptyPlayer(scoreCount));
  }
  return padded;
}

type EntrantOption = { value: number; label: string };

const options: EntrantOption[] = sortedEntrants.map((e) => ({
  value: e.id,
  label: e.prefix ? `${e.gamerTag} [${e.prefix}]` : e.gamerTag,
}));

function fuzzyMatch(query: string, item: EntrantOption): boolean {
  const q = query.toLowerCase();
  const s = item.label.toLowerCase();
  let qi = 0;
  for (let si = 0; si < s.length && qi < q.length; si++) {
    if (s[si] === q[qi]) qi++;
  }
  return qi === q.length;
}

function CabCell({
  cabLabel,
  cabNumber,
  playerNumber,
}: {
  cabLabel: string;
  cabNumber: 1 | 2;
  playerNumber: 1 | 2;
}) {
  const poolPlayerNameHref = useHref(
    routablePoolPlayerNamePath(cabNumber, playerNumber),
  );

  return (
    <td>
      {cabLabel}
      <div className={styles.stepStatsButton}>
        <Tooltip content="Player Name">
          <AnchorButton
            size="small"
            icon={<Duplicate />}
            href={poolPlayerNameHref}
            onClick={(e) => {
              e.preventDefault();
              copyObsSource(
                new URL(poolPlayerNameHref, document.location.href).href,
              );
            }}
          />
        </Tooltip>
      </div>
    </td>
  );
}

export function Players() {
  const dispatch = useAppDispatch();
  const poolsHref = useHref(routablePoolsPath());
  const poolSongCounterHref = useHref(routablePoolSongCounterPath());
  const savedPoolState = useAppState(
    (s) => s.event.tournament.poolState ?? {},
  );

  const lobbyConnection = useAppState(
    (s) => s.event.tournament?.lobbyConnection,
  );
  const lobbies = useLobbiesStore((s) => s.lobbies);
  const fetchLobbies = useLobbiesStore((s) => s.fetchLobbies);
  useEffect(() => {
    fetchLobbies();
  }, [fetchLobbies]);
  const selectedLobby = lobbies.find((l) => l.code === lobbyConnection?.code);
  const gameState = useLiveRankings({
    name: "Players Dashboard",
    code: selectedLobby?.code ?? "",
    password: selectedLobby?.password,
  });

  const machineIds = selectedLobby ? Object.keys(selectedLobby.machines) : [];
  const machineLabel = (id: string) => {
    const machine = selectedLobby?.machines[id];
    const names = [machine?.player1?.profileName, machine?.player2?.profileName].filter(
      (name): name is string => !!name,
    );
    return names.length ? names.join(", ") : id;
  };
  const savedCab1MachineId = useAppState(
    (s) => s.event.tournament?.machineCodeCab1 ?? "",
  );
  const savedCab2MachineId = useAppState(
    (s) => s.event.tournament?.machineCodeCab2 ?? "",
  );
  const [cab1MachineId, setCab1MachineId] = useState(savedCab1MachineId);
  const [cab2MachineId, setCab2MachineId] = useState(savedCab2MachineId);

  function getLobbyPlayerName(rowIndex: number): string {
    if (!selectedLobby) return "--";
    const machineId = rowIndex < 2 ? cab1MachineId : cab2MachineId;
    if (!machineId) return "--";
    const machine = selectedLobby.machines[machineId];
    if (!machine) return "--";
    const player = rowIndex % 2 === 0 ? machine.player1 : machine.player2;
    return player?.profileName ?? "--";
  }

  const [poolState, setPoolState] = useState<PoolState>(() => ({
    ...savedPoolState,
    players: padToPlayerCount(
      savedPoolState.players ?? [],
      (savedPoolState.songs ?? []).length,
    ),
    numPlayersAdvance: savedPoolState.numPlayersAdvance ?? 2,
    totalSongs: savedPoolState.totalSongs ?? 6,
    currentSong: savedPoolState.currentSong ?? 1,
  }));

  const players = poolState.players ?? [];
  const songs = poolState.songs ?? [];

  const [editingScore, setEditingScore] = useState<{
    playerIndex: number;
    songIndex: number;
  } | null>(null);

  const [editingLocalScore, setEditingLocalScore] = useState<PoolPlayerScore>({});
  const playersRef = useRef(players);
  playersRef.current = players;

  useEffect(() => {
    if (!editingScore) {
      setEditingLocalScore({});
      return;
    }
    const { playerIndex, songIndex } = editingScore;
    setEditingLocalScore({ exScore: 0, ...playersRef.current[playerIndex]?.scores[songIndex] });
  }, [editingScore]);

  function handleSubmit() {
    dispatch(eventSlice.actions.setPoolPlayers(players));
    dispatch(eventSlice.actions.setPoolSongs(songs));
    dispatch(
      eventSlice.actions.setCabMachines({
        cab1: cab1MachineId,
        cab2: cab2MachineId,
      }),
    );
    dispatch(
      eventSlice.actions.setPoolSettings({
        numPlayersAdvance: poolState.numPlayersAdvance,
        totalSongs: poolState.totalSongs,
        currentSong: poolState.currentSong,
      }),
    );
    toaster.show({ message: "Pool state updated.", intent: "success" });
  }

  function handleResetPlayers() {
    setPoolState((prev) => ({
      ...prev,
      players: (prev.players ?? []).map((p) => ({
        ...p,
        entrantId: undefined,
        gamerTag: undefined,
        prefix: undefined,
        isDisabled: false,
      })),
    }));
  }

  function handleMapPlayers() {
    setPoolState((prev) => ({
      ...prev,
      players: (prev.players ?? []).map((p, i) => {
        const lobbyName = getLobbyPlayerName(i);
        const entrant = sortedEntrants.find(
          (en) => en.gamerTag.toLowerCase() === lobbyName.toLowerCase(),
        );
        return entrant
          ? {
              ...p,
              entrantId: entrant.id,
              gamerTag: entrant.gamerTag,
              prefix: entrant.prefix,
            }
          : { ...p, entrantId: undefined, gamerTag: undefined, prefix: undefined };
      }),
    }));
  }

  function handleAddPlayer() {
    setPoolState((prev) => ({
      ...prev,
      players: [...(prev.players ?? []), makeEmptyPlayer((prev.songs ?? []).length)],
    }));
  }

  function handleRemovePlayer(index: number) {
    setPoolState((prev) => ({
      ...prev,
      players: (prev.players ?? []).filter((_, j) => j !== index),
    }));
  }

  function handleResetSongs() {
    setPoolState((prev) => ({
      ...prev,
      songs: [],
      players: (prev.players ?? []).map((p) => ({
        ...p,
        scores: [],
      })),
    }));
  }

  return (
    <>
      <div className={styles.lobbyState}>
        <H3>Selected Lobby{selectedLobby && ` (${selectedLobby.code})`}</H3>
        {selectedLobby ? (
          <LobbyStateView gameState={gameState} />
        ) : (
          <p>No lobby selected.</p>
        )}
      </div>
      <div className={styles.cabSelects}>
        <FormGroup label={<strong>Cab 1 Machine</strong>}>
          <HTMLSelect
            className={styles.cabSelect}
            value={cab1MachineId}
            onChange={(e) => setCab1MachineId(e.target.value)}
          >
            <option value="">--</option>
            {machineIds.map((id) => (
              <option key={id} value={id}>
                {machineLabel(id)}
              </option>
            ))}
          </HTMLSelect>
        </FormGroup>
        <FormGroup label={<strong>Cab 2 Machine</strong>}>
          <HTMLSelect
            className={styles.cabSelect}
            value={cab2MachineId}
            onChange={(e) => setCab2MachineId(e.target.value)}
          >
            <option value="">--</option>
            {machineIds.map((id) => (
              <option key={id} value={id}>
                {machineLabel(id)}
              </option>
            ))}
          </HTMLSelect>
        </FormGroup>
      </div>
      <div className={styles.poolSettings}>
        <FormGroup label={<strong>Players Advance</strong>}>
          <RadioGroup
            inline
            selectedValue={String(poolState.numPlayersAdvance)}
            onChange={(e) =>
              setPoolState((prev) => ({
                ...prev,
                numPlayersAdvance: Number(e.currentTarget.value),
              }))
            }
          >
            <Radio label="1" value="1" />
            <Radio label="2" value="2" />
          </RadioGroup>
        </FormGroup>
        <FormGroup label={<strong>Current Song</strong>}>
          <InputGroup
            type="number"
            value={
              poolState.currentSong != null ? String(poolState.currentSong) : ""
            }
            onChange={(e) =>
              setPoolState((prev) => ({
                ...prev,
                currentSong:
                  e.target.value === "" ? undefined : Number(e.target.value),
              }))
            }
          />
        </FormGroup>
        <FormGroup label={<strong>Total Songs</strong>}>
          <div className={styles.formRow}>
            <InputGroup
              type="number"
              value={
                poolState.totalSongs != null ? String(poolState.totalSongs) : ""
              }
              onChange={(e) =>
                setPoolState((prev) => ({
                  ...prev,
                  totalSongs:
                    e.target.value === "" ? undefined : Number(e.target.value),
                }))
              }
            />
            <Tooltip
              content={poolSongCounterText(
                poolState.currentSong,
                poolState.totalSongs,
              )}
            >
              <AnchorButton
                icon={<Duplicate />}
                href={poolSongCounterHref}
                onClick={(e) => {
                  e.preventDefault();
                  copyObsSource(
                    new URL(poolSongCounterHref, document.location.href).href,
                  );
                }}
              />
            </Tooltip>
          </div>
        </FormGroup>
      </div>
      <div className={styles.tablesRow}>
        <table className={styles.cabTable}>
          <thead>
            <tr>
              <th className={styles.poolsResultsCell}>
                <Tooltip content="Pools Results">
                  <AnchorButton
                    size="small"
                    icon={<Duplicate />}
                    href={poolsHref}
                    onClick={(e) => {
                      e.preventDefault();
                      copyObsSource(new URL(poolsHref, document.location.href).href);
                    }}
                  />
                </Tooltip>
              </th>
            </tr>
          </thead>
          <tbody>
            {players.map((_, i) =>
              i < CAB_LABELS.length ? (
                <tr key={i}>
                  <CabCell
                    cabLabel={CAB_LABELS[i]}
                    cabNumber={i < 2 ? 1 : 2}
                    playerNumber={i % 2 === 0 ? 1 : 2}
                  />
                </tr>
              ) : (
                <tr key={i}>
                  <td></td>
                </tr>
              ),
            )}
            <tr>
              <td>
                <Tooltip content="Add player">
                  <Button icon={<Plus />} onClick={handleAddPlayer} />
                </Tooltip>
              </td>
            </tr>
          </tbody>
        </table>
        <table className={styles.playersTable}>
          <thead>
            <tr>
              <th>Player</th>
              {songs.map((_, i) => (
              <th key={i}>
                <div className={styles.songHeader}>
                  <span>{`Song ${i + 1}`}</span>
                  <Button
                    icon={<Minus />}
                    onClick={() =>
                      setPoolState((prev) => ({
                        ...prev,
                        songs: (prev.songs ?? []).filter((_, j) => j !== i),
                        players: (prev.players ?? []).map((p) => ({
                          ...p,
                          scores: p.scores.filter((_, j) => j !== i),
                        })),
                      }))
                    }
                  />
                </div>
              </th>
            ))}
            <th>
              <Button
                icon={<Plus />}
                onClick={() =>
                  setPoolState((prev) => ({
                    ...prev,
                    songs: [...(prev.songs ?? []), ""],
                    players: (prev.players ?? []).map((p) => ({
                      ...p,
                      scores: [...p.scores, {}],
                    })),
                  }))
                }
              />{" "}
              <Button disabled={songs.length === 0} onClick={handleResetSongs}>
                Reset Songs
              </Button>
            </th>
          </tr>
        </thead>
        <List
          lockVertically
          values={players}
          onChange={({ oldIndex, newIndex }) =>
            setPoolState((prev) => ({
              ...prev,
              players: arrayMove(prev.players ?? [], oldIndex, newIndex),
            }))
          }
          renderList={({ children, props: listProps }) => (
            <tbody ref={listProps.ref}>
              {children}
              <tr>
                <td className={styles.submitCell}>
                  <Button
                    disabled={
                      players.every((p) => p.entrantId == null) &&
                      players.every((p) => !p.isDisabled)
                    }
                    onClick={handleResetPlayers}
                  >
                    Reset Players
                  </Button>{" "}
                  <Button onClick={handleMapPlayers}>Map</Button>{" "}
                  <Button onClick={handleSubmit}>Submit</Button>
                </td>
                {songs.map((_, si) => (
                  <td key={si}></td>
                ))}
                <td className={styles.resetSongsColumn}></td>
              </tr>
            </tbody>
          )}
          renderItem={({ value: player, props: itemProps, index, isDragged }) => {
            const i = index!;
            return (
              <PlayerRow
                key={itemProps.key}
                rowProps={itemProps}
                isDragged={isDragged}
                lobbyPlayerName={getLobbyPlayerName(i)}
                player={player}
                songs={songs}
                canRemove={players.length > MIN_PLAYER_COUNT}
                onRemove={() => handleRemovePlayer(i)}
                onEditScore={(songIndex: number) =>
                  setEditingScore({ playerIndex: i, songIndex })
                }
                onClearScore={(songIndex: number) =>
                  setPoolState((prev) => ({
                    ...prev,
                    players: (prev.players ?? []).map((p, j) =>
                      j !== i
                        ? p
                        : {
                            ...p,
                            scores: p.scores.map((s, k) =>
                              k !== songIndex ? s : {},
                            ),
                          },
                    ),
                  }))
                }
                onToggleActive={(active) =>
                  setPoolState((prev) => ({
                    ...prev,
                    players: (prev.players ?? []).map((p, j) =>
                      j !== i ? p : { ...p, isDisabled: !active },
                    ),
                  }))
                }
                onPlayerSelect={(option) => {
                  const entrant = sortedEntrants.find(
                    (en) => en.id === option.value,
                  );
                  if (!entrant) return;
                  setPoolState((prev) => ({
                    ...prev,
                    players: (prev.players ?? []).map((p, j) =>
                      j !== i
                        ? p
                        : {
                            ...p,
                            entrantId: entrant.id,
                            gamerTag: entrant.gamerTag,
                            prefix: entrant.prefix,
                          },
                    ),
                  }));
                }}
              />
            );
          }}
        />
        </table>
      </div>
      <Dialog
        isOpen={editingScore !== null}
        onClose={() => setEditingScore(null)}
        style={{ width: "90vw", maxHeight: "90vh", overflowY: "auto" }}
        title={
          editingScore
            ? `${players[editingScore.playerIndex]?.gamerTag ?? "Player"} - Song ${editingScore.songIndex + 1}`
            : undefined
        }
      >
        <DialogBody useOverflowScrollContainer={false}>
          {editingScore && (
            <CurrentScoreCard
              score={editingLocalScore}
              originallyLinked={
                players[editingScore.playerIndex]?.scores[editingScore.songIndex]?.scoreId != null
              }
              onScoreChange={setEditingLocalScore}
              onUnlink={() => {
                const { scoreId: _, ...rest } = editingLocalScore;
                setEditingLocalScore(rest);
              }}
              onSubmit={() => {
                const { playerIndex, songIndex } = editingScore;
                setPoolState((prev) => ({
                  ...prev,
                  players: (prev.players ?? []).map((p, j) =>
                    j !== playerIndex
                      ? p
                      : {
                          ...p,
                          scores: p.scores.map((s, k) =>
                            k !== songIndex ? s : editingLocalScore,
                          ),
                        },
                  ),
                }));
                setEditingScore(null);
              }}
            />
          )}
          <MatchLog
            onScoreSelected={(score) => {
              if (!editingScore) return;
              const { playerIndex, songIndex } = editingScore;
              const linked: PoolPlayerScore = {
                scoreId: score.id,
                exScore: score.exScore ?? undefined,
                fantasticPlus: score.fantasticPlus ?? undefined,
                fantastics: score.fantastics ?? undefined,
                excellents: score.excellents ?? undefined,
                greats: score.greats ?? undefined,
                decents: score.decents ?? undefined,
                wayOffs: score.wayOffs ?? undefined,
                misses: score.misses ?? undefined,
                minesHit: score.minesHit ?? undefined,
                holdsHeld: score.holdsHeld ?? undefined,
                rollsHeld: score.rollsHeld ?? undefined,
              };
              setEditingLocalScore(linked);
              setPoolState((prev) => ({
                ...prev,
                players: (prev.players ?? []).map((p, j) =>
                  j !== playerIndex
                    ? p
                    : {
                        ...p,
                        scores: p.scores.map((s, k) =>
                          k !== songIndex ? s : linked,
                        ),
                      },
                ),
              }));
              setEditingScore(null);
            }}
          />
        </DialogBody>
      </Dialog>
    </>
  );
}

interface PlayerRowProps {
  rowProps: IItemProps;
  isDragged: boolean;
  lobbyPlayerName: string;
  player: PoolPlayer;
  songs: string[];
  canRemove: boolean;
  onRemove(): void;
  onEditScore(songIndex: number): void;
  onClearScore(songIndex: number): void;
  onToggleActive(active: boolean): void;
  onPlayerSelect(option: EntrantOption): void;
}

function PlayerRow({
  rowProps,
  isDragged,
  lobbyPlayerName,
  player,
  songs,
  canRemove,
  onRemove,
  onEditScore,
  onClearScore,
  onToggleActive,
  onPlayerSelect,
}: PlayerRowProps) {
  const { key: _key, style, ...restRowProps } = rowProps;

  return (
    <tr
      {...restRowProps}
      style={{
        ...style,
        // The dragged "ghost" row is portaled to document.body; give it a
        // z-index that clears Blueprint's overlay so it stays visible.
        zIndex: isDragged ? 9999 : style?.zIndex,
      }}
    >
      <td>
        <div className={styles.rowActions}>
          {!isDragged && (
            <span
              data-movable-handle
              className={styles.dragHandle}
              style={{ cursor: "grab" }}
            >
              <DragHandleVertical />
            </span>
          )}
          <Checkbox
            checked={!player.isDisabled}
            onChange={(e) => onToggleActive(e.target.checked)}
          />
          <div className={styles.entrantSuggest}>
            <Suggest<EntrantOption>
              fill
              disabled={player.isDisabled}
              items={options}
              inputProps={{
                leftIcon: <Person />,
                placeholder: player.isDisabled ? "n/a" : undefined,
              }}
              selectedItem={
                player.isDisabled
                  ? null
                  : options.find((o) => o.value === player.entrantId) ?? null
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
              onItemSelect={onPlayerSelect}
              inputValueRenderer={(item) => item.label}
              noResults={<MenuItem disabled text="No matching players" />}
            />
          </div>
          <Tooltip content="Remove player">
            <Button icon={<Trash />} disabled={!canRemove} onClick={onRemove} />
          </Tooltip>
        </div>
        <Suggest<string>
          className={styles.lobbyPlayerSuggest}
          disabled
          items={[]}
          inputProps={{ leftIcon: <Desktop /> }}
          selectedItem={lobbyPlayerName}
          itemRenderer={(item, { handleClick, modifiers }) => (
            <MenuItem
              key={item}
              text={item}
              active={modifiers.active}
              onClick={handleClick}
            />
          )}
          onItemSelect={() => {}}
          inputValueRenderer={(item) => item}
        />
      </td>
      {songs.map((_, si) => (
        <td key={si} className={styles.scoreCell}>
          {player.scores[si]?.exScore != null
            ? `${player.scores[si].scoreId == null ? "*" : ""}${player.scores[si].exScore.toFixed(2)}%`
            : "--.--%"}
          {" "}
          <Button icon={<Edit />} onClick={() => onEditScore(si)} />
          {" "}
          <Button icon={<Trash />} onClick={() => onClearScore(si)} />
        </td>
      ))}
      <td className={styles.resetSongsColumn}></td>
    </tr>
  );
}

const ExScoreInput = forwardRef<
  { focus(): void },
  {
    value: number | undefined;
    disabled: boolean;
    autoFocus?: boolean;
    onChange(value: number | undefined): void;
  }
>(function ExScoreInput({ value, disabled, autoFocus, onChange }, ref) {
  const inputRef = useRef<HTMLInputElement>(null);

  useImperativeHandle(ref, () => ({
    focus() {
      inputRef.current?.focus();
    },
  }));

  const [text, setText] = useState(() => (value != null ? String(value) : ""));

  const prevValue = useRef(value);
  if (prevValue.current !== value) {
    prevValue.current = value;
    setText(value != null ? String(value) : "");
  }

  return (
    <InputGroup
      inputRef={inputRef}
      autoFocus={autoFocus}
      disabled={disabled}
      value={text}
      onChange={(e) => {
        // Allow digits, at most one decimal point
        const filtered = e.target.value
          .replace(/[^\d.]/g, "")
          .replace(/(\..*)\./g, "$1");
        setText(filtered);
        const num = parseFloat(filtered);
        onChange(filtered === "" || isNaN(num) ? undefined : num);
      }}
    />
  );
});

const SCORE_FIELDS: Array<{ label: string; key: keyof Omit<PoolPlayerScore, "scoreId"> }> = [
  { label: "EX Score", key: "exScore" },
  { label: "FA+", key: "fantasticPlus" },
  { label: "FA", key: "fantastics" },
  { label: "EXC", key: "excellents" },
  { label: "Great", key: "greats" },
  { label: "Decent", key: "decents" },
  { label: "W/O", key: "wayOffs" },
  { label: "Miss", key: "misses" },
  { label: "Mines Hit", key: "minesHit" },
  { label: "Holds Held", key: "holdsHeld" },
  { label: "Rolls Held", key: "rollsHeld" },
];

function CurrentScoreCard({
  score,
  originallyLinked,
  onScoreChange,
  onUnlink,
  onSubmit,
}: {
  score: PoolPlayerScore;
  originallyLinked: boolean;
  onScoreChange(score: PoolPlayerScore): void;
  onUnlink(): void;
  onSubmit(): void;
}) {
  const isLinked = score.scoreId != null;
  const canSubmit = !isLinked && !(score.exScore != null && score.exScore > 100);
  const exScoreRef = useRef<{ focus(): void }>(null);

  return (
    <div
      style={{ marginBottom: "20px" }}
      onKeyDown={(e) => {
        if (e.key === "Enter" && !e.altKey && !e.ctrlKey && !e.metaKey && canSubmit) {
          e.preventDefault();
          onSubmit();
        }
      }}
    >
      <Card>
        <H3>
          Current Score{" "}
          {isLinked && <Button icon={<Unlink />} onClick={onUnlink} />}
          {originallyLinked && !isLinked && (
            <small><em>Click "Submit" to confirm unlinking.</em></small>
          )}
        </H3>
        <div className={styles.currentScoreGrid}>
          {SCORE_FIELDS.map(({ label, key }) => (
            <FormGroup key={key} label={label}>
              {key === "exScore" ? (
                <ExScoreInput
                  ref={exScoreRef}
                  value={score.exScore}
                  disabled={isLinked}
                  autoFocus={!isLinked}
                  onChange={(v) => onScoreChange({ ...score, exScore: v })}
                />
              ) : (
                <InputGroup
                  type="number"
                  disabled={isLinked}
                  value={score[key] != null ? String(score[key]) : ""}
                  onChange={(e) =>
                    onScoreChange({
                      ...score,
                      [key]: e.target.value === "" ? undefined : Number(e.target.value),
                    })
                  }
                />
              )}
            </FormGroup>
          ))}
        </div>
        <Button disabled={!canSubmit} onClick={onSubmit}>Submit</Button>{" "}
        <Button disabled={isLinked} onClick={() => { onScoreChange({ exScore: 0 }); exScoreRef.current?.focus(); }}>Clear</Button>
      </Card>
    </div>
  );
}
