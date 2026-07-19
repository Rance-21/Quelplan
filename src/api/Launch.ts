import { invokeApi } from "./invoke";

export async function launchGame(gameId: number): Promise<void> {
  await invokeApi("launch_game_chain", { gameId });
}
