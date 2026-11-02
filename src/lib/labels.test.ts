import { describe, expect, test } from "vitest";
import { memoButtonLabel, memoText, nameTag } from "@/lib/labels";

// SPEC.md 5.1「テーブル」「今日のメンバー」「下のボタンの部分」

describe("nameTag：おにぎりの下の名札", () => {
  test("半角の空白で区切った前の部分（名字）を出す", () => {
    expect(nameTag("田中 さくら")).toBe("田中");
  });

  test("全角の空白で区切っても、名字を出す", () => {
    expect(nameTag("田中　さくら")).toBe("田中");
  });

  test("空白が2つ以上あっても、最初の空白の前を出す", () => {
    expect(nameTag("Mary Jane Watson")).toBe("Mary");
  });

  test("空白がなく4文字以内なら、そのまま出す", () => {
    expect(nameTag("林")).toBe("林");
    expect(nameTag("さくら")).toBe("さくら");
    expect(nameTag("佐々木健")).toBe("佐々木健");
  });

  test("空白がなく4文字を超えたら、先頭4文字の後に「…」を付ける", () => {
    expect(nameTag("田中さくら")).toBe("田中さく…");
    expect(nameTag("Sakura")).toBe("Saku…");
  });

  test("名字が4文字を超えるときも、先頭4文字の後に「…」を付ける", () => {
    expect(nameTag("勅使河原三郎 太郎")).toBe("勅使河原…");
  });

  test("絵文字も1文字として数える", () => {
    expect(nameTag("👋🏽さくら")).toBe("👋🏽さくら");
    expect(nameTag("👋🏽👋🏽さくら")).toBe("👋🏽👋🏽さく…");
  });
});

describe("memoButtonLabel：参加後の、ひとことのボタンの文言", () => {
  test("ひとことがまだないとき →「ひとことを書く」", () => {
    expect(memoButtonLabel("")).toBe("ひとことを書く");
  });

  test("ひとことがあるとき →「ひとことを変える」", () => {
    expect(memoButtonLabel("そばの気分")).toBe("ひとことを変える");
  });
});

describe("memoText：今日のメンバーの一覧に出す、ひとこと", () => {
  test("ひとことがない人 →「ひとことはまだありません」", () => {
    expect(memoText("")).toBe("ひとことはまだありません");
  });

  test("ひとことがある人 → そのまま出す", () => {
    expect(memoText("そばの気分。営業部です")).toBe("そばの気分。営業部です");
  });
});
