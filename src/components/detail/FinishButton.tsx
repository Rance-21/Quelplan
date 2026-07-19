import { Trophy } from "lucide-react";
import { useI18n } from "../../lib/i18n";

interface FinishButtonProps {
  ifFinished: boolean;
  disabled?: boolean;
  onClick?: () => void | Promise<void>;
}

export function FinishButton({
  ifFinished,
  disabled = false,
  onClick,
}: FinishButtonProps) {
  const { t } = useI18n();

  return (
    <button
      type="button"
      className="qp-detail-toggle"
      aria-pressed={ifFinished}
      title={ifFinished ? t("detail.finished.on") : t("detail.finished.off")}
      onClick={onClick}
      disabled={disabled}
      style={{
        width: "2.5rem",
        height: "2.5rem",
        borderRadius: "50%",
        border: "none",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: ifFinished ? "rgba(234, 179, 8, 0.16)" : "transparent",
        color: ifFinished ? "#eab308" : "var(--qp-text)",
      }}
    >
      <Trophy
        size={22}
        strokeWidth={2.5}
        fill={ifFinished ? "currentColor" : "none"}
      />
    </button>
  );
}
