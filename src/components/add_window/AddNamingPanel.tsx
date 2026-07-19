import { ArrowLeft, Search } from "lucide-react";
import { useI18n } from "../../lib/i18n";
import { WindowPanelHeader } from "../ui/WindowPanelHeader";

interface AddNamingPanelProps {
  path: string;
  name: string;
  onNameChange: (name: string) => void;
  onBack: () => void;
  onSearch: () => Promise<void>;
}

export function AddNamingPanel({
  path,
  name,
  onNameChange,
  onBack,
  onSearch,
}: AddNamingPanelProps) {
  const { t } = useI18n();

  return (
    <form
      className="qp-window-panel"
      style={{
        width: "min(86%, 36rem)",
        padding: "1.4rem",
        display: "flex",
        flexDirection: "column",
        gap: "1.2rem",
      }}
      onSubmit={(event) => {
        event.preventDefault();
        void onSearch();
      }}
    >
      <WindowPanelHeader
        title={t("add.name.title")}
        description={t("add.name.description")}
      />

      <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
        <div
          style={{
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
            gap: "0.42rem",
            padding: "0.75rem 0.9rem",
            border: "1px solid var(--qp-input-border)",
            borderRadius: "0.8rem",
            background: "var(--qp-input-bg)",
          }}
        >
          <span
            style={{
              color: "var(--qp-muted-text)",
              fontSize: "0.76rem",
              fontWeight: 680,
            }}
          >
            {t("add.name.path")}
          </span>
          <strong
            title={path}
            style={{
              minWidth: 0,
              overflow: "hidden",
              color: "var(--qp-text)",
              fontSize: "0.84rem",
              fontWeight: 620,
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {path}
          </strong>
        </div>

        <label
          style={{
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
            gap: "0.42rem",
          }}
        >
          <span
            style={{
              color: "var(--qp-muted-text)",
              fontSize: "0.76rem",
              fontWeight: 680,
            }}
          >
            {t("add.name.label")}
          </span>
          <input
            className="qp-form-input"
            style={{ width: "100%", boxSizing: "border-box" }}
            value={name}
            placeholder={t("add.name.placeholder")}
            autoFocus
            onChange={(event) => onNameChange(event.target.value)}
          />
        </label>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.7rem" }}>
        <button
          type="button"
          className="qp-action-button qp-add-footer-button"
          style={{
            minWidth: "8rem",
            padding: "0.65rem 1.2rem",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.45rem",
            borderRadius: "62rem",
            fontSize: "0.92rem",
            fontWeight: 700,
          }}
          onClick={onBack}
        >
          <ArrowLeft size={16} strokeWidth={1.8} />
          {t("add.action.back")}
        </button>
        <button
          type="submit"
          className="qp-action-button qp-add-footer-button is-primary"
          style={{
            minWidth: "8rem",
            padding: "0.65rem 1.2rem",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.45rem",
            borderRadius: "62rem",
            fontSize: "0.92rem",
            fontWeight: 700,
          }}
        >
          <Search size={16} strokeWidth={1.8} />
          {t("add.action.continueSearch")}
        </button>
      </div>
    </form>
  );
}
