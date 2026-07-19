import { useCallback } from "react";
import { AppBackground } from "./layouts/AppBackground";
import { Sidebar } from "./layouts/SideBar";
import { Topbar } from "./layouts/TopBar";
import { DetailPage } from "./pages/detail/DetailPage";
import { FolderPage } from "./pages/folder/Folder";
import { MainPage } from "./pages/main/MainPage";
import { SettingsPage } from "./pages/setting/Settings";
import { useAppState } from "./hooks/App";
import { useFolderState } from "./hooks/Folder";
import type { AppPage } from "./lib/navigation";
import "./App.css";

export default function App() {
  const {
    currentPage,
    mainGame,
    detailId,
    handlePageChange: changePage,
    handleBack: navigateBack,
    handleDetail,
    handleMain,
    handleGameDeleted,
  } = useAppState();
  const folderState = useFolderState();
  const { activeWindow, isAddFlowActive, handleCloseFolderWindow } =
    folderState;
  const handlePageChange = useCallback(
    (page: AppPage) => {
      if (currentPage === "Folder" && activeWindow !== null) {
        if (activeWindow === "add" && isAddFlowActive) return;
        if (page === "Folder") {
          handleCloseFolderWindow();
          return;
        }
        handleCloseFolderWindow(true);
      }
      changePage(page);
    },
    [
      activeWindow,
      changePage,
      currentPage,
      handleCloseFolderWindow,
      isAddFlowActive,
    ],
  );
  const handleBack = useCallback(() => {
    if (currentPage === "Folder" && activeWindow !== null) {
      if (activeWindow === "add" && isAddFlowActive) return;
      handleCloseFolderWindow();
      return;
    }
    navigateBack();
  }, [
    activeWindow,
    currentPage,
    handleCloseFolderWindow,
    isAddFlowActive,
    navigateBack,
  ]);
  const handleFolderGameDeleted = useCallback(
    (id: number) => {
      folderState.handleGameDelete(id);
      handleGameDeleted(id);
    },
    [folderState.handleGameDelete, handleGameDeleted],
  );

  return (
    <div
      style={{
        overflow: "hidden",
        width: "calc(100vw - 0rem)",
        height: "calc(100vh - 0rem)",
        borderRadius: "1.4rem",
        border: "0.0625rem solid var(--qp-border-soft)",
        position: "relative",
        display: "flex",
        isolation: "isolate",
      }}
    >
      <AppBackground
        currentPage={currentPage}
        isFolderWindowOpen={currentPage === "Folder" && activeWindow !== null}
      />
      <Topbar />
      <Sidebar
        activeMenu={currentPage}
        onMenuClick={handlePageChange}
        onBack={handleBack}
      />

      <main
        style={{
          flex: 1,
          width: "100%",
          height: "100%",
          position: "relative",
        }}
      >
        {currentPage === "Home" && (
          <MainPage mainGame={mainGame} onOpenDetail={handleDetail} />
        )}

        {currentPage === "Folder" && (
          <FolderPage
            folderState={folderState}
            onGameDeleted={handleFolderGameDeleted}
            onGameSelectMain={handleMain}
            onGameSelectDetail={handleDetail}
          />
        )}

        {currentPage === "Settings" && <SettingsPage />}

        {currentPage === "Detail" && (
          <DetailPage
            id={detailId}
            onFolderGameUpdate={folderState.handleFolderGameUpdated}
          />
        )}
      </main>
    </div>
  );
}
