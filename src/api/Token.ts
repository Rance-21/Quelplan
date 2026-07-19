import { invokeApi } from "./invoke";

export type TokenPlatform = "Bgm" | "Vndb";

export async function updateToken(
  which: TokenPlatform,
  token: string,
): Promise<void> {
  await invokeApi("update_token", { which, token });
}
