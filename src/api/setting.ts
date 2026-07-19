import { invokeApi } from "./invoke";

export type SettingKey = "AutoStart" | "HideOnLaunch" | "CloseTary";

export interface SettingsSnapshot {
  auto_start: boolean;
  hide_on_launch: boolean;
  close_tary: boolean;
  launch_key: string;
}

export interface AppSettings {
  autoStart: boolean;
  hideOnLaunch: boolean;
  closeToTray: boolean;
  launchKey: string;
}

function mapSettings(settings: SettingsSnapshot): AppSettings {
  return {
    autoStart: settings.auto_start,
    hideOnLaunch: settings.hide_on_launch,
    closeToTray: settings.close_tary,
    launchKey: settings.launch_key,
  };
}

export async function getSettings(): Promise<AppSettings> {
  const settings = await invokeApi<SettingsSnapshot>("get_settings");
  return mapSettings(settings);
}

export async function updateSetting(
  which: SettingKey,
  yes: boolean,
): Promise<void> {
  await invokeApi("update_settings", { which, yes });
}

export async function updateLaunchKey(launchKey: string): Promise<void> {
  await invokeApi("update_launch_key", { launchKey });
}

export async function getAvatarPath(): Promise<string | null> {
  return invokeApi<string | null>("get_avatar_path");
}
