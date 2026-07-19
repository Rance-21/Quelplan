import type { ReactNode } from "react";

interface ExpandableSectionProps {
  expanded: boolean;
  children: ReactNode;
}

export function ExpandableSection({
  expanded,
  children,
}: ExpandableSectionProps) {
  return (
    <div
      className={`qp-expandable-section${expanded ? " is-expanded" : ""}`}
      aria-hidden={!expanded}
      inert={!expanded}
      style={{
        width: "100%",
        display: "grid",
        gridTemplateRows: expanded ? "1fr" : "0fr",
        opacity: expanded ? 1 : 0,
        visibility: expanded ? "visible" : "hidden",
        transform: expanded ? "translateY(0)" : "translateY(-0.25rem)",
        transition: expanded
          ? "grid-template-rows 0.2s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.12s ease, transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), visibility 0s linear 0s"
          : "grid-template-rows 0.2s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.12s ease, transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), visibility 0s linear 0.2s",
      }}
    >
      <div style={{ minHeight: 0, overflow: "hidden" }}>
        <div style={{ borderTop: "1px solid var(--qp-border-soft)" }}>
          {children}
        </div>
      </div>
    </div>
  );
}
