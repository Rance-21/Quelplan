import { convertFileSrc } from "@tauri-apps/api/core";
import { memo } from "react";
import LightBackground from "../assets/light.png";
import DarkBackground from "../assets/dark.png";
import { useBackgroundSettings } from "../lib/background";
import type { AppPage } from "../lib/navigation";
import { useTheme } from "../lib/theme";

interface AppBackgroundProps {
  currentPage: AppPage;
  isOverlayWindowOpen: boolean;
}

export const AppBackground = memo(function AppBackground({
  currentPage,
  isOverlayWindowOpen,
}: AppBackgroundProps) {
  const { resolvedMode } = useTheme();
  const { lightBackgroundPath, darkBackgroundPath } = useBackgroundSettings();
  const customBackgroundPath =
    resolvedMode === "dark" ? darkBackgroundPath : lightBackgroundPath;

  const defaultBackgroundSrc =
    resolvedMode === "dark" ? DarkBackground : LightBackground;

  const backgroundSrc = customBackgroundPath
    ? convertFileSrc(customBackgroundPath)
    : defaultBackgroundSrc;
  const isFocusPage =
    currentPage === "Settings" ||
    currentPage === "Detail" ||
    isOverlayWindowOpen;

  return (
    <div
      style={{ position: "absolute", inset: 0, zIndex: -1, overflow: "hidden" }}
    >
      <img
        src={backgroundSrc}
        alt="Background"
        style={{
          width: "100%",
          height: "100%",
          display: "block",
          objectFit: "cover",
          transform: currentPage === "Home" ? "scale(1)" : "scale(1.05)",
          filter: isFocusPage
            ? "var(--qp-focused-background-filter)"
            : currentPage === "Home"
              ? undefined
              : "blur(0.2rem)",
          transition: "transform 0.2s ease",
        }}
      />
    </div>
  );
});
