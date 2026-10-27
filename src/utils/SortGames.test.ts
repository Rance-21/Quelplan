import { describe, expect, it } from "vitest";
import type { FolderGame } from "../api/foldergames";
import {
  readSortOrder,
  readSortType,
  sortGames,
  type SortOrder,
  type SortType,
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

  it.each<[SortType, SortOrder, number[]]>([
    ["name", "asc", [2, 1, 3]],
    ["name", "desc", [3, 1, 2]],
    ["time", "asc", [3, 1, 2]],
    ["time", "desc", [2, 1, 3]],
    ["score", "asc", [1, 3, 2]],
    ["score", "desc", [2, 3, 1]],
    ["id", "asc", [1, 2, 3]],
    ["id", "desc", [3, 2, 1]],
  ])("sorts by %s %s without changing the original list", (type, order, ids) => {
    const input = [games[2], games[0], games[1]];
    expect(sortGames(input, type, order).map((game) => game.id)).toEqual(ids);
    expect(input.map((game) => game.id)).toEqual([3, 1, 2]);
  });

  it("uses numeric IDs for addition order, including gaps and newly added games", () => {
    const input = [
      createGame(20, "Alpha", 5, 90),
      createGame(3, "Gamma", 50, 10),
      createGame(100, "Beta", 20, 70),
    ];
    expect(sortGames(input, "id", "asc").map((game) => game.id)).toEqual([3, 20, 100]);
    expect(sortGames(input, "id", "desc").map((game) => game.id)).toEqual([100, 20, 3]);
    const added = createGame(101, "Delta", 0, 0);
    expect(sortGames([...input, added], "id", "desc")[0]).toBe(added);
  });

  it("avoids copying collections that cannot change order", () => {
    const singleton = games.slice(0, 1);
    const empty: FolderGame[] = [];

    expect(sortGames(singleton, "name", "asc")).toBe(singleton);
    expect(sortGames(empty, "score", "desc")).toBe(empty);
    expect(sortGames(singleton, "id", "desc")).toBe(singleton);
    expect(sortGames(empty, "id", "asc")).toBe(empty);
  });

  it("falls back to valid persisted sort values", () => {
    expect(readSortType("time")).toBe("time");
    expect(readSortType("score")).toBe("score");
    expect(readSortType("id")).toBe("id");
    expect(readSortType(null)).toBe("name");
    expect(readSortType("invalid")).toBe("name");
    expect(readSortType("toString")).toBe("name");
    expect(readSortOrder("desc")).toBe("desc");
    expect(readSortOrder("invalid")).toBe("asc");
  });
});
