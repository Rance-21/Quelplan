import { Download, RefreshCw } from "lucide-react";
import type {
  AppUpdateInfo,
  AppUpdaterPhase,
} from "../../hooks/useAppUpdater";
import { useI18n } from "../../lib/i18n";
import type { UpdateDownloadProgress } from "../../lib/updateProgress";
import { AnimatedWindowFrame } from "../ui/AnimatedWindowFrame";
import { WindowPanelHeader } from "../ui/WindowPanelHeader";

interface UpdateWindowProps {
  updateInfo: AppUpdateInfo;
  phase: AppUpdaterPhase;
  progress: UpdateDownloadProgress;
  isClosing: boolean;
  onCancel: () => void;
  onUpdate: () => void;
}

function formatUpdateDate(date: string | undefined, locale: string) {
  if (!date) return null;

  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime())) return date;

  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(parsedDate);
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function UpdateWindow({
  updateInfo,
  phase,
  progress,
  isClosing,
  onCancel,
  onUpdate,
}: UpdateWindowProps) {
  const { locale, t } = useI18n();
  const isBusy = phase === "downloading" || phase === "installing";
  const formattedDate = formatUpdateDate(updateInfo.date, locale);
  const statusText =
    phase === "downloading"
      ? progress.percentage === null
        ? t("update.status.downloadingBytes", {
            downloaded: formatBytes(progress.downloadedBytes),
          })
        : t("update.status.downloading", {
            percentage: progress.percentage,
          })
      : phase === "installing"
        ? t("update.status.installing")
        : phase === "readyToRestart"
          ? t("update.status.readyToRestart")
          : null;

  return (
    <AnimatedWindowFrame isClosing={isClosing}>
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="quelplan-update-title"
        aria-busy={isBusy}
        className="qp-window-panel"
        style={{
          width: "min(86%, 38rem)",
          maxHeight: "min(78%, 34rem)",
          margin: "auto",
          padding: "1.4rem",
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        <div id="quelplan-update-title">
          <WindowPanelHeader
            title={t("update.window.title")}
            description={t("update.window.description", {
              current: updateInfo.currentVersion,
              next: updateInfo.version,
            })}
          />
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: "0.75rem",
          }}
        >
          <div
            style={{
              padding: "0.75rem 0.9rem",
              border: "1px solid var(--qp-input-border)",
              borderRadius: "0.8rem",
              background: "var(--qp-input-bg)",
            }}
          >
            <span
              style={{ color: "var(--qp-muted-text)", fontSize: "0.76rem" }}
            >
              {t("update.version.current")}
            </span>
            <strong style={{ display: "block", marginTop: "0.3rem" }}>
              v{updateInfo.currentVersion}
            </strong>
          </div>
          <div
            style={{
              padding: "0.75rem 0.9rem",
              border: "1px solid var(--qp-input-focus)",
              borderRadius: "0.8rem",
              background: "var(--qp-panel-hover)",
            }}
          >
            <span
              style={{ color: "var(--qp-muted-text)", fontSize: "0.76rem" }}
            >
              {t("update.version.available")}
            </span>
            <strong style={{ display: "block", marginTop: "0.3rem" }}>
              v{updateInfo.version}
            </strong>
          </div>
        </div>

        <div
          style={{
            minHeight: 0,
            padding: "0.85rem 0.95rem",
            border: "1px solid var(--qp-panel-border)",
            borderRadius: "0.8rem",
            background: "var(--qp-input-bg)",
            overflow: "auto",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: "0.75rem",
              marginBottom: "0.45rem",
            }}
          >
            <strong style={{ fontSize: "0.86rem" }}>
              {t("update.notes.title")}
            </strong>
            {formattedDate && (
              <span
                style={{ color: "var(--qp-muted-text)", fontSize: "0.76rem" }}
              >
                {formattedDate}
              </span>
            )}
          </div>
          <p
            style={{
              margin: 0,
              color: "var(--qp-muted-text)",
              fontSize: "0.84rem",
              lineHeight: 1.55,
              whiteSpace: "pre-wrap",
              overflowWrap: "anywhere",
            }}
          >
            {updateInfo.notes?.trim() || t("update.notes.empty")}
          </p>
        </div>

        {statusText && (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "0.45rem" }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                color: "var(--qp-muted-text)",
                fontSize: "0.82rem",
                fontWeight: 680,
              }}
            >
              {phase === "readyToRestart" ? (
                <RefreshCw size={15} strokeWidth={1.8} />
              ) : (
                <Download size={15} strokeWidth={1.8} />
              )}
              <span>{statusText}</span>
            </div>
            {(phase === "downloading" || phase === "installing") && (
              <div
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={
                  phase === "installing" ? 100 : progress.percentage ?? undefined
                }
                style={{
                  height: "0.45rem",
                  borderRadius: "999rem",
                  background: "var(--qp-action-disabled-bg)",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width:
                      phase === "installing"
                        ? "100%"
                        : progress.percentage === null
                          ? "35%"
                          : `${progress.percentage}%`,
                    height: "100%",
                    borderRadius: "inherit",
                    background: "var(--qp-primary-action-bg)",
                    transition: "width 0.15s ease",
                  }}
                />
              </div>
            )}
          </div>
        )}

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "0.75rem",
          }}
        >
          <button
            type="button"
            className="qp-action-button qp-add-footer-button"
            style={{
              minWidth: "8rem",
              padding: "0.65rem 1.2rem",
              borderRadius: "62rem",
              fontSize: "0.92rem",
              fontWeight: 700,
            }}
            disabled={isBusy}
            onClick={onCancel}
          >
            {t("update.action.cancel")}
          </button>
          <button
            type="button"
            className="qp-action-button qp-add-footer-button is-primary"
            style={{
              minWidth: "8rem",
              padding: "0.65rem 1.2rem",
              borderRadius: "62rem",
              fontSize: "0.92rem",
              fontWeight: 700,
            }}
            disabled={isBusy}
            onClick={onUpdate}
          >
            {phase === "downloading"
              ? t("update.action.downloading")
              : phase === "installing"
                ? t("update.action.installing")
                : phase === "readyToRestart"
                  ? t("update.action.restart")
                  : t("update.action.update")}
          </button>
        </div>
      </section>
    </AnimatedWindowFrame>
  );
}
