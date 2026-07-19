import { useMemo } from "react";
import type { DailyPlayTime } from "../../api/detailgame";
import { useI18n, type Locale } from "../../lib/i18n";
import { DetailRow } from "./DetailRow";

const dateLocales: Record<Locale, string> = {
  zh: "zh-CN",
  en: "en-US",
};

interface PlayTimeChartProps {
  records: DailyPlayTime[];
}

export function PlayTimeChart({ records }: PlayTimeChartProps) {
  const { locale, t } = useI18n();
  const slots = useMemo<(DailyPlayTime | null)[]>(() => {
    const visibleRecords = records
      .filter(
        (record) =>
          Number.isFinite(record.play_date) &&
          record.play_date > 0 &&
          Number.isFinite(record.play_time) &&
          record.play_time >= 0,
      )
      .sort((firstRecord, secondRecord) => {
        return firstRecord.play_date - secondRecord.play_date;
      })
      .slice(-7);

    return [
      ...Array<DailyPlayTime | null>(7 - visibleRecords.length).fill(null),
      ...visibleRecords,
    ];
  }, [records]);

  const maxPlayTime = Math.max(
    0,
    ...slots.map((record) => record?.play_time ?? 0),
  );

  const formatDate = (dateInt: number) => {
    const year = Math.floor(dateInt / 10000);

    const month = Math.floor((dateInt % 10000) / 100) - 1;

    const day = dateInt % 100;

    return new Date(year, month, day).toLocaleDateString(dateLocales[locale], {
      month: "numeric",
      day: "numeric",
    });
  };

  const formatHours = (seconds: number) => {
    return `${(seconds / 3600).toFixed(1)} ${t("detail.playTimeChart.hourUnit")}`;
  };

  return (
    <DetailRow
      label={t("detail.playTimeChart.title")}
      style={{
        height: "12rem",
        flexShrink: 0,
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          flex: 1,
          minWidth: 0,
          height: "10.5rem",
          display: "flex",
          alignItems: "stretch",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: "40.5rem",
            flex: "0 0 40.5rem",
            display: "grid",
            gridTemplateColumns: "repeat(7, 4.5rem)",
            columnGap: "1.5rem",
          }}
        >
          {slots.map((record, index) => {
            const playTime = record?.play_time ?? 0;
            const barHeight =
              maxPlayTime > 0 ? (playTime / maxPlayTime) * 100 : 0;

            return (
              <div
                key={record?.play_date ?? `empty-${index}`}
                title={
                  record
                    ? `${formatDate(record.play_date)} · ${formatHours(playTime)}`
                    : `-- · ${formatHours(0)}`
                }
                style={{
                  width: "4.5rem",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <span
                  style={{
                    color: "var(--qp-muted-text)",
                    fontSize: "0.88rem",
                    whiteSpace: "nowrap",
                  }}
                >
                  {formatHours(playTime)}
                </span>
                <div
                  style={{
                    flex: 1,
                    width: "4.5rem",
                    display: "flex",
                    alignItems: "flex-end",
                    justifyContent: "center",
                    padding: "0.35rem 0",
                    boxSizing: "border-box",
                  }}
                >
                  <div
                    style={{
                      width: "2.25rem",
                      height: `${barHeight}%`,
                      borderRadius: "0.35rem 0.35rem 0.15rem 0.15rem",
                      background: "var(--qp-detail-row-active)",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
                <span
                  style={{
                    color: "var(--qp-text)",
                    fontSize: "0.88rem",
                    whiteSpace: "nowrap",
                  }}
                >
                  {record ? formatDate(record.play_date) : "--"}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </DetailRow>
  );
}
