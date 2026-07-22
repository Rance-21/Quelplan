import type { Game } from "../../api/detailgame";
import { useI18n, type Locale } from "../../lib/i18n";

const dateLocales: Record<Locale, string> = {
  zh: "zh-CN",
  en: "en-US",
};

interface MetricItemProps {
  label: string;
  value: string | number;
}

function MetricItem({ label, value }: MetricItemProps) {
  return (
    <div className="qp-detail-metric">
      <span className="qp-detail-metric-label" title={label}>
        {label}
      </span>
      <span
        className="qp-detail-metric-value"
        title={String(value || "--")}
      >
        {value || "--"}
      </span>
    </div>
  );
}

function formatDate(timestamp: number, locale: Locale) {
  if (!Number.isFinite(timestamp) || timestamp <= 0) return "--";

  const timestampInMs =
    timestamp < 1_000_000_000_000 ? timestamp * 1000 : timestamp;
  return new Date(timestampInMs).toLocaleDateString(dateLocales[locale]);
}

function formatPlayHours(seconds: number, locale: Locale) {
  if (!Number.isFinite(seconds) || seconds < 0) return "--";

  const unit = locale === "zh" ? "小时" : "h";
  return `${(seconds / 3600).toFixed(1)} ${unit}`;
}

export function DetailMetrics({ game }: { game: Game }) {
  const { locale, t } = useI18n();
  const metrics: MetricItemProps[] = [
    {
      label: t("detail.metrics.lastPlayed"),
      value: formatDate(game.last_played, locale),
    },
    {
      label: t("detail.metrics.playTime"),
      value: formatPlayHours(game.play_time, locale),
    },
    {
      label: t("detail.metrics.addedTime"),
      value: formatDate(game.added_time, locale),
    },
    { label: t("detail.metrics.score"), value: game.score },
    { label: t("detail.metrics.developer"), value: game.developer },
    {
      label: t("detail.metrics.publishDate"),
      value: formatDate(game.publish_date, locale),
    },
  ];

  return (
    <div className="qp-detail-metrics">
      {metrics.map((metric) => (
        <MetricItem key={metric.label} {...metric} />
      ))}
    </div>
  );
}
