import type { DailyPlayTime } from "../api/detailgame";

export function getPlayTimeSlots(
  records: readonly DailyPlayTime[],
): (DailyPlayTime | null)[] {
  // Storage slots can wrap or be filled out of order as sessions finish.
  const visibleRecords = records
    .filter(
      (record) =>
        Number.isFinite(record.play_date) &&
        record.play_date > 0 &&
        Number.isFinite(record.play_time) &&
        record.play_time >= 0,
    )
    .sort((first, second) => first.play_date - second.play_date)
    .slice(-7);

  return [
    ...visibleRecords,
    ...Array<null>(7 - visibleRecords.length).fill(null),
  ];
}
