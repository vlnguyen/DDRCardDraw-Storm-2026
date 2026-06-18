import { Button, Card, Dialog, DialogBody, FormGroup, H3, InputGroup, MenuItem } from "@blueprintjs/core";
import { Edit, Minus, Plus, Trash, Unlink } from "@blueprintjs/icons";
import {
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Suggest } from "@blueprintjs/select";
import { CSSProperties, forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { PoolPlayer, PoolPlayerScore, PoolState } from "../../state/event.slice";
import { toaster } from "../../toaster";
import { eventSlice } from "../../state/event.slice";
import { useAppDispatch, useAppState } from "../../state/store";
import entrants from "../../assets/entrants.json";
import { MatchLog } from "./match-log";
import styles from "./players.css";

const sortedEntrants = [...entrants].sort((a, b) =>
  a.gamerTag.localeCompare(b.gamerTag),
);

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

export function Players() {
  const dispatch = useAppDispatch();
  const savedPoolState = useAppState(
    (s) => s.event.tournament.poolState ?? {},
  );
  const [poolState, setPoolState] = useState<PoolState>(savedPoolState);

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

  // Stable IDs that follow rows as they are reordered
  const nextIdRef = useRef(0);
  const idsRef = useRef<string[]>([]);
  while (idsRef.current.length < players.length) {
    idsRef.current.push(String(nextIdRef.current++));
  }
  idsRef.current = idsRef.current.slice(0, players.length);
  const ids = idsRef.current;

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function handleDragEnd({ active, over }: DragEndEvent) {
    if (!over || active.id === over.id) return;
    const fromIndex = ids.indexOf(String(active.id));
    const toIndex = ids.indexOf(String(over.id));
    if (fromIndex === -1 || toIndex === -1) return;
    idsRef.current = arrayMove(idsRef.current, fromIndex, toIndex);
    setPoolState((prev) => ({
      ...prev,
      players: arrayMove(prev.players ?? [], fromIndex, toIndex),
    }));
  }

  function handleSubmit() {
    dispatch(eventSlice.actions.setPoolPlayers(players));
    toaster.show({ message: "Pool state updated.", intent: "success" });
  }

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <table className={styles.playersTable}>
          <thead>
            <tr>
              <th></th>
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
                />
              </th>
            </tr>
          </thead>
          <tbody>
            <SortableContext items={ids} strategy={verticalListSortingStrategy}>
              {players.map((player, i) => (
                <SortablePlayerRow
                  key={ids[i]}
                  id={ids[i]}
                  player={player}
                  songs={songs}
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
                  onRemove={() =>
                    setPoolState((prev) => ({
                      ...prev,
                      players: (prev.players ?? []).filter((_, j) => j !== i),
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
              ))}
            </SortableContext>
            <tr>
              <td>
                <Button
                  icon={<Plus />}
                  onClick={() =>
                    setPoolState((prev) => ({
                      ...prev,
                      players: [
                        ...(prev.players ?? []),
                        {
                          scores: Array.from(
                            { length: songs.length },
                            (): PoolPlayerScore => ({}),
                          ),
                          isEliminated: false,
                          isDisabled: false,
                        },
                      ],
                    }))
                  }
                />
              </td>
              <td className={styles.submitCell}>
                <Button onClick={handleSubmit}>Submit</Button>
              </td>
              {songs.map((_, si) => (
                <td key={si}></td>
              ))}
              <td></td>
            </tr>
          </tbody>
        </table>
      </DndContext>
      <pre>{JSON.stringify(poolState, null, 2)}</pre>
      <Dialog
        isOpen={editingScore !== null}
        onClose={() => setEditingScore(null)}
        style={{ width: "90vw" }}
        title={
          editingScore
            ? `${players[editingScore.playerIndex]?.gamerTag ?? "Player"} - Song ${editingScore.songIndex + 1}`
            : undefined
        }
      >
        <DialogBody>
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

interface SortablePlayerRowProps {
  id: string;
  player: PoolPlayer;
  songs: string[];
  onEditScore(songIndex: number): void;
  onClearScore(songIndex: number): void;
  onRemove(): void;
  onPlayerSelect(option: EntrantOption): void;
}

function SortablePlayerRow({
  id,
  player,
  songs,
  onEditScore,
  onClearScore,
  onRemove,
  onPlayerSelect,
}: SortablePlayerRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <tr ref={setNodeRef} style={style} {...attributes}>
      <td className={styles.rowActions}>
        <span className={styles.dragHandle} {...listeners}>
          ⠿
        </span>
        <Button icon={<Minus />} onClick={onRemove} />
      </td>
      <td>
        <Suggest<EntrantOption>
          items={options}
          selectedItem={
            options.find((o) => o.value === player.entrantId) ?? null
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
      <td></td>
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
