import { describe, expect, test } from "vitest";
import { formatDateLabel, hasDateChanged, toDateKey } from "@/lib/date";

// SPEC.md 8.5「日付」・8.2「画面を開いたまま日付が変わると…」
// 日付は日本時間で判断する。テストを動かすパソコンの時間帯に左右されないよう、
// 時刻は必ず時差付き（Z は世界標準時、+09:00 は日本時間）で書く。

describe("toDateKey：その日のデータの箱の名前（日本時間の日付）", () => {
  test("日本時間 11月2日 12:00 →「2026-11-02」", () => {
    expect(toDateKey(new Date("2026-11-02T12:00:00+09:00"))).toBe("2026-11-02");
  });

  test("日本時間 11月2日 0:00 ちょうど →「2026-11-02」", () => {
    expect(toDateKey(new Date("2026-11-02T00:00:00+09:00"))).toBe("2026-11-02");
  });

  test("日本時間 11月2日 23:59 →「2026-11-02」", () => {
    expect(toDateKey(new Date("2026-11-02T23:59:59+09:00"))).toBe("2026-11-02");
  });

  test("日本時間 11月3日 0:00 になると次の日 →「2026-11-03」", () => {
    expect(toDateKey(new Date("2026-11-03T00:00:00+09:00"))).toBe("2026-11-03");
  });

  test("世界標準時ではなく日本時間で判断する（世界標準時 11月2日 15:00 ＝ 日本時間 11月3日 0:00）", () => {
    expect(toDateKey(new Date("2026-11-02T15:00:00Z"))).toBe("2026-11-03");
  });

  test("世界標準時ではまだ前の日でも、日本時間で判断する（世界標準時 11月1日 23:00 ＝ 日本時間 11月2日 8:00）", () => {
    expect(toDateKey(new Date("2026-11-01T23:00:00Z"))).toBe("2026-11-02");
  });

  test("月や日が1桁でも、2桁で書く（日本時間 1月5日 →「2027-01-05」）", () => {
    expect(toDateKey(new Date("2027-01-05T09:00:00+09:00"))).toBe("2027-01-05");
  });

  test("年をまたぐ（日本時間 12月31日 23:59 と 1月1日 0:00）", () => {
    expect(toDateKey(new Date("2026-12-31T23:59:59+09:00"))).toBe("2026-12-31");
    expect(toDateKey(new Date("2027-01-01T00:00:00+09:00"))).toBe("2027-01-01");
  });
});

describe("formatDateLabel：画面に出す日付", () => {
  test("「2026-11-02」→「11月2日（月）」", () => {
    expect(formatDateLabel("2026-11-02")).toBe("11月2日（月）");
  });

  test("曜日が正しい（「2026-11-08」は日曜日）", () => {
    expect(formatDateLabel("2026-11-08")).toBe("11月8日（日）");
  });

  test("月や日の頭に 0 を付けない（「2027-01-01」→「1月1日（金）」）", () => {
    expect(formatDateLabel("2027-01-01")).toBe("1月1日（金）");
  });

  test("2桁の月と日（「2026-12-31」→「12月31日（木）」）", () => {
    expect(formatDateLabel("2026-12-31")).toBe("12月31日（木）");
  });
});

describe("hasDateChanged：画面を開いたまま日付が変わったか", () => {
  test("同じ日のうちは「変わっていない」", () => {
    expect(hasDateChanged("2026-11-02", new Date("2026-11-02T23:59:59+09:00"))).toBe(false);
  });

  test("日本時間の 0:00 を過ぎたら「変わった」", () => {
    expect(hasDateChanged("2026-11-02", new Date("2026-11-03T00:00:00+09:00"))).toBe(true);
  });

  test("世界標準時の 0:00（日本時間 9:00）では「変わっていない」", () => {
    expect(hasDateChanged("2026-11-02", new Date("2026-11-02T00:00:00Z"))).toBe(false);
  });
});
