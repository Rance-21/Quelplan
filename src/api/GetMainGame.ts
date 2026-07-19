import { invokeApi } from "./invoke";

export interface MainGame {
  id: number;
  name: string;
  coverUrl: string;
}

export async function getMainGame(): Promise<MainGame | null> {
  return invokeApi<MainGame | null>("get_main_game");
}
