import { launchGame } from "../../api/Launch";
import { useI18n } from "../../lib/i18n";

export function StartGame({ id }: { id: number }) {
  const { t } = useI18n();

  return (
    <button
      type="button"
      className="qp-start-game"
      style={{
        minWidth: "10rem",
        padding: "0.75rem 1.8rem",
        border: "1px solid var(--qp-panel-border)",
        borderRadius: "999rem",
        background: "var(--qp-panel-hover)",
        color: "var(--qp-text)",
        boxShadow: "var(--qp-panel-shadow)",
        cursor: "pointer",
        fontSize: "1.05rem",
        fontWeight: 750,
      }}
      onClick={() => {
        void launchGame(id).catch(() => undefined);
      }}
    >
      {t("common.action.startGame")}
    </button>
  );
}
