import { SettingBar } from "../../components/setting/SettingBar";
import { useSettingsRows } from "../../hooks/useSettingsRows";
import { useI18n } from "../../lib/i18n";

export default function SettingsPage() {
  const settings = useSettingsRows();
  const { t } = useI18n();

  return (
    <div
      className="qp-settings-page qp-page-surface no-scrollbar"
      style={{
        position: "absolute",
        inset: 0,
        boxSizing: "border-box",
        overflowY: "auto",
      }}
    >
      <div
        style={{ width: "min(100%, 72rem)", margin: "0 auto", paddingBottom: "2rem" }}
      >
        <header style={{ marginBottom: "1.15rem", padding: "0 0.15rem" }}>
          <span className="qp-page-kicker">QUELPLAN</span>
          <h1
            style={{
              margin: 0,
              color: "var(--qp-text)",
              fontSize: "clamp(1.8rem, 2.4vw, 2.35rem)",
              fontWeight: 720,
              letterSpacing: "-0.035em",
              lineHeight: 1.1,
            }}
          >
            {t("settings.page.title")}
          </h1>
          <p
            style={{
              margin: "0.45rem 0 0",
              color: "var(--qp-muted-text)",
              fontSize: "0.88rem",
              lineHeight: 1.5,
            }}
          >
            {t("settings.page.description")}
          </p>
        </header>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.72rem" }}>
          {settings.map((item) => (
            <SettingBar
              key={item.id}
              title={item.title}
              description={item.description}
              disabled={item.disabled}
              expanded={item.expanded}
              expandedContent={item.expandedContent}
            >
              {item.content}
            </SettingBar>
          ))}
        </div>
      </div>
    </div>
  );
}
