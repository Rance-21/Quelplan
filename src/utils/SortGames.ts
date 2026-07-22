import type { FolderGame } from "../api/foldergames";

export type SortType = "name" | "time" | "score";
export type SortOrder = "asc" | "desc";

const nameCollator = new Intl.Collator("zh-CN");

export function readSortType(value: string | null): SortType {
  return value === "time" || value === "score" ? value : "name";
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

  return [...games].sort((firstGame, secondGame) => {
    let comparison: number;

    switch (type) {
      case "time":
        comparison = firstGame.playtime - secondGame.playtime;
        break;
      case "score":
        comparison = firstGame.score - secondGame.score;
        break;
      case "name":
        comparison = nameCollator.compare(firstGame.name, secondGame.name);
        break;
    }

    return comparison * direction;
  });
}
