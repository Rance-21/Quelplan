import { invokeApi } from "./invoke";

export async function closeWindow(): Promise<void> {
  await invokeApi("save_full_snapshot_on_close");
}
