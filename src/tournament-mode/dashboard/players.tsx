import { Button } from "@blueprintjs/core";
import { Minus, Plus } from "@blueprintjs/icons";
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

const options = sortedEntrants.map((e) => ({
  value: e.id,
  label: e.prefix ? `${e.gamerTag} [${e.prefix}]` : e.gamerTag,
}));

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
            {songs.map((song, i) => (
              <th key={i}>
                {song}{" "}
                <Button
                  icon={<Minus />}
                  onClick={() =>
                    setPoolState((prev) => ({
                      ...prev,
                      songs: (prev.songs ?? []).filter((_, j) => j !== i),
                      players: (prev.players ?? []).map((p) =>
                        p ? { ...p, scores: p.scores.filter((_, j) => j !== i) } : null,
                      ),
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
                    songs: [...(prev.songs ?? []), `Song ${(prev.songs?.length ?? 0) + 1}`],
                    players: (prev.players ?? []).map((p) =>
                      p ? { ...p, scores: [...p.scores, 0] } : null,
                    ),
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
                <select
                  value={player?.entrantId ?? ""}
                  onChange={(e) => {
                    const entrant = sortedEntrants.find(
                      (en) => en.id === Number(e.target.value),
                    );
                    setPoolState((prev) => ({
                      ...prev,
                      players: (prev.players ?? []).map((p, j) =>
                        j !== i
                          ? p
                          : entrant
                            ? {
                                entrantId: entrant.id,
                                gamerTag: entrant.gamerTag,
                                prefix: entrant.prefix,
                                scores: p?.scores ?? new Array(songs.length).fill(0),
                                isEliminated: p?.isEliminated ?? false,
                                isDisabled: p?.isDisabled ?? false,
                              }
                            : null,
                      ),
                    }));
                  }}
                >
                  <option value="">-- Select player --</option>
                  {options.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </td>
              {songs.map((_, si) => (
                <td key={si}>{(player?.scores[si] ?? 0).toFixed(2)}%</td>
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
                    players: [...(prev.players ?? []), null],
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
