import { AddWindow } from "../../components/add_window/AddWindow";
import type { MainGame } from "../../api/GetMainGame";
import { AddButton } from "../../components/folder/AddButton";
import { FolderGrid } from "../../components/folder/FolderGrid";
import { SearchBox } from "../../components/folder/SearchBox";
import { SortButton } from "../../components/folder/SortButton";
import { SortWindow } from "../../components/folder/SortWindow";
import type { FolderState } from "../../hooks/Folder";

interface FolderPageProps {
  folderState: FolderState;
  onGameDeleted: (id: number) => void;
  onGameSelectMain: (mainGame: MainGame) => void;
  onGameSelectDetail: (id: number) => void;
}

export function FolderPage({
  folderState,
  onGameDeleted,
  onGameSelectMain,
  onGameSelectDetail,
}: FolderPageProps) {
  const {
    presentedGames,
    searchValue,
    sortType,
    sortOrder,
    handleSearchValueChange,
    handleSearchSubmit,
    activeWindow,
    isFolderWindowClosing,
    handleSortChange,
    handleOpenAddWindow,
    handleOpenSortWindow,
    handleCloseFolderWindow,
    handleGameAdded,
    handleGamesCommitted,
    handleAddFlowActiveChange,
  } = folderState;
  const isWindowOpen = activeWindow !== null;

  return (
    <div>
      <div style={{ position: "absolute", inset: 0 }}>
        <div
          aria-hidden={isWindowOpen}
          inert={isWindowOpen}
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            paddingLeft: "4.8rem",
            boxSizing: "border-box",
          }}
        >
          <div
            style={{
              position: "relative",
              paddingLeft: "2rem",
              flexDirection: "row",
              display: "flex",
              alignItems: "center",
              gap: "1rem",
              width: "50%",
              zIndex: 60,
              paddingTop: "0.6rem",
            }}
          >
            <SearchBox
              value={searchValue}
              onValueChange={handleSearchValueChange}
              onSearch={handleSearchSubmit}
            />
            <SortButton onOpenSortWindow={handleOpenSortWindow} />
            <AddButton onOpenAddWindow={handleOpenAddWindow} />
          </div>

          <FolderGrid
            games={presentedGames}
            onGameDeleted={onGameDeleted}
            onGameSelectMain={onGameSelectMain}
            onGameSelectDetail={onGameSelectDetail}
          />
        </div>

        {activeWindow === "add" && (
          <div
            style={{ position: "absolute", inset: "0 0 0 4.8rem", zIndex: 100000 }}
          >
            <AddWindow
              onClose={handleCloseFolderWindow}
              isClosing={isFolderWindowClosing}
              onGamesCommitted={handleGamesCommitted}
              onGameAdded={handleGameAdded}
              onFlowActiveChange={handleAddFlowActiveChange}
            />
          </div>
        )}

        {activeWindow === "sort" && (
          <div
            style={{ position: "absolute", inset: "0 0 0 4.8rem", zIndex: 100000 }}
          >
            <SortWindow
              sortType={sortType}
              sortOrder={sortOrder}
              onSortChange={handleSortChange}
              isClosing={isFolderWindowClosing}
            />
          </div>
        )}
      </div>
    </div>
  );
}
