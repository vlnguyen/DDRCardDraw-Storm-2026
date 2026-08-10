import { Button, InputGroup, MenuItem } from "@blueprintjs/core";
import { Cross, DragHandleVertical, Person, Plus } from "@blueprintjs/icons";
import { Suggest } from "@blueprintjs/select";
import { useRef } from "react";
import { List, arrayMove } from "react-movable";
import { useAppMode } from "../common-components/app-mode";
import { Player, newPlayer } from "../models/Drawing";
import {
  type EntrantOption,
  entrantOptions,
  fuzzyMatchEntrant,
} from "../models/entrant-options";

/**
 * Cap on the height of the scrollable list region. Once enough players are
 * added to reach it, the list scrolls internally instead of growing the
 * enclosing (vertically-centered) dialog unboundedly and shoving the whole
 * modal around on screen.
 */
const LIST_HEIGHT = "10.5em";

/**
 * A vertical, drag-to-reorder list of players. Each row has a dedicated drag
 * handle (so text can still be selected/edited in the name field), a name
 * input, and a remove button, with an "add player" button below.
 *
 * In event mode, the name field suggests matches from the tournament's
 * entrants.json roster (labeled `gamerTag [prefix]` when a prefix is set),
 * but typing a name that isn't on the roster is still allowed — e.g. for
 * walk-ins or byes. Classic mode keeps plain free-text names.
 *
 * The list is simply the players in display order. Since each player carries a
 * stable id that drawn-card actions reference, reordering/renaming/removing here
 * never invalidates those actions — removals are reconciled by id downstream.
 */
export function PlayerListInput(props: {
  value: Player[];
  onChange: (next: Player[]) => void;
  /** Smallest the list is allowed to shrink to via the remove button.
   * Defaults to 1 (a draw always needs at least one named player); pass 0
   * for optional lists like a "participants to highlight" field. */
  minPlayers?: number;
}) {
  const { value: players, onChange, minPlayers = 1 } = props;
  const isEventMode = useAppMode() === "event";
  const scrollRef = useRef<HTMLDivElement | null>(null);

  function renameAt(index: number, name: string) {
    onChange(players.map((p, i) => (i === index ? { ...p, name } : p)));
  }

  function removeAt(index: number) {
    onChange(players.filter((_, i) => i !== index));
  }

  function addPlayer() {
    onChange([...players, newPlayer("")]);
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
    });
  }

  return (
    <>
      <List
        lockVertically
        values={players}
        onChange={({ oldIndex, newIndex }) =>
          onChange(arrayMove(players, oldIndex, newIndex))
        }
        renderList={({ children, props: listProps }) => (
          <div
            ref={(el) => {
              listProps.ref.current = el;
              scrollRef.current = el;
            }}
            style={{ maxHeight: LIST_HEIGHT, overflowY: "auto" }}
          >
            {children}
          </div>
        )}
        renderItem={({ value, props: itemProps, index, isDragged }) => {
          const { key, ...rest } = itemProps;
          return (
            <div
              key={key}
              {...rest}
              style={{
                ...rest.style,
                display: "flex",
                alignItems: "center",
                gap: "4px",
                paddingBottom: "4px",
                listStyleType: "none",
                // The dragged "ghost" is portaled to document.body; give it a
                // z-index that clears Blueprint's overlay so it stays visible.
                zIndex: isDragged ? 9999 : rest.style?.zIndex,
              }}
            >
              <span
                data-movable-handle
                style={{
                  display: "flex",
                  cursor: isDragged ? "grabbing" : "grab",
                  padding: "0 2px",
                }}
              >
                <DragHandleVertical />
              </span>
              {isEventMode ? (
                <Suggest<EntrantOption>
                  fill
                  items={entrantOptions}
                  inputProps={{ leftIcon: <Person /> }}
                  selectedItem={
                    entrantOptions.find((o) => o.label === value.name) ?? null
                  }
                  itemPredicate={(query, item) => fuzzyMatchEntrant(query, item)}
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
                  createNewItemFromQuery={(query) => ({ value: -1, label: query })}
                  createNewItemRenderer={(query, active, handleClick) => (
                    <MenuItem
                      key="create-new-player"
                      text={`Use "${query}"`}
                      icon={<Plus />}
                      active={active}
                      onClick={handleClick}
                    />
                  )}
                  onItemSelect={(item) => renameAt(index!, item.label)}
                  inputValueRenderer={(item) => item.label}
                  noResults={<MenuItem disabled text="No matching players" />}
                />
              ) : (
                <InputGroup
                  fill
                  value={value.name}
                  onFocus={(e) => e.currentTarget.select()}
                  onChange={(e) => renameAt(index!, e.currentTarget.value)}
                />
              )}
              <Button
                aria-label="Remove player"
                variant="minimal"
                icon={<Cross />}
                disabled={players.length <= minPlayers}
                onClick={() => removeAt(index!)}
              />
            </div>
          );
        }}
      />
      <Button variant="minimal" icon={<Plus />} onClick={addPlayer}>
        Add player
      </Button>
    </>
  );
}
