import { useCallback, useMemo, useRef, useState } from "react";
import {
  addGamesToDb,
  addNewGame,
  addNewGames,
  addSteamGames,
  clearSearchCache,
  createSourceMask,
  type DataSourceKey,
  type DataSourceSelection,
  type SearchResult,
} from "../api/Add";
import { addApp } from "../api/App";
import { selectDirectory, selectSingleFile } from "../api/Dialog";
import type { FolderGame } from "../api/foldergames";
import {
  createAddSearchItem,
  getAddSelections,
  type AddMethod,
  type AddPhase,
  type AddSearchItem,
} from "../lib/addGameFlow";
import { useI18n, type TranslationKey } from "../lib/i18n";
import { getDefaultGameName } from "../utils/gameName";

interface UseAddGameFlowOptions {
  onGamesCommitted: () => void;
  onGameAdded: (game: FolderGame) => void;
}

const defaultSources: DataSourceSelection = { bgm: true, vndb: true, igdb: true };

export function useAddGameFlow({
  onGamesCommitted,
  onGameAdded,
}: UseAddGameFlowOptions) {
  const { t } = useI18n();
  const [phase, setPhase] = useState<AddPhase>("setup");
  const [method, setMethod] = useState<AddMethod>("single");
  const [paths, setPaths] = useState({ single: "", batch: "", app: "" });
  const [name, setName] = useState("");
  const [sources, setSources] = useState(defaultSources);
  const [items, setItems] = useState<AddSearchItem[]>([]);
  const [activeCacheIndex, setActiveCacheIndex] = useState<number | null>(null);
  const [importedGames, setImportedGames] = useState<FolderGame[]>([]);
  const [completedCount, setCompletedCount] = useState(0);
  const [errorKey, setErrorKey] = useState<TranslationKey | null>(null);
  const [isWorking, setIsWorking] = useState(false);
  const [isPicking, setIsPicking] = useState(false);
  // Acquire synchronously: two clicks in the same render must not share the search cache.
  const workingRef = useRef(false);
  const hasCacheRef = useRef(false);
  const selections = useMemo(() => getAddSelections(items), [items]);
  const sourceMask = createSourceMask(sources);
  const path = method === "steam" ? "" : paths[method];
  const hasValidPath = path.length > 0 && (method !== "single" || name.trim().length > 0);
  const canStart = !isWorking && phase === "setup" && (method === "steam" || hasValidPath);

  const acquire = useCallback(() => {
    if (workingRef.current) return false;
    workingRef.current = true;
    setIsWorking(true);
    return true;
  }, []);
  const release = useCallback(() => {
    workingRef.current = false;
    setIsWorking(false);
  }, []);

  const changeMethod = (nextMethod: AddMethod) => {
    if (workingRef.current || phase !== "setup") return;
    setMethod(nextMethod);
    setErrorKey(null);
  };
  const changeName = (value: string) => {
    if (workingRef.current || phase !== "setup") return;
    setName(value);
    setErrorKey(null);
  };
  const changeSource = (source: DataSourceKey, enabled: boolean) => {
    if (workingRef.current || phase !== "setup") return;
    setSources((current) => ({ ...current, [source]: enabled }));
    setErrorKey(null);
  };

  const pickPath = async () => {
    if (phase !== "setup" || method === "steam" || !acquire()) return;
    setIsPicking(true);
    try {
      const nextPath = method === "batch"
        ? await selectDirectory()
        : await selectSingleFile({
            filterName: t(method === "app" ? "add.fileFilter.app" : "add.fileFilter.game"),
            extensions: ["exe"],
          });
      if (!nextPath) return;
      setPaths((current) => ({ ...current, [method]: nextPath }));
      if (method === "single") setName(getDefaultGameName(nextPath));
      setErrorKey(null);
    } finally {
      setIsPicking(false);
      release();
    }
  };

  const start = async () => {
    if (!canStart || !acquire()) return;
    setErrorKey(null);
    setCompletedCount(0);
    if (method === "steam" || method === "app") {
      setPhase("importing");
      setImportedGames([]);
      let receivedCount = 0;
      try {
        if (method === "steam") {
          const count = await addSteamGames((game) => {
            receivedCount += 1;
            setImportedGames((current) => [...current, game]);
            onGameAdded(game);
          });
          setCompletedCount(count);
          onGamesCommitted();
        } else {
          await addApp(path);
          setCompletedCount(1);
        }
        setPhase("success");
      } catch {
        setErrorKey(receivedCount > 0 ? "add.flow.error.partialImport" : "add.flow.error.import");
        setCompletedCount(receivedCount);
        if (receivedCount > 0) {
          onGamesCommitted();
          setPhase("success");
        } else {
          setPhase("setup");
        }
      } finally {
        release();
      }
      return;
    }

    setPhase("searching");
    setItems([]);
    setActiveCacheIndex(null);
    let receivedCount = 0;
    const receive = (result: SearchResult) => {
      const cacheIndex = receivedCount++;
      setItems((current) => [...current, createAddSearchItem(result, cacheIndex)]);
      setActiveCacheIndex((current) => current ?? cacheIndex);
    };
    try {
      await clearSearchCache();
      hasCacheRef.current = true;
      if (method === "single") {
        setName(name.trim());
        receive(await addNewGame(path, sourceMask, name.trim()));
      } else {
        await addNewGames(path, sourceMask, receive);
      }
      setPhase("review");
    } catch {
      setErrorKey(receivedCount > 0 ? "add.flow.error.partialSearch" : "add.flow.error.search");
      setPhase(receivedCount > 0 ? "review" : "setup");
    } finally {
      release();
    }
  };

  const selectCandidate = (cacheIndex: number, selectedIndex: number) => {
    if (workingRef.current || phase !== "review") return;
    setItems((current) => current.map((item) =>
      item.cacheIndex === cacheIndex && item.result.searched_games[selectedIndex]
        ? { ...item, selectedIndex, included: true }
        : item,
    ));
  };
  const toggleIncluded = (cacheIndex: number) => {
    if (workingRef.current || phase !== "review") return;
    setItems((current) => current.map((item) =>
      item.cacheIndex === cacheIndex && item.selectedIndex !== null
        ? { ...item, included: !item.included }
        : item,
    ));
  };

  const confirm = async () => {
    if (phase !== "review" || selections.length === 0 || !acquire()) return;
    setErrorKey(null);
    setPhase("committing");
    try {
      await addGamesToDb(selections);
      hasCacheRef.current = false;
      setCompletedCount(selections.length);
      onGamesCommitted();
      setPhase("success");
    } catch {
      setErrorKey("add.flow.error.commit");
      setPhase("review");
    } finally {
      release();
    }
  };

  const reset = useCallback(async (clearDraft = false) => {
    if (!acquire()) return false;
    try {
      if (hasCacheRef.current) await clearSearchCache();
      hasCacheRef.current = false;
      setItems([]);
      setActiveCacheIndex(null);
      setImportedGames([]);
      setCompletedCount(0);
      setErrorKey(null);
      setPhase("setup");
      if (clearDraft) {
        setPaths({ single: "", batch: "", app: "" });
        setName("");
      }
      return true;
    } catch {
      setErrorKey("add.flow.error.reset");
      return false;
    } finally {
      release();
    }
  }, [acquire, release]);

  return {
    phase,
    method,
    path,
    name,
    sources,
    sourceMask,
    items,
    activeCacheIndex,
    importedGames,
    completedCount,
    error: errorKey ? t(errorKey) : null,
    isWorking,
    isPicking,
    canStart,
    selectionCount: selections.length,
    changeMethod,
    changeName,
    changeSource,
    pickPath,
    start,
    setActiveCacheIndex,
    selectCandidate,
    toggleIncluded,
    confirm,
    reset,
  };
}

export type AddGameFlow = ReturnType<typeof useAddGameFlow>;
