import type { Locale } from "../lib/i18n";

const dateLocales: Record<Locale, string> = {
  zh: "zh-CN",
  en: "en-US",
};

export function formatSearchResultDate(
  timestamp: number,
  locale: Locale,
): string {
  if (!Number.isFinite(timestamp) || timestamp <= 0) return "--";

  const timestampInMs =
    timestamp < 1_000_000_000_000 ? timestamp * 1000 : timestamp;
  return new Date(timestampInMs).toLocaleDateString(dateLocales[locale]);
}

export function formatSearchResultScore(score: number): string {
  if (!Number.isFinite(score) || score <= 0) return "--";
  return score.toFixed(1);
}
