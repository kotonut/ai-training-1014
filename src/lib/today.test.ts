import { describe, expect, test } from "vitest";
import today from "@/data/today.json";
import {
  getTodayMessage,
  TODAY_MESSAGE_MAX_LENGTH,
  todayMessageErrorText,
  validateTodayMessage,
} from "@/lib/today";

// SPEC.md 5.1「今日の一言」・6.4・8.12

describe("getTodayMessage：今日の一言を取り出す", () => {
  // 一言は MCP の道具（set_today_message）でいつでも変わるので、中身の文字列には頼らない
  test("引数がなければ data/today.json の一言を返す", () => {
    expect(getTodayMessage()).toBe(getTodayMessage(today));
    expect(getTodayMessage()).not.toBeNull();
  });

  test("ふつうの一言はそのまま返す", () => {
    expect(getTodayMessage({ text: "寒いので温かいものを" })).toBe("寒いので温かいものを");
  });

  test("記号や HTML のような文字列も書き換えない", () => {
    expect(getTodayMessage({ text: "<b>カレー</b> & ラーメン" })).toBe("<b>カレー</b> & ラーメン");
  });
});

describe("getTodayMessage：出すものがないときは null", () => {
  test("text が空のとき", () => {
    expect(getTodayMessage({ text: "" })).toBeNull();
  });

  test("text が空白（半角・全角スペース、改行、タブ）だけのとき", () => {
    expect(getTodayMessage({ text: " 　\n\t" })).toBeNull();
  });

  test("text がないとき", () => {
    expect(getTodayMessage({})).toBeNull();
  });

  test("text が文字列でないとき", () => {
    expect(getTodayMessage({ text: 123 })).toBeNull();
    expect(getTodayMessage({ text: null })).toBeNull();
    expect(getTodayMessage({ text: ["今日も"] })).toBeNull();
  });

  test("中身がオブジェクトでないとき", () => {
    expect(getTodayMessage(null)).toBeNull();
    expect(getTodayMessage("今日もいい一日を！")).toBeNull();
    expect(getTodayMessage(undefined)).toBe(getTodayMessage()); // 省略と同じ
  });
});

describe("getTodayMessage：空白と改行", () => {
  test("前後の空白を取り除く", () => {
    expect(getTodayMessage({ text: "　 今日も \n" })).toBe("今日も");
  });

  test("途中の改行は空白1つにする。続いていても1つ", () => {
    expect(getTodayMessage({ text: "今日も\r\n\r\nいい一日を" })).toBe("今日も いい一日を");
  });
});

describe("getTodayMessage：40文字まで", () => {
  test("上限は40文字", () => {
    expect(TODAY_MESSAGE_MAX_LENGTH).toBe(40);
  });

  test("40文字ちょうどはそのまま", () => {
    const text = "あ".repeat(40);
    expect(getTodayMessage({ text })).toBe(text);
  });

  test("41文字のときは、先頭の40文字に「…」を付ける", () => {
    expect(getTodayMessage({ text: `${"あ".repeat(40)}い` })).toBe(`${"あ".repeat(40)}…`);
  });

  test("文字数は前後の空白を取り除いてから数える", () => {
    const text = "あ".repeat(40);
    expect(getTodayMessage({ text: `  ${text}  ` })).toBe(text);
  });

  test("絵文字は見た目の1文字を1文字と数え、途中で切らない", () => {
    const text = `${"あ".repeat(39)}👋🏽👨‍👩‍👧`;
    expect(getTodayMessage({ text })).toBe(`${"あ".repeat(39)}👋🏽…`);
  });

  test("切った先が空白で終わるときは、空白を残さない", () => {
    expect(getTodayMessage({ text: `${"あ".repeat(39)} いい一日を` })).toBe(`${"あ".repeat(39)}…`);
  });
});

describe("validateTodayMessage：保存する一言を確かめる", () => {
  test("ふつうの一言は通る", () => {
    expect(validateTodayMessage("寒いので鍋の気分")).toEqual({ ok: true, value: "寒いので鍋の気分" });
  });

  test("空や空白だけは empty", () => {
    expect(validateTodayMessage("")).toEqual({ ok: false, reason: "empty" });
    expect(validateTodayMessage(" 　\n\t")).toEqual({ ok: false, reason: "empty" });
  });

  test("40文字ちょうどは通る", () => {
    const text = "あ".repeat(40);
    expect(validateTodayMessage(text)).toEqual({ ok: true, value: text });
  });

  test("41文字は tooLong（勝手に切らない）", () => {
    expect(validateTodayMessage("あ".repeat(41))).toEqual({ ok: false, reason: "tooLong" });
  });

  test("前後の空白を取り、途中の改行を空白1つにしてから数える", () => {
    expect(validateTodayMessage(`  ${"あ".repeat(20)}\r\n\r\n${"い".repeat(19)}  `)).toEqual({
      ok: true,
      value: `${"あ".repeat(20)} ${"い".repeat(19)}`,
    });
  });

  test("絵文字は見た目の1文字を1文字と数える", () => {
    expect(validateTodayMessage(`${"あ".repeat(39)}👨‍👩‍👧`).ok).toBe(true);
  });
});

describe("todayMessageErrorText：保存できなかった理由の文", () => {
  test("空のとき", () => {
    expect(todayMessageErrorText("empty")).toBe("一言が空です。1〜40文字で書いてください");
  });

  test("長すぎるとき", () => {
    expect(todayMessageErrorText("tooLong")).toBe("一言は40文字までにしてください");
  });
});
