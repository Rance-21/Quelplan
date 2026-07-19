import type { CSSProperties, ReactNode } from "react";
import { ExpandableSection } from "../ui/ExpandableSection";

interface DetailRowProps {
  label: string;
  children: ReactNode;
  style?: CSSProperties;
  expanded?: boolean;
  expandedContent?: ReactNode;
}

export function DetailRow({
  label,
  children,
  style,
  expanded = false,
  expandedContent,
}: DetailRowProps) {
  return (
    <div
      className="qp-detail-row"
      style={{
        display: "flex",
        flexShrink: 0,
        flexDirection: "column",
        overflow: "hidden",
        border: "1px solid var(--qp-panel-border)",
        borderRadius: "0.9rem",
        background: "var(--qp-panel-bg)",
        boxShadow: "0 0.45rem 1.4rem rgba(0, 0, 0, 0.08)",
        ...style,
      }}
    >
      <div
        className="qp-detail-row-main"
        style={{
          minHeight: "3.75rem",
          display: "flex",
          padding: "0.65rem 1rem 0.65rem 1.2rem",
          boxSizing: "border-box",
        }}
      >
        <span
          className="qp-detail-row-label"
          style={{
            flexShrink: 0,
            color: "var(--qp-muted-text)",
            fontSize: "0.84rem",
            fontWeight: 680,
            lineHeight: 1.35,
          }}
        >
          {label}
        </span>
        {children}
      </div>

      {expandedContent && (
        <ExpandableSection expanded={expanded}>
          {expandedContent}
        </ExpandableSection>
      )}
    </div>
  );
}
