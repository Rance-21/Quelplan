import { relaunch } from "@tauri-apps/plugin-process";
import {
  check,
  type DownloadEvent,
  type Update,
} from "@tauri-apps/plugin-updater";

const updateCheckTimeout = 15_000;

export function checkForAppUpdate(): Promise<Update | null> {
  return check({ timeout: updateCheckTimeout });
}

export function downloadAppUpdate(
  update: Update,
  onEvent: (event: DownloadEvent) => void,
): Promise<void> {
  return update.download(onEvent);
}

export function installAppUpdate(update: Update): Promise<void> {
  return update.install();
}

export function closeAppUpdate(update: Update): Promise<void> {
  return update.close();
}

export function relaunchApp(): Promise<void> {
  return relaunch();
}

export type { Update };
