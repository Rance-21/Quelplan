import { useEffect, useMemo, useState } from "react";
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
  type SearchSelection,
} from "../api/Add";
import { addApp } from "../api/App";
import type { FolderGame } from "../api/foldergames";
import type { AddMode } from "../components/add_window/AddModeSelector";
import { getDefaultGameName } from "../components/add_window/gameName";
import { showToast } from "../components/ui/Toast";
import { useI18n } from "../lib/i18n";

export type AddPhase =
  | "setup"
  | "naming"
  | "searching"
  | "review"
  | "committing"
  | "steam-importing"
  | "app-adding";

export interface AddSearchItem {
  result: SearchResult;
  selectedIndex: number;
  cacheIndex: number;
}

const initialSources: DataSourceSelection = {
  bgm: true,
  vndb: true,
  igdb: true,
};

interface UseAddWindowOptions {
  onClose: () => void;
  onGamesCommitted: () => void;
  onGameAdded: (game: FolderGame) => void;
  onFlowActiveChange: (active: boolean) => void;
}

export function useAddWindow({
  onClose,
  onGamesCommitted,
  onGameAdded,
  onFlowActiveChange,
}: UseAddWindowOptions) {
  const { t } = useI18n();
  const [phase, setPhase] = useState<AddPhase>("setup");
  const [addMode, setAddMode] = useState<AddMode>("game");
  const [sources, setSources] = useState(initialSources);
  const [searchItems, setSearchItems] = useState<AddSearchItem[]>([]);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [steamImportedCount, setSteamImportedCount] = useState(0);
  const [isCancelling, setIsCancelling] = useState(false);
  const [pendingSingleGamePath, setPendingSingleGamePath] = useState("");
  const [singleGameName, setSingleGameName] = useState("");
  const sourceMask = useMemo(() => createSourceMask(sources), [sources]);

  const selections = useMemo<SearchSelection[]>(
    () =>
      searchItems.flatMap(({ result, selectedIndex, cacheIndex }) =>
        result.searched_games[selectedIndex]
          ? [[cacheIndex, selectedIndex] as SearchSelection]
          : [],
      ),
    [searchItems],
  );

  useEffect(() => {
    onFlowActiveChange(phase !== "setup");
  }, [onFlowActiveChange, phase]);

  useEffect(() => {
    return () => onFlowActiveChange(false);
  }, [onFlowActiveChange]);

  const resetSearchResults = () => {
    setSearchItems([]);
    setExpandedIndex(null);
  };

  const handleSourceChange = (source: DataSourceKey, enabled: boolean) => {
    setSources((current) => ({ ...current, [source]: enabled }));
  };

  const handlePathSelected = async (path: string, mode: AddMode) => {
    if (mode === "app") {
      setPhase("app-adding");
      try {
        await addApp(path);
        onClose();
      } catch {
        setPhase("setup");
      }
      return;
    }

    setPendingSingleGamePath(path);
    setSingleGameName(getDefaultGameName(path));
    setPhase("naming");
  };

  const handleSingleGameSearch = async () => {
    const trimmedName = singleGameName.trim();
    if (!trimmedName) {
      showToast(t("add.name.empty"), "error");
      return;
    }

    setSingleGameName(trimmedName);
    resetSearchResults();
    setPhase("searching");
    try {
      await clearSearchCache();
      const result = await addNewGame(
        pendingSingleGamePath,
        sourceMask,
        trimmedName,
      );
      setSearchItems([{ result, selectedIndex: 0, cacheIndex: 0 }]);
      setPhase("review");
    } catch {
      setPhase("naming");
    }
  };

  const handleNamingBack = () => {
    setPendingSingleGamePath("");
    setSingleGameName("");
    setPhase("setup");
  };

  const handleDirectorySelected = async (path: string) => {
    let receivedCount = 0;
    resetSearchResults();
    setPhase("searching");

    try {
      await clearSearchCache();
      await addNewGames(path, sourceMask, (result) => {
        const cacheIndex = receivedCount;
        receivedCount += 1;
        setSearchItems((currentItems) => [
          ...currentItems,
          { result, selectedIndex: 0, cacheIndex },
        ]);
      });
      setPhase("review");
    } catch {
      setPhase(receivedCount > 0 ? "review" : "setup");
    }
  };

  const handleSteamImport = async () => {
    setSteamImportedCount(0);
    setPhase("steam-importing");

    try {
      await addSteamGames((game) => {
        setSteamImportedCount((count) => count + 1);
        onGameAdded(game);
      });
      onClose();
    } catch {
      setPhase("setup");
    }
  };

  const handleCandidateSelect = (outsideIndex: number, insideIndex: number) => {
    setSearchItems((currentItems) =>
      currentItems.map((item, index) =>
        index === outsideIndex ? { ...item, selectedIndex: insideIndex } : item,
      ),
    );
    setExpandedIndex(null);
  };

  const handleResultDelete = (displayIndex: number) => {
    setSearchItems((currentItems) =>
      currentItems.filter((_, index) => index !== displayIndex),
    );
    setExpandedIndex((currentIndex) => {
      if (currentIndex === null || currentIndex < displayIndex) {
        return currentIndex;
      }
      return currentIndex === displayIndex ? null : currentIndex - 1;
    });
  };

  const handleConfirm = async () => {
    if (selections.length === 0 || phase !== "review") return;

    setExpandedIndex(null);
    setPhase("committing");
    try {
      await addGamesToDb(selections);
      showToast(
        selections.length === 1
          ? t("toast.addGameSuccess")
          : t("toast.addGamesSuccess", { count: selections.length }),
        "success",
      );
      onGamesCommitted();
      onClose();
    } catch {
      setPhase("review");
    }
  };

  const handleCancel = async () => {
    if (isCancelling || phase !== "review") return;

    setIsCancelling(true);
    try {
      await clearSearchCache();
      onClose();
    } catch {
      return;
    } finally {
      setIsCancelling(false);
    }
  };

  return {
    phase,
    addMode,
    setAddMode,
    sources,
    handleSourceChange,
    searchItems,
    expandedIndex,
    setExpandedIndex,
    steamImportedCount,
    isCancelling,
    pendingSingleGamePath,
    singleGameName,
    setSingleGameName,
    selectionCount: selections.length,
    handlePathSelected,
    handleSingleGameSearch,
    handleNamingBack,
    handleDirectorySelected,
    handleSteamImport,
    handleCandidateSelect,
    handleResultDelete,
    handleConfirm,
    handleCancel,
  };
}
