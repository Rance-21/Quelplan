import { memo, useEffect, useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import type { FolderGame } from "../../api/foldergames";
import { useFolderGrid } from "../../hooks/useFolderGrid";
import { GameCard } from "./GameCard";
import type { MainGame } from "../../api/GetMainGame";

interface FolderGridProps {
  games: FolderGame[];
  onGameDeleted: (id: number) => void;
  onGameSelectMain: (mainGame: MainGame) => void;
  onGameSelectDetail: (id: number) => void;
}

export const FolderGrid = memo(function FolderGrid({
  games,
  onGameDeleted,
  onGameSelectMain,
  onGameSelectDetail,
}: FolderGridProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const gapRem = 1.5;
  const layout = useFolderGrid(scrollContainerRef, 10, gapRem);
  const columns = layout?.columns ?? null;
  const rowCount = columns === null ? 0 : Math.ceil(games.length / columns);
  const itemWidth =
    columns === null
      ? "100%"
      : `calc((100% - ${(columns - 1) * gapRem}rem) / ${columns})`;

  const virtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => scrollContainerRef.current,
    estimateSize: () => layout?.rowStride ?? 280,
    overscan: 3,
  });

  useEffect(() => {
    virtualizer.measure();
  }, [layout?.rowStride, virtualizer]);

  return (
    <div
      id="folder-scroll-container"
      ref={scrollContainerRef}
      style={{
        flex: 1,
        overflowY: "auto",
        padding: "2rem",
        paddingTop: "1.5rem",
      }}
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: "100%",
          position: "relative",
        }}
      >
        {/* Render visible cards directly instead of wrapping each row. */}
        {columns !== null &&
          virtualizer.getVirtualItems().flatMap((virtualRow) => {
            const startIndex = virtualRow.index * columns;
            const rowGames = games.slice(startIndex, startIndex + columns);

            return rowGames.map((game, indexInRow) => {
              const leftPos = `calc(${indexInRow} * (${itemWidth} + ${gapRem}rem))`;

              return (
                <div
                  key={game.id}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: leftPos,
                    width: itemWidth,
                    height: `${layout?.cardHeight ?? virtualRow.size}px`,
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                >
                  <GameCard
                    folderGame={game}
                    onSelectMain={onGameSelectMain}
                    onSelectDetail={onGameSelectDetail}
                    onDelete={onGameDeleted}
                  />
                </div>
              );
            });
          })}
      </div>
    </div>
  );
});
