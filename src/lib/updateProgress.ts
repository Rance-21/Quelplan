import type { DownloadEvent } from "@tauri-apps/plugin-updater";

export interface UpdateDownloadProgress {
  downloadedBytes: number;
  totalBytes: number | null;
  percentage: number | null;
  finished: boolean;
}

export const initialUpdateDownloadProgress: UpdateDownloadProgress = {
  downloadedBytes: 0,
  totalBytes: null,
  percentage: null,
  finished: false,
};

export function reduceUpdateDownloadProgress(
  current: UpdateDownloadProgress,
  event: DownloadEvent,
): UpdateDownloadProgress {
  if (event.event === "Started") {
    const contentLength = event.data.contentLength;
    const totalBytes =
      typeof contentLength === "number" && contentLength > 0
        ? contentLength
        : null;

    return {
      downloadedBytes: 0,
      totalBytes,
      percentage: totalBytes === null ? null : 0,
      finished: false,
    };
  }

  if (event.event === "Progress") {
    const downloadedBytes =
      current.downloadedBytes + Math.max(0, event.data.chunkLength);
    const percentage =
      current.totalBytes === null
        ? null
        : Math.min(
            100,
            Math.max(
              0,
              Math.round((downloadedBytes / current.totalBytes) * 100),
            ),
          );

    return {
      ...current,
      downloadedBytes,
      percentage,
    };
  }

  return {
    downloadedBytes: current.totalBytes ?? current.downloadedBytes,
    totalBytes: current.totalBytes,
    percentage: current.totalBytes === null ? null : 100,
    finished: true,
  };
}
