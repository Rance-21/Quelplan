import type { ReactNode } from "react";

interface AnimatedWindowFrameProps {
  isClosing: boolean;
  children: ReactNode;
}

export function AnimatedWindowFrame({
  isClosing,
  children,
}: AnimatedWindowFrameProps) {
  return (
    <div
      className={`qp-window-frame qp-page-surface${isClosing ? " is-closing" : ""}`}
      aria-busy={isClosing}
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        border: "1px solid var(--qp-border-soft)",
        borderLeft: "none",
        borderRadius: "0 1.5rem 1.5rem 0",
        boxSizing: "border-box",
        transformOrigin: "center",
      }}
    >
      <div
        data-tauri-drag-region
        style={{ height: "3rem", flexShrink: 0 }}
      />

      <div style={{ minHeight: 0, flex: 1, display: "flex" }}>{children}</div>
    </div>
  );
}
