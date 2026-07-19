import { useI18n } from "../../lib/i18n";

interface BackgroundSelectButtonProps {
  onClick: () => void;
}

export function BackgroundSelectButton({ onClick }: BackgroundSelectButtonProps) {
  const { t } = useI18n();

  return (
    <button
      type="button"
      onClick={onClick}
      className="qp-action-button"
      style={{
        minWidth: "4.8rem",
        height: "2.2rem",
        padding: "0 1rem",
        border: "none",
        borderRadius: "999rem",
        backgroundColor: "var(--qp-control-bg)",
        color: "var(--qp-text)",
        boxShadow: "none",
        cursor: "pointer",
        fontSize: "0.9rem",
        fontWeight: 700,
      }}
    >
      {t("common.action.set")}
    </button>
  );
}
