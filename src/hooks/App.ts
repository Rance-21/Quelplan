import { useCallback, useEffect, useState } from "react";
import { getMainGame, type MainGame } from "../api/GetMainGame";
import { updateGameField } from "../api/UpdateGameField";
import { showToast } from "../components/ui/Toast";
import { translate } from "../lib/i18n";
import type { AppPage } from "../lib/navigation";

const gameStorageKey = "main-game";

function readStoredMainGame(): MainGame | null {
  const storedData = window.sessionStorage.getItem(gameStorageKey);

  if (!storedData) {
    return null;
  }

  try {
    return JSON.parse(storedData) as MainGame;
  } catch {
    showToast(translate("toast.readMainGameFailed"), "error");
    return null;
  }
}

export function useAppState() {
  const [currentPage, setCurrentPage] = useState<AppPage>("Home");
  const [detailId, setDetailId] = useState(0);
  const [mainGame, setMainGame] = useState(readStoredMainGame());

  useEffect(() => {
    let isMounted = true;

    const loadMainGame = async () => {
      try {
        const loadedMainGame = await getMainGame();
        if (isMounted) {
          setMainGame(loadedMainGame);
        }
      } catch {
        // The API layer already reports transport failures. Keep cached state.
      }
    };

    void loadMainGame();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (mainGame !== null) {
      window.sessionStorage.setItem(gameStorageKey, JSON.stringify(mainGame));
    } else {
      window.sessionStorage.removeItem(gameStorageKey);
    }
  }, [mainGame]);

  const handlePageChange = useCallback((page: AppPage) => {
    setCurrentPage(page);
  }, []);

  const handleBack = useCallback(() => {
    setCurrentPage((page) => (page === "Detail" ? "Folder" : "Home"));
  }, []);

  const handleDetail = useCallback((id: number) => {
    setDetailId(id);
    setCurrentPage("Detail");
  }, []);

  const handleMain = useCallback((mainGame: MainGame) => {
    setMainGame(mainGame);
    void updateGameField(mainGame.id, "main_game_id", mainGame.id).catch(
      () => undefined,
    );
    setCurrentPage("Home");
  }, []);

  const handleGameDeleted = useCallback((id: number) => {
    setMainGame((currentMainGame) =>
      currentMainGame?.id === id ? null : currentMainGame,
    );
  }, []);

  return {
    currentPage,
    mainGame,
    detailId,
    handlePageChange,
    handleBack,
    handleDetail,
    handleMain,
    handleGameDeleted,
  };
}
