import { describe, expect, test } from "vitest";
import {
  inputErrorMessage,
  lunchErrorMessage,
  memberListName,
  memoButtonLabel,
  memoText,
  nameTag,
  personMemoText,
  seatAriaLabel,
  seatLabel,
} from "@/lib/labels";

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

  test("名字がちょうど4文字なら、「…」を付けない", () => {
    expect(nameTag("佐々木健 太郎")).toBe("佐々木健");
  });

  test("名字がちょうど5文字なら、先頭4文字の後に「…」を付ける", () => {
    expect(nameTag("勅使河原三 太郎")).toBe("勅使河原…");
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

describe("personMemoText：人のカードに出す、ひとこと", () => {
  test("ひとことがない人 →「ひとことはありません」", () => {
    expect(personMemoText("")).toBe("ひとことはありません");
  });

  test("ひとことがある人 → そのまま出す", () => {
    expect(personMemoText("そばの気分")).toBe("そばの気分");
  });
});

describe("seatLabel：おにぎりの下の札", () => {
  test("自分 →「あなた」", () => {
    expect(seatLabel("吉田 琴乃", true)).toBe("あなた");
  });

  test("ほかの人 → 名札（名字、4文字まで）", () => {
    expect(seatLabel("田中 さくら", false)).toBe("田中");
    expect(seatLabel("田中さくら", false)).toBe("田中さく…");
  });
});

describe("seatAriaLabel：おにぎりの読み上げ", () => {
  test("自分 →「あなた。タップしてひとことを書く」", () => {
    expect(seatAriaLabel("吉田 琴乃", true)).toBe("あなた。タップしてひとことを書く");
  });

  test("ほかの人 →「◯◯さん。タップしてひとことを見る」（名前は省略しない）", () => {
    expect(seatAriaLabel("田中 さくら", false)).toBe("田中 さくらさん。タップしてひとことを見る");
  });
});

describe("memberListName：今日のメンバーの一覧に出す名前", () => {
  test("自分 → 名前に「（あなた）」を付ける", () => {
    expect(memberListName("吉田 琴乃", true)).toBe("吉田 琴乃（あなた）");
  });

  test("ほかの人 → 名前をそのまま出す", () => {
    expect(memberListName("田中 さくら", false)).toBe("田中 さくら");
  });
});

describe("lunchErrorMessage：読み書きに失敗したときの文", () => {
  test("操作ごとに、失敗したことを伝える", () => {
    expect(lunchErrorMessage("join")).toBe("参加できませんでした。もう一度お試しください");
    expect(lunchErrorMessage("leave")).toBe("参加をやめられませんでした。もう一度お試しください");
    expect(lunchErrorMessage("memo", "permission-denied")).toBe(
      "ひとことを保存できませんでした。もう一度お試しください",
    );
  });

  test("通信が切れているときは、接続できないと伝える", () => {
    expect(lunchErrorMessage("join", "unavailable")).toBe(
      "接続できません。電波のよい場所でもう一度お試しください",
    );
  });
});

describe("inputErrorMessage：入力欄の下に出す、押せない理由", () => {
  test("問題がなければ何も出さない", () => {
    expect(inputErrorMessage("name", { ok: true, value: "田中" })).toBeNull();
    expect(inputErrorMessage("memo", { ok: true, value: "" })).toBeNull();
  });

  test("名前が空なら、入れるよう伝える", () => {
    expect(inputErrorMessage("name", { ok: false, reason: "empty" })).toBe("名前を入れてください");
  });

  test("名前が長すぎたら、20文字までと伝える", () => {
    expect(inputErrorMessage("name", { ok: false, reason: "tooLong" })).toBe(
      "名前は20文字までにしてください",
    );
  });

  test("ひとことが長すぎたら、40文字までと伝える", () => {
    expect(inputErrorMessage("memo", { ok: false, reason: "tooLong" })).toBe(
      "ひとことは40文字までにしてください",
    );
  });
});
