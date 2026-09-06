import { lazy, Suspense, useCallback, useEffect } from "react";
import { AppBackground } from "./layouts/AppBackground";
import { Sidebar } from "./layouts/SideBar";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { Topbar } from "./layouts/TopBar";
import { MainPage } from "./pages/main/MainPage";
import SettingsPage from "./pages/setting/Settings";
import FolderPage from "./pages/folder/Folder";
import DetailPage from "./pages/detail/DetailPage";
import { useAppState } from "./hooks/App";
import { useFolderState } from "./hooks/Folder";
import { useAddGameFlow } from "./hooks/useAddGameFlow";
import { useAppUpdater } from "./hooks/useAppUpdater";
import { showApiError } from "./api/ToastError";
import type { AppPage } from "./lib/navigation";
import "./App.css";

const UpdateWindow = lazy(
  () => import("./components/update_window/UpdateWindow"),
);
const AddGamePage = lazy(() => import("./pages/add/AddGamePage"));

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
  const folderState = useFolderState(
    currentPage === "Folder" || currentPage === "Detail" || currentPage === "Add",
  );
  const { activeWindow, handleCloseFolderWindow } =
    folderState;
  const addFlow = useAddGameFlow({
    onGamesCommitted: folderState.handleGamesCommitted,
    onGameAdded: folderState.handleGameAdded,
  });
  const appUpdater = useAppUpdater();
  const {
    updateInfo,
    phase: updatePhase,
    progress: updateProgress,
    isOpen: hasPendingUpdate,
    isBusy: isUpdateBusy,
    isClosing: isUpdateWindowClosing,
    dismissUpdate,
    startUpdate,
  } = appUpdater;
  const isUpdateWindowOpen = hasPendingUpdate && currentPage !== "Add";
  const handlePageChange = useCallback(
    async (page: AppPage) => {
      if (addFlow.isWorking) return;
      if (isUpdateWindowOpen) {
        if (isUpdateBusy) return;
        dismissUpdate(true);
      }
      if (currentPage === "Add" && page !== "Add") {
        if (!(await addFlow.reset(true))) return;
      }
      if (currentPage === "Folder" && activeWindow !== null) {
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
      addFlow.isWorking,
      addFlow.reset,
      isUpdateBusy,
      isUpdateWindowOpen,
    ],
  );
  const handleBack = useCallback(() => {
    if (addFlow.isWorking) return;
    if (isUpdateWindowOpen) {
      if (isUpdateBusy) return;
      dismissUpdate();
      return;
    }
    if (currentPage === "Add") {
      void handlePageChange("Folder");
      return;
    }
    if (currentPage === "Folder" && activeWindow !== null) {
      handleCloseFolderWindow();
      return;
    }
    navigateBack();
  }, [
    activeWindow,
    currentPage,
    dismissUpdate,
    handleCloseFolderWindow,
    addFlow.isWorking,
    handlePageChange,
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

  useEffect(() => {
    void getCurrentWindow().show().catch(showApiError);
  }, []);

  return (
    <div
      className="qp-app-frame"
      style={{
        overflow: "hidden",
        width: "calc(100vw - 0rem)",
        height: "calc(100vh - 0rem)",
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
      <Topbar closeDisabled={isUpdateBusy || addFlow.isWorking} />
      <Sidebar
        activeMenu={currentPage}
        onMenuClick={handlePageChange}
        onBack={handleBack}
        forceBack={isUpdateWindowOpen}
        interactionDisabled={isUpdateBusy || addFlow.isWorking}
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
          key={currentPage}
          className="qp-page-transition"
          aria-hidden={isUpdateWindowOpen}
          inert={isUpdateWindowOpen}
          style={{ position: "relative", width: "100%", height: "100%" }}
        >
          <Suspense fallback={null}>
            {currentPage === "Home" && (
              <MainPage mainGame={mainGame} onOpenDetail={handleDetail} />
            )}

            {currentPage === "Folder" && (
              <FolderPage
                folderState={folderState}
                onGameDeleted={handleFolderGameDeleted}
                onGameSelectMain={handleMain}
                onGameSelectDetail={handleDetail}
                onAddGames={() => void handlePageChange("Add")}
              />
            )}

            {currentPage === "Settings" && <SettingsPage />}

            {currentPage === "Add" && (
              <AddGamePage flow={addFlow} onBack={() => void handlePageChange("Folder")} />
            )}

            {currentPage === "Detail" && (
              <DetailPage
                id={detailId}
                onFolderGameUpdate={folderState.handleFolderGameUpdated}
              />
            )}
          </Suspense>
        </div>

        <Suspense fallback={null}>
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
        </Suspense>
      </main>
    </div>
  );
}
