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
import { useAppUpdater } from "./hooks/useAppUpdater";
import { UpdateWindow } from "./components/update_window/UpdateWindow";
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
  const appUpdater = useAppUpdater();
  const {
    updateInfo,
    phase: updatePhase,
    progress: updateProgress,
    isOpen: isUpdateWindowOpen,
    isBusy: isUpdateBusy,
    isClosing: isUpdateWindowClosing,
    dismissUpdate,
    startUpdate,
  } = appUpdater;
  const handlePageChange = useCallback(
    (page: AppPage) => {
      if (isUpdateWindowOpen) {
        if (isUpdateBusy) return;
        dismissUpdate(true);
      }
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
      dismissUpdate,
      handleCloseFolderWindow,
      isAddFlowActive,
      isUpdateBusy,
      isUpdateWindowOpen,
    ],
  );
  const handleBack = useCallback(() => {
    if (isUpdateWindowOpen) {
      if (isUpdateBusy) return;
      dismissUpdate();
      return;
    }
    if (currentPage === "Folder" && activeWindow !== null) {
      if (activeWindow === "add" && isAddFlowActive) return;
      handleCloseFolderWindow();
      return;
    }
    navigateBack();
  }, [
    activeWindow,
    currentPage,
    dismissUpdate,
    handleCloseFolderWindow,
    isAddFlowActive,
    isUpdateBusy,
    isUpdateWindowOpen,
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
        isOverlayWindowOpen={
          isUpdateWindowOpen ||
          (currentPage === "Folder" && activeWindow !== null)
        }
      />
      <Topbar closeDisabled={isUpdateBusy} />
      <Sidebar
        activeMenu={currentPage}
        onMenuClick={handlePageChange}
        onBack={handleBack}
        forceBack={isUpdateWindowOpen}
        interactionDisabled={isUpdateBusy}
      />

      <main
        style={{
          flex: 1,
          width: "100%",
          height: "100%",
          position: "relative",
        }}
      >
        <div
          aria-hidden={isUpdateWindowOpen}
          inert={isUpdateWindowOpen}
          style={{ position: "relative", width: "100%", height: "100%" }}
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
        </div>

        {isUpdateWindowOpen && updateInfo && (
          <div
            style={{
              position: "absolute",
              inset: "0 0 0 4.8rem",
              zIndex: 200000,
            }}
          >
            <UpdateWindow
              updateInfo={updateInfo}
              phase={updatePhase}
              progress={updateProgress}
              isClosing={isUpdateWindowClosing}
              onCancel={() => dismissUpdate()}
              onUpdate={() => void startUpdate()}
            />
          </div>
        )}
      </main>
    </div>
  );
}
