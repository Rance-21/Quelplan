import { Check, Database } from "lucide-react";
import type { DataSourceKey, DataSourceSelection } from "../../api/Add";
import { useI18n, type TranslationKey } from "../../lib/i18n";

interface DataSourceSelectorProps {
  sources: DataSourceSelection;
  disabled?: boolean;
  onSourceChange: (source: DataSourceKey, enabled: boolean) => void;
}

const dataSourceOptions: {
  id: DataSourceKey;
  label: string;
  titleKey: TranslationKey;
}[] = [
  { id: "bgm", label: "BGM", titleKey: "add.dataSource.bgm.title" },
  { id: "vndb", label: "VNDB", titleKey: "add.dataSource.vndb.title" },
  { id: "igdb", label: "IGDB", titleKey: "add.dataSource.igdb.title" },
];

export function DataSourceSelector({
  sources,
  disabled = false,
  onSourceChange,
}: DataSourceSelectorProps) {
  const { t } = useI18n();

  return (
    <div
      style={{
        width: "100%",
        display: "grid",
        gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
        gap: "0.7rem",
      }}
    >
      {dataSourceOptions.map(({ id, label, titleKey }) => {
        const isIncluded = sources[id];

        return (
          <button
            key={id}
            type="button"
            title={t(titleKey)}
            aria-pressed={isIncluded}
            disabled={disabled}
            onClick={() => onSourceChange(id, !isIncluded)}
            className={`qp-add-option-choice${isIncluded ? " is-selected" : ""}`}
          >
            <Database size={17} strokeWidth={1.7} />
            <span
              style={{
                minWidth: 0,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {label}
            </span>
            <Check
              size={16}
              strokeWidth={2}
              className="qp-add-option-check"
              style={{
                flexShrink: 0,
                opacity: isIncluded && !disabled ? 1 : 0,
                transition: "opacity 0.12s ease",
              }}
            />
          </button>
        );
      })}
    </div>
  );
}
