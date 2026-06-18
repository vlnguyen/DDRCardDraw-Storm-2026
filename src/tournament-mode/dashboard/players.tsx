import { Button, MenuItem } from "@blueprintjs/core";
import { Minus, Plus } from "@blueprintjs/icons";
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
import { CSSProperties, useRef, useState } from "react";
import { PoolPlayer, PoolState } from "../../state/event.slice";
import { toaster } from "../../toaster";
import { eventSlice } from "../../state/event.slice";
import { useAppDispatch, useAppState } from "../../state/store";
import entrants from "../../assets/entrants.json";
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
                  {`Song ${i + 1}`}{" "}
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
                        scores: [...p.scores, 0],
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
                          scores: new Array(songs.length).fill(0),
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
    </>
  );
}

interface SortablePlayerRowProps {
  id: string;
  player: PoolPlayer;
  songs: string[];
  onRemove(): void;
  onPlayerSelect(option: EntrantOption): void;
}

function SortablePlayerRow({
  id,
  player,
  songs,
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
        <td key={si}>{(player.scores[si] ?? 0).toFixed(2)}%</td>
      ))}
      <td></td>
    </tr>
  );
}
