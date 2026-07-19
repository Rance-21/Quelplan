import type { FolderGame } from "../api/foldergames";

type FolderGamesLoader = () => Promise<FolderGame[]>;

export function mergeFolderGames(
  snapshotGames: FolderGame[],
  currentGames: FolderGame[],
): FolderGame[] {
  const gamesById = new Map(snapshotGames.map((game) => [game.id, game]));

  for (const game of currentGames) {
    gamesById.set(game.id, game);
  }

  return Array.from(gamesById.values());
}

export function createRetryableFolderGamesLoader(
  loadGames: FolderGamesLoader,
): FolderGamesLoader {
  let pendingLoad: Promise<FolderGame[]> | null = null;

  return () => {
    pendingLoad ??= loadGames().catch((error: unknown) => {
      pendingLoad = null;
      throw error;
    });

    return pendingLoad;
  };
}
