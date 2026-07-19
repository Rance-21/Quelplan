import { invokeApi } from "./invoke";

export interface FolderGame {
  id: number;
  name: string;
  path: string;
  coverUrl: string;
  playtime: number;
  score: number;
}

export type FolderGamePatch = Partial<
  Pick<FolderGame, "name" | "coverUrl" | "playtime" | "score">
>;

export interface FolderGames {
  games: FolderGame[];
}

export async function getFolderGames(): Promise<FolderGame[]> {
  const folderGames = await invokeApi<FolderGames>("get_folder_games");
  return folderGames.games;
}
