import {
  Building2,
  CalendarDays,
  ImageOff,
  Star,
} from "lucide-react";
import { useEffect, useState } from "react";
import type { SearchedGame } from "../../api/Add";
import { useI18n } from "../../lib/i18n";
import { coverSource } from "./coverSource";
import {
  formatSearchResultDate,
  formatSearchResultScore,
} from "./searchResultFormatting";

export function CandidateCover({
  image,
  name,
}: {
  image: string;
  name: string;
}) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [image]);

  if (failed || !image.trim()) {
    return (
      <div
        aria-label={name}
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--qp-muted-text)",
          background: "var(--qp-control-muted)",
        }}
      >
        <ImageOff size={24} strokeWidth={1.5} />
      </div>
    );
  }

  return (
    <img
      src={coverSource(image)}
      alt={name}
      onError={() => setFailed(true)}
      style={{
        width: "100%",
        height: "100%",
        display: "block",
        objectFit: "cover",
      }}
    />
  );
}

export function CandidateMetrics({ game }: { game: SearchedGame }) {
  const { locale, t } = useI18n();
  const metricStyle = {
    minWidth: 0,
    display: "flex",
    alignItems: "center",
    gap: "0.3rem",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  } as const;

  return (
    <div
      style={{
        minWidth: 0,
        display: "flex",
        alignItems: "center",
        gap: "0.85rem",
        color: "var(--qp-muted-text)",
        fontSize: "0.78rem",
      }}
    >
      <span title={t("detail.metrics.score")} style={metricStyle}>
        <Star size={14} strokeWidth={1.8} />
        {formatSearchResultScore(game.score)}
      </span>
      <span title={t("detail.metrics.publishDate")} style={metricStyle}>
        <CalendarDays size={14} strokeWidth={1.8} />
        {formatSearchResultDate(game.publish_date, locale)}
      </span>
      <span
        title={game.developer || t("add.candidate.unknownDeveloper")}
        style={{ ...metricStyle, flex: 1 }}
      >
        <Building2 size={14} strokeWidth={1.8} />
        {game.developer || t("add.candidate.unknownDeveloper")}
      </span>
    </div>
  );
}
