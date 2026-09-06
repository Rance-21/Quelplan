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
  onAddGames: () => void;
}

export default function FolderPage({
  folderState,
  onGameDeleted,
  onGameSelectMain,
  onGameSelectDetail,
  onAddGames,
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
    handleOpenSortWindow,
  } = folderState;
  const isWindowOpen = activeWindow !== null;

  return (
    <div className="qp-page-surface" style={{ position: "absolute", inset: 0 }}>
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
            paddingLeft: "2.5rem",
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
          <AddButton onAddGames={onAddGames} />
        </div>

        <FolderGrid
          games={presentedGames}
          onGameDeleted={onGameDeleted}
          onGameSelectMain={onGameSelectMain}
          onGameSelectDetail={onGameSelectDetail}
        />
      </div>

      {activeWindow === "sort" && (
        <div
          style={{
            position: "absolute",
            inset: "0 0 0 4.8rem",
            zIndex: 100000,
          }}
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
  );
}
