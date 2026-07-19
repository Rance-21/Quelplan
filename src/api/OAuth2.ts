import { invokeApi } from "./invoke";

export async function startBgmOAuth(): Promise<void> {
  await invokeApi("start_bgm_oauth");
}
