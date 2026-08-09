import type { ReactNode } from "react";
import { ExpandableSection } from "../ui/ExpandableSection";

interface SettingBarProps {
  title: string;
  description?: string;
  children?: ReactNode;
  disabled?: boolean;
  expanded?: boolean;
  expandedContent?: ReactNode;
}

export function SettingBar({
  title,
  description,
  children,
  disabled = false,
  expanded = false,
  expandedContent,
}: SettingBarProps) {
  return (
    <div
      className="qp-setting-bar"
      style={{
        width: "100%",
        minHeight: "4.85rem",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        color: "var(--qp-text)",
        opacity: disabled ? 0.55 : 1,
        transition: "opacity 0.12s ease",
      }}
    >
      <div
        className="qp-setting-bar-main"
        style={{
          width: "100%",
          minHeight: "4.85rem",
          display: "grid",
          alignItems: "center",
          padding: "0.9rem 1.2rem 0.9rem 1.35rem",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            minWidth: 0,
            maxWidth: "38rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.25rem",
          }}
        >
          <span
            style={{
              color: "var(--qp-text)",
              fontSize: "0.95rem",
              fontWeight: 700,
              lineHeight: 1.25,
            }}
          >
            {title}
          </span>
          {description && (
            <span
              title={description}
              style={{
                minWidth: 0,
                overflow: "hidden",
                color: "var(--qp-muted-text)",
                fontSize: "0.8rem",
                lineHeight: 1.4,
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {description}
            </span>
          )}
        </div>
        {children && (
          <div
            className="qp-setting-bar-control"
            style={{ maxWidth: "34rem", pointerEvents: disabled ? "none" : "auto" }}
          >
            {children}
          </div>
        )}
      </div>

      {expandedContent && (
        <ExpandableSection expanded={expanded}>
          {expandedContent}
        </ExpandableSection>
      )}
    </div>
  );
}
