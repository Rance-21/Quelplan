import { listen } from "@tauri-apps/api/event";
import type { Game } from "./detailgame";

export type PlayTimeUpdate = Pick<Game, "id" | "play_time" | "daily_play_times">;

export function subscribeToPlayTimeUpdates(
  onUpdate: (update: PlayTimeUpdate) => void,
): () => void {
  let disposed = false;
  let unlisten: (() => void) | undefined;

  void listen<PlayTimeUpdate>("game-play-time-updated", ({ payload }) => {
    if (!disposed) onUpdate(payload);
  })
    .then((stopListening) => {
      if (disposed) stopListening();
      else unlisten = stopListening;
    })
    .catch((error: unknown) => console.error("Unable to listen for play time updates", error));

  return () => {
    disposed = true;
    unlisten?.();
  };
}
