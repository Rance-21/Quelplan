import {
  Building2,
  CalendarDays,
  ImageOff,
  Star,
} from "lucide-react";
import { useEffect, useState } from "react";
import type { SearchedGame } from "../../api/Add";
import { useI18n } from "../../lib/i18n";
import { coverSource } from "../../utils/coverSource";
import {
  formatSearchResultDate,
  formatSearchResultScore,
} from "../../utils/searchResultFormatting";

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
        className="qp-candidate-cover is-placeholder"
      >
        <ImageOff size={24} strokeWidth={1.5} />
      </div>
    );
  }

  return (
    <img
      src={coverSource(image)}
      alt={name}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
      className="qp-candidate-cover"
    />
  );
}

export function CandidateMetrics({ game }: { game: SearchedGame }) {
  const { locale, t } = useI18n();

  return (
    <div className="qp-candidate-metrics">
      <span className="qp-candidate-metric" title={t("detail.metrics.score")}>
        <Star size={14} strokeWidth={1.8} />
        {formatSearchResultScore(game.score)}
      </span>
      <span
        className="qp-candidate-metric"
        title={t("detail.metrics.publishDate")}
      >
        <CalendarDays size={14} strokeWidth={1.8} />
        {formatSearchResultDate(game.publish_date, locale)}
      </span>
      <span
        className="qp-candidate-metric is-grow"
        title={game.developer || t("add.candidate.unknownDeveloper")}
      >
        <Building2 size={14} strokeWidth={1.8} />
        {game.developer || t("add.candidate.unknownDeveloper")}
      </span>
    </div>
  );
}
