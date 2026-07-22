import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  type FolderGame,
  type FolderGamePatch,
  getFolderGames,
} from "../api/foldergames";
import {
  readSortOrder,
  readSortType,
  sortGames,
  type SortOrder,
  type SortType,
} from "../utils/SortGames";
import {
  createRetryableFolderGamesLoader,
  mergeFolderGames,
} from "./folderGamesState";
import { useFolderSearch } from "./useFolderSearch";

const loadInitialFolderGames =
  createRetryableFolderGamesLoader(getFolderGames);
const windowAnimationDuration = 200;

export type FolderWindow = "add" | "sort";

export function useFolderState(enabled: boolean) {
  const [games, setGames] = useState<FolderGame[]>([]);
  const [activeWindow, setActiveWindow] = useState<FolderWindow | null>(null);
  const [isFolderWindowClosing, setIsFolderWindowClosing] = useState(false);
  const [isAddFlowActive, setIsAddFlowActive] = useState(false);
  const closeWindowTimerRef = useRef<number | null>(null);
  const hasLoadedGamesRef = useRef(false);
  const {
    searchValue,
    searchedGames,
    handleSearchValueChange,
    handleSearchSubmit,
  } = useFolderSearch(games);

  const [sortType, setSortType] = useState<SortType>(() => {
    return readSortType(window.sessionStorage.getItem("sort_type"));
  });

  const [sortOrder, setSortOrder] = useState<SortOrder>(() => {
    return readSortOrder(window.sessionStorage.getItem("sort_order"));
  });

  const handleSortChange = useCallback(
    (newType: SortType, newOrder: SortOrder) => {
      setSortType(newType);
      setSortOrder(newOrder);
      window.sessionStorage.setItem("sort_type", newType);
      window.sessionStorage.setItem("sort_order", newOrder);
    },
    [],
  );

  const handleGameDelete = useCallback((id: number) => {
    setGames((currentGames) => {
      return currentGames.filter((game) => game.id !== id);
    });
  }, []);

  const handleOpenAddWindow = useCallback(() => {
    setActiveWindow("add");
    setIsFolderWindowClosing(false);
  }, []);

  const handleOpenSortWindow = useCallback(() => {
    setActiveWindow("sort");
    setIsFolderWindowClosing(false);
  }, []);

  const finishClosingFolderWindow = useCallback(() => {
    if (closeWindowTimerRef.current !== null) {
      window.clearTimeout(closeWindowTimerRef.current);
      closeWindowTimerRef.current = null;
    }
    setActiveWindow(null);
    setIsFolderWindowClosing(false);
  }, []);

  const handleCloseFolderWindow = useCallback(
    (immediate = false) => {
      if (activeWindow === null) return;
      if (
        immediate ||
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ) {
        finishClosingFolderWindow();
        return;
      }
      if (isFolderWindowClosing) return;

      setIsFolderWindowClosing(true);
      closeWindowTimerRef.current = window.setTimeout(
        finishClosingFolderWindow,
        windowAnimationDuration,
      );
    },
    [activeWindow, finishClosingFolderWindow, isFolderWindowClosing],
  );

  useEffect(() => {
    return () => {
      if (closeWindowTimerRef.current !== null) {
        window.clearTimeout(closeWindowTimerRef.current);
      }
    };
  }, []);

  const handleGameAdd = useCallback((game: FolderGame) => {
    setGames((currentGames) => {
      return mergeFolderGames(currentGames, [game]);
    });
  }, []);

  const handleFolderGameUpdated = useCallback(
    (id: number, patch: FolderGamePatch) => {
      setGames((currentGames) => {
        return currentGames.map((game) =>
          game.id === id ? { ...game, ...patch } : game,
        );
      });
    },
    [],
  );

  const handleGamesCommitted = useCallback(() => {
    void getFolderGames()
      .then((latestGames) => setGames(latestGames))
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!enabled || hasLoadedGamesRef.current) return;

    let isMounted = true;

    const fetchGames = async () => {
      try {
        const initialGames = await loadInitialFolderGames();
        if (isMounted) {
          setGames((currentGames) =>
            mergeFolderGames(initialGames, currentGames),
          );
          hasLoadedGamesRef.current = true;
        }
      } catch {}
    };

    void fetchGames();

    return () => {
      isMounted = false;
    };
  }, [enabled]);

  const presentedGames = useMemo(() => {
    return sortGames(searchedGames, sortType, sortOrder);
  }, [sortType, sortOrder, searchedGames]);

  return {
    presentedGames,
    searchValue,
    sortType,
    sortOrder,
    handleSearchValueChange,
    handleSearchSubmit,
    activeWindow,
    isFolderWindowClosing,
    isAddFlowActive,
    handleSortChange,
    handleGameDelete,
    handleOpenAddWindow,
    handleOpenSortWindow,
    handleCloseFolderWindow,
    handleGamesCommitted,
    handleAddFlowActiveChange: setIsAddFlowActive,
    handleGameAdded: handleGameAdd,
    handleFolderGameUpdated,
  };
}

export type FolderState = ReturnType<typeof useFolderState>;
