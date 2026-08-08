import entrants from "../assets/entrants/entrants.json";
import { fuzzySubsequenceMatch } from "../utils/fuzzy-match";

export const sortedEntrants = [...entrants].sort((a, b) =>
  a.gamerTag.localeCompare(b.gamerTag),
);

export interface EntrantOption {
  value: number;
  label: string;
}

export const entrantOptions: EntrantOption[] = sortedEntrants.map((e) => ({
  value: e.id,
  label: e.prefix ? `${e.gamerTag} [${e.prefix}]` : e.gamerTag,
}));

export function fuzzyMatchEntrant(query: string, item: EntrantOption): boolean {
  return fuzzySubsequenceMatch(query, item.label);
}
