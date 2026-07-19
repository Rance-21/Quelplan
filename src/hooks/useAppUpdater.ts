import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  checkForAppUpdate,
  closeAppUpdate,
  downloadAppUpdate,
  installAppUpdate,
  relaunchApp,
  type Update,
} from "../api/Updater";
import { closeWindow } from "../api/Close";
import { showToast } from "../components/ui/Toast";
import { translate } from "../lib/i18n";
import {
  initialUpdateDownloadProgress,
  reduceUpdateDownloadProgress,
  type UpdateDownloadProgress,
} from "../lib/updateProgress";

const updateWindowAnimationDuration = 200;

export type AppUpdaterPhase =
  | "available"
  | "downloading"
  | "installing"
  | "readyToRestart";

export interface AppUpdateInfo {
  currentVersion: string;
  version: string;
  date?: string;
  notes?: string;
}

function showUpdaterError(messageKey: Parameters<typeof translate>[0], error: unknown) {
  showToast(translate(messageKey, { error: String(error) }), "error");
}

export function useAppUpdater() {
  const [update, setUpdate] = useState<Update | null>(null);
  const [phase, setPhase] = useState<AppUpdaterPhase>("available");
  const [progress, setProgress] = useState<UpdateDownloadProgress>(
    initialUpdateDownloadProgress,
  );
  const [isClosing, setIsClosing] = useState(false);
  const updateRef = useRef<Update | null>(null);
  const hasDownloadedRef = useRef(false);
  const closeTimerRef = useRef<number | null>(null);
  const operationRunningRef = useRef(false);

  const updateInfo = useMemo<AppUpdateInfo | null>(() => {
    if (!update) return null;

    return {
      currentVersion: update.currentVersion,
      version: update.version,
      date: update.date,
      notes: update.body,
    };
  }, [update]);

  const isOpen = update !== null;
  const isBusy = phase === "downloading" || phase === "installing";

  const clearCloseTimer = useCallback(() => {
    if (closeTimerRef.current === null) return;
    window.clearTimeout(closeTimerRef.current);
    closeTimerRef.current = null;
  }, []);

  const releaseUpdate = useCallback((updateToClose: Update) => {
    void closeAppUpdate(updateToClose).catch((error) => {
      showUpdaterError("update.toast.closeFailed", error);
    });
  }, []);

  const finishDismissUpdate = useCallback(() => {
    clearCloseTimer();
    const currentUpdate = updateRef.current;
    updateRef.current = null;
    hasDownloadedRef.current = false;
    operationRunningRef.current = false;
    setUpdate(null);
    setPhase("available");
    setProgress(initialUpdateDownloadProgress);
    setIsClosing(false);

    if (currentUpdate) releaseUpdate(currentUpdate);
  }, [clearCloseTimer, releaseUpdate]);

  const dismissUpdate = useCallback(
    (immediate = false) => {
      if (!updateRef.current || operationRunningRef.current || isClosing) return;

      if (
        immediate ||
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ) {
        finishDismissUpdate();
        return;
      }

      setIsClosing(true);
      closeTimerRef.current = window.setTimeout(
        finishDismissUpdate,
        updateWindowAnimationDuration,
      );
    },
    [finishDismissUpdate, isClosing],
  );

  const restartApp = useCallback(async () => {
    if (operationRunningRef.current) return;

    operationRunningRef.current = true;
    try {
      await relaunchApp();
    } catch (error) {
      showUpdaterError("update.toast.restartFailed", error);
      operationRunningRef.current = false;
      setPhase("readyToRestart");
    }
  }, []);

  const startUpdate = useCallback(async () => {
    const currentUpdate = updateRef.current;
    if (!currentUpdate || operationRunningRef.current) return;

    if (phase === "readyToRestart") {
      await restartApp();
      return;
    }

    operationRunningRef.current = true;

    if (!hasDownloadedRef.current) {
      setPhase("downloading");
      setProgress(initialUpdateDownloadProgress);

      try {
        await downloadAppUpdate(currentUpdate, (event) => {
          setProgress((current) =>
            reduceUpdateDownloadProgress(current, event),
          );
        });
        hasDownloadedRef.current = true;
      } catch (error) {
        showUpdaterError("update.toast.downloadFailed", error);
        operationRunningRef.current = false;
        setPhase("available");
        return;
      }
    }

    setPhase("installing");

    try {
      await closeWindow();
    } catch {
      operationRunningRef.current = false;
      setPhase("available");
      return;
    }

    try {
      await installAppUpdate(currentUpdate);
    } catch (error) {
      showUpdaterError("update.toast.installFailed", error);
      operationRunningRef.current = false;
      setPhase("available");
      return;
    }

    operationRunningRef.current = false;
    setPhase("readyToRestart");
    await restartApp();
  }, [phase, restartApp]);

  useEffect(() => {
    if (import.meta.env.DEV) return;

    let disposed = false;

    void checkForAppUpdate()
      .then((foundUpdate) => {
        if (!foundUpdate) return;
        if (disposed) {
          releaseUpdate(foundUpdate);
          return;
        }

        updateRef.current = foundUpdate;
        setUpdate(foundUpdate);
        setPhase("available");
      })
      .catch((error) => {
        if (!disposed) showUpdaterError("update.toast.checkFailed", error);
      });

    return () => {
      disposed = true;
    };
  }, [releaseUpdate]);

  useEffect(() => {
    return () => {
      clearCloseTimer();
      const currentUpdate = updateRef.current;
      updateRef.current = null;
      if (currentUpdate) {
        void closeAppUpdate(currentUpdate).catch(() => undefined);
      }
    };
  }, [clearCloseTimer]);

  return {
    updateInfo,
    phase,
    progress,
    isOpen,
    isBusy,
    isClosing,
    dismissUpdate,
    startUpdate,
  };
}
