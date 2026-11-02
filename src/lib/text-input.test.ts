import { describe, expect, test } from "vitest";
import { countCharacters, validateMemo, validateName } from "@/lib/text-input";

// SPEC.md 6.2「入力のルール」・8.4「入力のルール」

describe("countCharacters：文字数は見た目の1文字を1文字として数える", () => {
  test("ひらがな・漢字・英字は1文字ずつ", () => {
    expect(countCharacters("吉田 琴乃")).toBe(5);
    expect(countCharacters("Sakura")).toBe(6);
  });

  test("肌の色付きの絵文字「👋🏽」は1文字", () => {
    expect(countCharacters("👋🏽")).toBe(1);
  });

  test("家族の絵文字のように、いくつもの文字を組み合わせた絵文字も1文字", () => {
    expect(countCharacters("家族👨‍👩‍👧")).toBe(3);
  });

  test("空の文字列は0文字", () => {
    expect(countCharacters("")).toBe(0);
  });
});

describe("validateName：名前は1〜20文字", () => {
  test("ふつうの名前はそのまま通る", () => {
    expect(validateName("吉田 琴乃")).toEqual({ ok: true, value: "吉田 琴乃" });
  });

  test("前後の半角スペースを取り除く", () => {
    expect(validateName("  吉田 琴乃  ")).toEqual({ ok: true, value: "吉田 琴乃" });
  });

  test("前後の全角スペースを取り除く", () => {
    expect(validateName("　吉田 琴乃　")).toEqual({ ok: true, value: "吉田 琴乃" });
  });

  test("前後のタブと改行を取り除く", () => {
    expect(validateName("\t吉田 琴乃\n")).toEqual({ ok: true, value: "吉田 琴乃" });
  });

  test("途中の改行は空白1つに置き換える", () => {
    expect(validateName("吉田\n琴乃")).toEqual({ ok: true, value: "吉田 琴乃" });
    expect(validateName("吉田\r\n琴乃")).toEqual({ ok: true, value: "吉田 琴乃" });
  });

  test("空の名前は不可", () => {
    expect(validateName("")).toEqual({ ok: false, reason: "empty" });
  });

  test("半角スペースだけの名前は不可", () => {
    expect(validateName("   ")).toEqual({ ok: false, reason: "empty" });
  });

  test("全角スペースだけの名前は不可", () => {
    expect(validateName("　　")).toEqual({ ok: false, reason: "empty" });
  });

  test("改行やタブだけの名前は不可", () => {
    expect(validateName("\n\t")).toEqual({ ok: false, reason: "empty" });
  });

  test("20文字までは通る", () => {
    const name = "あ".repeat(20);
    expect(validateName(name)).toEqual({ ok: true, value: name });
  });

  test("21文字は長すぎて不可", () => {
    expect(validateName("あ".repeat(21))).toEqual({ ok: false, reason: "tooLong" });
  });

  test("文字数は前後の空白を取り除いた後で数える", () => {
    const name = "あ".repeat(20);
    expect(validateName(`  ${name}  `)).toEqual({ ok: true, value: name });
  });

  test("絵文字も1文字として数える（20個は通り、21個は不可）", () => {
    expect(validateName("👋🏽".repeat(20))).toEqual({ ok: true, value: "👋🏽".repeat(20) });
    expect(validateName("👋🏽".repeat(21))).toEqual({ ok: false, reason: "tooLong" });
  });

  test("記号や HTML のような文字列も、取り除いたり書き換えたりせずに通す", () => {
    expect(validateName("<b>吉田</b>")).toEqual({ ok: true, value: "<b>吉田</b>" });
    expect(validateName("吉田 & 琴乃")).toEqual({ ok: true, value: "吉田 & 琴乃" });
  });
});

describe("validateMemo：ひとことは0〜40文字", () => {
  test("ふつうのひとことはそのまま通る", () => {
    expect(validateMemo("そばの気分")).toEqual({ ok: true, value: "そばの気分" });
  });

  test("空のひとことも通る", () => {
    expect(validateMemo("")).toEqual({ ok: true, value: "" });
  });

  test("空白だけのひとことは、空として通る", () => {
    expect(validateMemo("   ")).toEqual({ ok: true, value: "" });
    expect(validateMemo("　\n")).toEqual({ ok: true, value: "" });
  });

  test("前後の空白（半角・全角・改行）を取り除く", () => {
    expect(validateMemo("  そばの気分　\n")).toEqual({ ok: true, value: "そばの気分" });
  });

  test("途中の改行は空白1つに置き換える", () => {
    expect(validateMemo("そばの気分\nうどんも可")).toEqual({
      ok: true,
      value: "そばの気分 うどんも可",
    });
    expect(validateMemo("そばの気分\r\nうどんも可")).toEqual({
      ok: true,
      value: "そばの気分 うどんも可",
    });
  });

  test("40文字までは通る", () => {
    const memo = "あ".repeat(40);
    expect(validateMemo(memo)).toEqual({ ok: true, value: memo });
  });

  test("41文字は長すぎて不可", () => {
    expect(validateMemo("あ".repeat(41))).toEqual({ ok: false, reason: "tooLong" });
  });

  test("絵文字も1文字として数える（40個は通り、41個は不可）", () => {
    expect(validateMemo("👋🏽".repeat(40))).toEqual({ ok: true, value: "👋🏽".repeat(40) });
    expect(validateMemo("👋🏽".repeat(41))).toEqual({ ok: false, reason: "tooLong" });
  });

  test("記号や HTML のような文字列も、そのまま通す", () => {
    expect(validateMemo("<script>alert(1)</script>")).toEqual({
      ok: true,
      value: "<script>alert(1)</script>",
    });
  });
});
