import {
  ArrowDownWideNarrow,
  ArrowUpNarrowWide,
  type LucideIcon,
} from "lucide-react";
import { useI18n } from "../../lib/i18n";
import { sortTypes, type SortOrder, type SortType } from "../../utils/SortGames";
import { AnimatedWindowFrame } from "../ui/AnimatedWindowFrame";
import { WindowPanelHeader } from "../ui/WindowPanelHeader";

const sortOrders = [
  { value: "asc", icon: ArrowUpNarrowWide },
  { value: "desc", icon: ArrowDownWideNarrow },
] as const;

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
    >
      {Icon && <Icon size={17} strokeWidth={1.8} aria-hidden="true" />}
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
      <section className="qp-window-panel qp-sort-panel">
        <WindowPanelHeader
          title={t("folder.sort.title")}
          description={t("folder.sort.description")}
        />

        <div className="qp-sort-choices">
          {sortTypes.map((type) => (
            <SortChoice
              key={type}
              label={t(`folder.sort.${type}`)}
              selected={sortType === type}
              onClick={() => onSortChange(type, sortOrder)}
            />
          ))}
        </div>

        <div className="qp-sort-divider" />

        <div className="qp-sort-choices">
          {sortOrders.map(({ value, icon }) => (
            <SortChoice
              key={value}
              label={t(`folder.sort.${value}`)}
              selected={sortOrder === value}
              icon={icon}
              onClick={() => onSortChange(sortType, value)}
            />
          ))}
        </div>
      </section>
    </AnimatedWindowFrame>
  );
}
