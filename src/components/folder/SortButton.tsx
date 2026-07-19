import { ListOrdered } from "lucide-react";
import { useI18n } from "../../lib/i18n";

interface SortButtonProps {
  onOpenSortWindow: () => void;
}

export function SortButton({ onOpenSortWindow }: SortButtonProps) {
  const { t } = useI18n();

  return (
    <div style={{ position: "relative", zIndex: 50 }}>
      <button
        type="button"
        onClick={onOpenSortWindow}
        title={t("folder.sort.name")}
        aria-label={t("folder.sort.name")}
        className="qp-action-icon-button"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "2rem",
          height: "2rem",
          borderRadius: "50%",
          cursor: "pointer",
          border: "none",
        }}
      >
        <ListOrdered size={16} />
      </button>
    </div>
  );
}
