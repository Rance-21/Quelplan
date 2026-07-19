import {
  ArrowDownWideNarrow,
  ArrowUpNarrowWide,
  type LucideIcon,
} from "lucide-react";
import { useI18n } from "../../lib/i18n";
import type { SortOrder, SortType } from "../../utils/SortGames";
import { AnimatedWindowFrame } from "../ui/AnimatedWindowFrame";
import { WindowPanelHeader } from "../ui/WindowPanelHeader";

interface SortChoiceProps {
  label: string;
  selected: boolean;
  icon?: LucideIcon;
  onClick: () => void;
}

function SortChoice({
  label,
  selected,
  icon: Icon,
  onClick,
}: SortChoiceProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`qp-sort-choice${selected ? " is-selected" : ""}`}
      style={{
        minWidth: 0,
        height: "3rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "0.55rem",
        padding: "0 0.8rem",
        border: selected ? "1px solid var(--qp-input-focus)" : undefined,
        borderRadius: "0.8rem",
        background: selected ? "var(--qp-panel-hover)" : undefined,
        color: selected ? "var(--qp-text)" : undefined,
        boxShadow: selected
          ? "0 0 0 2px color-mix(in srgb, var(--qp-input-focus) 12%, transparent)"
          : undefined,
        cursor: "pointer",
        fontSize: "0.95rem",
        fontWeight: 700,
        transition:
          "background-color 0.12s ease, border-color 0.12s ease, color 0.12s ease, box-shadow 0.12s ease",
      }}
    >
      {Icon && <Icon size={17} strokeWidth={1.8} />}
      <span>{label}</span>
    </button>
  );
}

interface SortWindowProps {
  sortType: SortType;
  sortOrder: SortOrder;
  onSortChange: (type: SortType, order: SortOrder) => void;
  isClosing: boolean;
}

export function SortWindow({
  sortType,
  sortOrder,
  onSortChange,
  isClosing,
}: SortWindowProps) {
  const { t } = useI18n();

  return (
    <AnimatedWindowFrame isClosing={isClosing}>
      <section
        className="qp-window-panel"
        style={{
          width: "min(84%, 34rem)",
          margin: "auto",
          padding: "1.4rem",
          display: "flex",
          flexDirection: "column",
          gap: "1.15rem",
        }}
      >
        <WindowPanelHeader
          title={t("folder.sort.title")}
          description={t("folder.sort.description")}
        />

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
            gap: "0.75rem",
          }}
        >
          <SortChoice
            label={t("folder.sort.name")}
            selected={sortType === "name"}
            onClick={() => onSortChange("name", sortOrder)}
          />
          <SortChoice
            label={t("folder.sort.time")}
            selected={sortType === "time"}
            onClick={() => onSortChange("time", sortOrder)}
          />
          <SortChoice
            label={t("folder.sort.score")}
            selected={sortType === "score"}
            onClick={() => onSortChange("score", sortOrder)}
          />
        </div>

        <div style={{ height: 1, background: "var(--qp-panel-border)" }} />

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: "0.75rem",
          }}
        >
          <SortChoice
            label={t("folder.sort.asc")}
            selected={sortOrder === "asc"}
            icon={ArrowUpNarrowWide}
            onClick={() => onSortChange(sortType, "asc")}
          />
          <SortChoice
            label={t("folder.sort.desc")}
            selected={sortOrder === "desc"}
            icon={ArrowDownWideNarrow}
            onClick={() => onSortChange(sortType, "desc")}
          />
        </div>
      </section>
    </AnimatedWindowFrame>
  );
}
