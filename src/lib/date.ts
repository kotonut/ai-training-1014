// SPEC.md 8.5「日付」。日付はすべて日本時間で扱う。

const TIME_ZONE = "Asia/Tokyo";

const keyFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"] as const;

/** 日本時間の日付を「2026-11-02」の形で返す（その日のデータの箱の名前） */
export function toDateKey(date: Date): string {
  const parts = keyFormatter.formatToParts(date);
  const get = (type: Intl.DateTimeFormatPartTypes) => parts.find((p) => p.type === type)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}`;
}

/** 「2026-11-02」を画面に出す「11月2日（月）」の形にする */
export function formatDateLabel(dateKey: string): string {
  const [year, month, day] = dateKey.split("-").map(Number);
  const weekday = WEEKDAYS[new Date(Date.UTC(year, month - 1, day)).getUTCDay()];
  return `${month}月${day}日（${weekday}）`;
}

/** 画面を開いたまま日付が変わったか（日本時間で判断する） */
export function hasDateChanged(dateKey: string, now: Date): boolean {
  return toDateKey(now) !== dateKey;
}
