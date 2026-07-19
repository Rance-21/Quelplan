import { convertFileSrc } from "@tauri-apps/api/core";
import { memo } from "react";
import type { MainGame } from "../../api/GetMainGame";

interface MainGamePreviewProps {
  mainGame: MainGame;
  onOpenDetail: (id: number) => void;
}

export const MainGamePreview = memo(function MainGamePreview({
  mainGame,
  onOpenDetail,
}: MainGamePreviewProps) {
  const safeImageSrc = convertFileSrc(mainGame.coverUrl);

  return (
    <div
      style={{
        position: "absolute",
        left: "8.5rem",
        bottom: "4rem",
        maxWidth: "26rem",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: "0.75rem",
      }}
    >
      <button
        type="button"
        className="main-game-preview-button"
        onClick={() => {
          onOpenDetail(mainGame.id);
        }}
        style={{
          position: "relative",
          maxWidth: "27rem",
          maxHeight: "64vh",
          padding: 0,
          background: "transparent",
          cursor: "pointer",
          overflow: "hidden",
          borderRadius: "1rem",
          boxShadow: "var(--qp-shadow-soft)",
        }}
      >
        <img
          src={safeImageSrc}
          alt={mainGame.name}
          style={{
            display: "block",
            maxHeight: "56vh",
            width: "auto",
            height: "auto",
          }}
        />
        <span
          aria-hidden="true"
          className="main-game-preview-overlay"
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(255, 255, 255, 0.28)",
            pointerEvents: "none",
          }}
        />
      </button>
      <span
        style={{
          maxWidth: "22rem",
          color: "var(--qp-text)",
          fontSize: "1.35rem",
          fontWeight: 700,
          lineHeight: 1.25,
          overflowWrap: "anywhere",
          textShadow: "0 0.08rem 0.5rem rgba(0, 0, 0, 0.18)",
        }}
      >
        {mainGame.name}
      </span>
    </div>
  );
});
