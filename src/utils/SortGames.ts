import type { FolderGame } from "../api/foldergames";

export const sortTypes = ["name", "time", "score", "id"] as const;
export type SortType = (typeof sortTypes)[number];
export type SortOrder = "asc" | "desc";

const nameCollator = new Intl.Collator("zh-CN");

const comparators: Record<SortType, (a: FolderGame, b: FolderGame) => number> = {
  name: (a, b) => nameCollator.compare(a.name, b.name),
  time: (a, b) => a.playtime - b.playtime,
  score: (a, b) => a.score - b.score,
  id: (a, b) => a.id - b.id,
};

export function readSortType(value: string | null): SortType {
  return sortTypes.find((type) => type === value) ?? "name";
}

export function readSortOrder(value: string | null): SortOrder {
  return value === "desc" ? "desc" : "asc";
}

export function sortGames(
  games: FolderGame[],
  type: SortType,
  order: SortOrder,
): FolderGame[] {
  if (games.length < 2) return games;

  const direction = order === "asc" ? 1 : -1;
  const compare = comparators[type];
  return [...games].sort((a, b) => compare(a, b) * direction);
}
