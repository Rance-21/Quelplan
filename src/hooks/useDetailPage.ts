import { convertFileSrc } from "@tauri-apps/api/core";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getApps, type App as LinkedApp } from "../api/App";
import { getGameDetail, type Game, type LinkExe } from "../api/detailgame";
import type { FolderGamePatch } from "../api/foldergames";
import {
  updateGameField,
  type DetailEditableField,
  type GameFieldValues,
} from "../api/UpdateGameField";

type ToggleableGameField = "liked" | "if_finished";
type PendingFields = Record<ToggleableGameField, boolean>;
type PendingRequests = Record<ToggleableGameField, number | null>;

const createPendingFields = (): PendingFields => ({
  liked: false,
  if_finished: false,
});

const createPendingRequests = (): PendingRequests => ({
  liked: null,
  if_finished: null,
});

interface UseDetailPageOptions {
  id: number;
  onFolderGameUpdate: (id: number, patch: FolderGamePatch) => void;
}

export function useDetailPage({
  id,
  onFolderGameUpdate,
}: UseDetailPageOptions) {
  const [game, setGame] = useState<Game | null>(null);
  const [apps, setApps] = useState<Record<string, LinkedApp>>({});
  const [pendingFields, setPendingFields] =
    useState<PendingFields>(createPendingFields);
  const pendingRequestsRef = useRef<PendingRequests>(createPendingRequests());
  const requestSequenceRef = useRef(0);
  const detailGenerationRef = useRef(0);

  useEffect(() => {
    let disposed = false;
    const generation = ++detailGenerationRef.current;

    setGame(null);
    pendingRequestsRef.current = createPendingRequests();
    setPendingFields((current) =>
      current.liked || current.if_finished ? createPendingFields() : current,
    );

    void getGameDetail(id)
      .then((gameData) => {
        if (disposed || detailGenerationRef.current !== generation) return;
        setGame(gameData);
      })
      .catch(() => {
        if (disposed || detailGenerationRef.current !== generation) return;
      });

    return () => {
      disposed = true;
    };
  }, [id]);

  useEffect(() => {
    let disposed = false;

    void getApps()
      .then((appsData) => {
        if (!disposed) setApps(appsData.apps);
      })
      .catch(() => undefined);

    return () => {
      disposed = true;
    };
  }, []);

  const coverSrc = useMemo(
    () => (game?.cover ? convertFileSrc(game.cover) : ""),
    [game?.cover],
  );

  const handleToggleBooleanField = useCallback(
    async (field: ToggleableGameField) => {
      const currentGame = game;
      if (!currentGame || pendingRequestsRef.current[field] !== null) return;

      const generation = detailGenerationRef.current;
      const requestId = ++requestSequenceRef.current;
      const previousValue = currentGame[field];
      const nextValue = !previousValue;

      pendingRequestsRef.current[field] = requestId;
      setPendingFields((current) => ({ ...current, [field]: true }));

      const setCurrentGameField = (value: boolean) => {
        setGame((current) =>
          detailGenerationRef.current === generation &&
          current?.id === currentGame.id
            ? { ...current, [field]: value }
            : current,
        );
      };

      setCurrentGameField(nextValue);

      try {
        await updateGameField(currentGame.id, field, nextValue);
      } catch {
        setCurrentGameField(previousValue);
      } finally {
        if (pendingRequestsRef.current[field] === requestId) {
          pendingRequestsRef.current[field] = null;
          setPendingFields((current) => ({ ...current, [field]: false }));
        }
      }
    },
    [game],
  );

  const handleGameFieldChange = useCallback(
    <K extends DetailEditableField>(field: K, value: GameFieldValues[K]) => {
      setGame((current) =>
        current ? { ...current, [field]: value } : current,
      );

      if (field === "name") {
        onFolderGameUpdate(id, { name: value as string });
      } else if (field === "cover") {
        onFolderGameUpdate(id, { coverUrl: value as string });
      } else if (field === "score") {
        onFolderGameUpdate(id, { score: value as number });
      }
    },
    [id, onFolderGameUpdate],
  );

  const handleGameExePathChange = useCallback(
    (oldExePath: string, newExePath: string) => {
      setGame((current) =>
        current
          ? {
              ...current,
              path: newExePath,
              link_exe: current.link_exe.map((linkExe) =>
                linkExe.path === oldExePath
                  ? { ...linkExe, path: newExePath }
                  : linkExe,
              ),
            }
          : current,
      );
    },
    [],
  );

  const handleLinkExeChange = useCallback((link_exe: LinkExe[]) => {
    setGame((current) => (current ? { ...current, link_exe } : current));
  }, []);

  return {
    game,
    apps,
    pendingFields,
    coverSrc,
    handleToggleBooleanField,
    handleGameFieldChange,
    handleGameExePathChange,
    handleLinkExeChange,
  };
}
