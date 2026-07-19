import { invokeApi } from "./invoke";

export interface DailyPlayTime {
  play_date: number;
  play_time: number;
}

export interface LinkExe {
  steam_id: number | null;
  path: string;
}

export interface Game {
  id: number;
  name: string;
  path: string;
  cover: string;
  last_played: number;
  play_time: number;
  added_time: number;
  score: number;
  developer: string;
  publish_date: number;
  liked: boolean;
  if_finished: boolean;
  steam_id: number | null;
  link_exe: LinkExe[];
  daily_play_times: DailyPlayTime[];
}

const pendingGameDetails = new Map<number, Promise<Game>>();

export function getGameDetail(id: number): Promise<Game> {
  const pendingRequest = pendingGameDetails.get(id);
  if (pendingRequest) return pendingRequest;

  const request = invokeApi<Game>("get_game_detail", { id });
  pendingGameDetails.set(id, request);

  const clearPendingRequest = () => {
    if (pendingGameDetails.get(id) === request) {
      pendingGameDetails.delete(id);
    }
  };
  request.then(clearPendingRequest, clearPendingRequest);

  return request;
}
