import { Plus } from "lucide-react";
import { useI18n } from "../../lib/i18n";

interface AddButtonProps {
  onOpenAddWindow: () => void;
}

export function AddButton({ onOpenAddWindow }: AddButtonProps) {
  const { t } = useI18n();

  return (
    <div
      style={{ position: "relative", zIndex: 50 }}
      data-tauri-drag-region="false"
    >
      <button
        type="button"
        onClick={onOpenAddWindow}
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
          backdropFilter: "blur(0.75rem)",
          borderRadius: "50%",
          cursor: "pointer",
          border: "none",
        }}
      >
        <Plus
          size={16}
          style={{ marginRight: "0.25rem", color: "var(--qp-text)" }}
        />
      </button>
    </div>
  );
}
