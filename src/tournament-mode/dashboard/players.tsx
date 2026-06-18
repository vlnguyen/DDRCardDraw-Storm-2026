import { Button, MenuItem } from "@blueprintjs/core";
import { Minus, Plus } from "@blueprintjs/icons";
import { Suggest } from "@blueprintjs/select";
import { useState } from "react";
import { PoolState } from "../../state/event.slice";
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

  function handleSubmit() {
    dispatch(eventSlice.actions.setPoolPlayers(players));
    toaster.show({ message: "Pool state updated.", intent: "success" });
  }

  return (
    <>
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
          {players.map((player, i) => (
            <tr key={i}>
              <td>
                <Button
                  icon={<Minus />}
                  onClick={() =>
                    setPoolState((prev) => ({
                      ...prev,
                      players: (prev.players ?? []).filter((_, j) => j !== i),
                    }))
                  }
                />
              </td>
              <td>
                <Suggest<EntrantOption>
                  items={options}
                  selectedItem={options.find((o) => o.value === player.entrantId) ?? null}
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
                  onItemSelect={(option) => {
                    const entrant = sortedEntrants.find((en) => en.id === option.value);
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
                  inputValueRenderer={(item) => item.label}
                  noResults={<MenuItem disabled text="No matching players" />}
                />
              </td>
              {songs.map((_, si) => (
                <td key={si}>{(player.scores[si] ?? 0).toFixed(2)}%</td>
              ))}
              <td></td>
            </tr>
          ))}
          <tr>
            <td>
              <Button
                icon={<Plus />}
                onClick={() =>
                  setPoolState((prev) => ({
                    ...prev,
                    players: [
                      ...(prev.players ?? []),
                      { scores: new Array(songs.length).fill(0), isEliminated: false, isDisabled: false },
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
      <pre>{JSON.stringify(poolState, null, 2)}</pre>
    </>
  );
}
