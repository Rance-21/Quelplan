import { showToast } from "../components/ui/Toast";
import { translate } from "../lib/i18n";
import { invokeApi } from "./invoke";

export interface App {
  id: number;
  exe_path: string;
  name: string;
  steam_id: number | null;
}

export interface Apps {
  apps: Record<string, App>;
  next_id: number;
}

interface PendingAppsRequest {
  version: number;
  request: Promise<Apps>;
}

let cachedApps: Apps | null = null;
let appsCacheVersion = 0;
let pendingAppsRequest: PendingAppsRequest | null = null;

function invalidateAppsCache() {
  appsCacheVersion += 1;
  cachedApps = null;
  pendingAppsRequest = null;
}

export function getApps(): Promise<Apps> {
  if (cachedApps) {
    return Promise.resolve(cachedApps);
  }

  if (pendingAppsRequest?.version === appsCacheVersion) {
    return pendingAppsRequest.request;
  }

  const requestVersion = appsCacheVersion;
  const request = invokeApi<Apps>("get_apps").then((apps) => {
    if (appsCacheVersion === requestVersion) {
      cachedApps = apps;
    }
    return apps;
  });

  pendingAppsRequest = { version: requestVersion, request };
  const clearPendingRequest = () => {
    if (pendingAppsRequest?.request === request) {
      pendingAppsRequest = null;
    }
  };
  request.then(clearPendingRequest, clearPendingRequest);

  return request;
}

export async function addApp(path: string): Promise<number> {
  const appId = await invokeApi<number>("add_app", { path });
  invalidateAppsCache();
  showToast(translate("toast.addAppSuccess"), "success");
  return appId;
}

export async function deleteApp(id: number): Promise<void> {
  await invokeApi("delete_app", { id });
  invalidateAppsCache();
  showToast(translate("toast.deleteAppSuccess"), "success");
}
