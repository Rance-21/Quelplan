import { invokeApi } from "./invoke";

export async function openFolder(path: string): Promise<void> {
  await invokeApi("open_folder", { path });
}
