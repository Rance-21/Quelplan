import { convertFileSrc } from "@tauri-apps/api/core";
import { dirname } from "@tauri-apps/api/path";
import { memo, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { FolderGame } from "../../api/foldergames";
import type { MainGame } from "../../api/GetMainGame";
import { launchGame } from "../../api/Launch";
import { openFolder } from "../../api/OpenFolder";
import { deleteGame } from "../../api/delete";
import { useI18n } from "../../lib/i18n";

interface GameCardProps {
  folderGame: FolderGame;
  onSelectMain: (mainGame: MainGame) => void;
  onSelectDetail: (id: number) => void;
  onDelete: (id: number) => void;
}

export const GameCard = memo(function GameCard({
  folderGame,
  onSelectMain,
  onSelectDetail,
  onDelete,
}: GameCardProps) {
  const { t } = useI18n();
  const [showMenu, setShowMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const safeImageSrc = convertFileSrc(folderGame.coverUrl);

  useEffect(() => {
    if (!showMenu) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        cardRef.current &&
        !cardRef.current.contains(event.target as Node) &&
        (!menuRef.current || !menuRef.current.contains(event.target as Node))
      ) {
        setShowMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showMenu]);

  const handleDeleteGame = async () => {
    if (!window.confirm(t("confirm.deleteGame"))) return;

    const success = await deleteGame(folderGame.id);
    if (success) onDelete(folderGame.id);
  };

  const handleOpenFolder = async () => {
    const path = await dirname(folderGame.path);
    await openFolder(path);
  };

  const menuItems = [
    {
      id: "start",
      label: t("common.action.startGame"),
      action: () => launchGame(folderGame.id),
    },
    {
      id: "detail",
      label: t("common.action.detail"),
      action: () => onSelectDetail(folderGame.id),
    },
    {
      id: "delete",
      label: t("common.action.deleteGame"),
      action: handleDeleteGame,
    },
    {
      id: "folder",
      label: t("common.action.fileFolder"),
      action: handleOpenFolder,
    },
  ];

  return (
    <div
      ref={cardRef}
      onClick={(event) => {
        if (event.button === 0 && !showMenu) {
          onSelectMain({
            id: folderGame.id,
            name: folderGame.name,
            coverUrl: folderGame.coverUrl,
          });
        }
      }}
      onContextMenu={(event) => {
        event.preventDefault();
        event.stopPropagation();
        setMenuPosition({ x: event.clientX, y: event.clientY });
        setShowMenu(true);
      }}
      style={{
        aspectRatio: "3 / 4",
        borderRadius: "0.75rem",
        overflow: "hidden",
        position: "relative",
        cursor: "pointer",
      }}
      className="game-card"
    >
      <img
        src={safeImageSrc}
        alt={folderGame.name}
        loading="lazy"
        decoding="async"
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
        className="game-card-image"
      />

      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: "100%",
          padding: "1rem",
          background:
            "linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%)",
        }}
      >
        <h3
          style={{
            color: "white",
            fontWeight: "bold",
            margin: 0,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {folderGame.name}
        </h3>
      </div>

      {showMenu &&
        createPortal(
          <div
            ref={menuRef}
            onContextMenu={(event) => event.preventDefault()}
            style={{
              position: "fixed",
              top: `${menuPosition.y}px`,
              left: `${menuPosition.x}px`,
              width: "8.5rem",
              background: "var(--qp-surface-muted)",
              borderRadius: "1rem",
              padding: "0.5rem 0",
              display: "flex",
              flexDirection: "column",
              gap: "0.25rem",
              zIndex: 99999,
            }}
          >
            {menuItems.map((item) => (
              <button
                type="button"
                key={item.id}
                className="game-card-menu-item"
                onClick={(event) => {
                  event.stopPropagation();
                  void Promise.resolve(item.action()).catch(() => undefined);
                  setShowMenu(false);
                }}
                style={{
                  width: "100%",
                  padding: "0.5rem 1rem",
                  background: "transparent",
                  color: "var(--qp-text)",
                  fontSize: "0.9rem",
                  fontWeight: "bold",
                  textAlign: "center",
                  cursor: "pointer",
                }}
              >
                {item.label}
              </button>
            ))}
          </div>,
          document.body,
        )}
    </div>
  );
});
