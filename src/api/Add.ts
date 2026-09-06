import { getCurrentWindow } from "@tauri-apps/api/window";
import type { FolderGame } from "./foldergames";
import { invokeApi, withApiErrorToast } from "./invoke";

const gameDiscoveredEvent = "new-game-discovered";

export const SOURCE_BGM = 1 << 0;
export const SOURCE_VNDB = 1 << 1;
export const SOURCE_IGDB = 1 << 2;

export interface DataSourceSelection {
  bgm: boolean;
  vndb: boolean;
  igdb: boolean;
}

export type DataSourceKey = keyof DataSourceSelection;

export interface SearchedGame {
  name: string;
  score: number;
  publish_date: number;
  image: string;
  developer: string;
}

export interface SearchResult {
  path: string;
  searched_games: SearchedGame[];
}

export type SearchSelection = [outsideIndex: number, insideIndex: number];

export function createSourceMask(sources: DataSourceSelection): number {
  return (
    (sources.bgm ? SOURCE_BGM : 0) |
    (sources.vndb ? SOURCE_VNDB : 0) |
    (sources.igdb ? SOURCE_IGDB : 0)
  );
}

export async function clearSearchCache(): Promise<void> {
  await invokeApi("clear_search_cache");
}

export async function addNewGame(
  gamePath: string,
  sourceMask: number,
  name: string | null = null,
): Promise<SearchResult> {
  return invokeApi<SearchResult>("add_new_game", {
    path: gamePath,
    name,
    source_mask: sourceMask,
  });
}

export async function addNewGames(
  directoryPath: string,
  sourceMask: number,
  onSearchResult: (result: SearchResult) => void,
): Promise<number> {
  let unlisten: (() => void) | undefined;
  let resultCount = 0;

  try {
    unlisten = await withApiErrorToast(() =>
      getCurrentWindow().listen<SearchResult>(
        gameDiscoveredEvent,
        ({ payload }) => {
          resultCount += 1;
          onSearchResult(payload);
        },
      ),
    );

    await invokeApi("add_new_games", {
      dir: directoryPath,
      source_mask: sourceMask,
    });

    return resultCount;
  } finally {
    unlisten?.();
  }
}

export async function addGamesToDb(
  selections: SearchSelection[],
): Promise<void> {
  await invokeApi("add_games_to_db", { idxs: selections });
}

export async function addSteamGames(
  onGameDiscovered: (game: FolderGame) => void,
): Promise<number> {
  let unlisten: (() => void) | undefined;
  let addedCount = 0;

  try {
    unlisten = await withApiErrorToast(() =>
      getCurrentWindow().listen<FolderGame>(
        gameDiscoveredEvent,
        ({ payload }) => {
          addedCount += 1;
          onGameDiscovered(payload);
        },
      ),
    );

    await invokeApi("add_steam_games");
    return addedCount;
  } finally {
    unlisten?.();
  }
}
