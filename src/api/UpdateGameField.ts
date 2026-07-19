import { invokeApi } from "./invoke";

export interface GameFieldValues {
  name: string;
  liked: boolean;
  if_finished: boolean;
  main_game_id: number;
  last_played: number;
  exe_path: string;
  cover: string;
  developer: string;
  score: number;
  publish_date: number;
}

export type DetailEditableField =
  | "name"
  | "developer"
  | "score"
  | "publish_date"
  | "cover";

export type DetailFieldChangeHandler = <K extends DetailEditableField>(
  field: K,
  value: GameFieldValues[K],
) => void;

export async function updateGameField<K extends keyof GameFieldValues>(
  id: number,
  field: K,
  value: GameFieldValues[K],
): Promise<void> {
  await invokeApi("update_game_field", { id, field, value });
}
