import { describe, expect, it } from "vitest";
import type { FolderGame } from "../api/foldergames";
import {
  readSortOrder,
  readSortType,
  sortGames,
} from "./SortGames";

function createGame(
  id: number,
  name: string,
  playtime: number,
  score: number,
): FolderGame {
  return {
    id,
    name,
    playtime,
    score,
    path: `${name}.exe`,
    coverUrl: `${name}.png`,
  };
}

describe("folder game sorting", () => {
  const games = [
    createGame(1, "Beta", 20, 70),
    createGame(2, "Alpha", 30, 90),
    createGame(3, "Gamma", 10, 80),
  ];

  it("sorts every supported field in both directions", () => {
    expect(sortGames(games, "name", "asc").map((game) => game.id)).toEqual([
      2, 1, 3,
    ]);
    expect(sortGames(games, "time", "desc").map((game) => game.id)).toEqual([
      2, 1, 3,
    ]);
    expect(sortGames(games, "score", "asc").map((game) => game.id)).toEqual([
      1, 3, 2,
    ]);
    expect(games.map((game) => game.id)).toEqual([1, 2, 3]);
  });

  it("avoids copying collections that cannot change order", () => {
    const singleton = games.slice(0, 1);
    const empty: FolderGame[] = [];

    expect(sortGames(singleton, "name", "asc")).toBe(singleton);
    expect(sortGames(empty, "score", "desc")).toBe(empty);
  });

  it("falls back to valid persisted sort values", () => {
    expect(readSortType("time")).toBe("time");
    expect(readSortType("invalid")).toBe("name");
    expect(readSortOrder("desc")).toBe("desc");
    expect(readSortOrder("invalid")).toBe("asc");
  });
});
