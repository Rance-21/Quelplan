import type { FolderGame } from "../api/foldergames";

export type SortType = "name" | "time" | "score";
export type SortOrder = "asc" | "desc";

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
        comparison = firstGame.name.localeCompare(secondGame.name, "zh-CN");
        break;
    }

    return comparison * direction;
  });
}
