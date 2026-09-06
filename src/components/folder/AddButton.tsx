import { Plus } from "lucide-react";
import { useI18n } from "../../lib/i18n";

interface AddButtonProps {
  onAddGames: () => void;
}

export function AddButton({ onAddGames }: AddButtonProps) {
  const { t } = useI18n();

  return (
    <div
      style={{ position: "relative", zIndex: 50 }}
      data-tauri-drag-region="false"
    >
      <button
        type="button"
        onClick={onAddGames}
        title={t("add.button.game")}
        aria-label={t("add.button.game")}
        className="s-btn qp-action-icon-button"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "2rem",
          height: "2rem",
          paddingLeft: "0.27rem",
          borderRadius: "50%",
          cursor: "pointer",
          border: "none",
        }}
      >
        <Plus
          size="1rem"
          style={{ marginRight: "0.25rem", color: "var(--qp-text)" }}
        />
      </button>
    </div>
  );
}
