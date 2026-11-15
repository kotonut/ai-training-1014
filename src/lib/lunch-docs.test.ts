import { describe, expect, it } from "vitest";
import { parseMemberDoc, parseSavedName, sortByJoinedAt } from "@/lib/lunch-docs";

const valid = { name: "田中 さくら", memo: "そばの気分", seat: 3, topping: "ume" };

describe("parseMemberDoc", () => {
  it("正しい文書は、id と参加した時刻を付けて返す", () => {
    expect(parseMemberDoc("uid1", valid, 1000)).toEqual({ id: "uid1", ...valid, joinedAt: 1000 });
  });

  it("席なし（null）も受け付ける", () => {
    expect(parseMemberDoc("uid1", { ...valid, seat: null }, 0)?.seat).toBeNull();
  });

  it("席の番号が 0〜7 の整数でなければ null", () => {
    for (const seat of [-1, 8, 1.5, "3", undefined]) {
      expect(parseMemberDoc("uid1", { ...valid, seat }, 0)).toBeNull();
    }
  });

  it("知らない具なら null", () => {
    expect(parseMemberDoc("uid1", { ...valid, topping: "#e27d7a" }, 0)).toBeNull();
  });

  it("名前やひとことが文字列でなければ null", () => {
    expect(parseMemberDoc("uid1", { ...valid, name: 1 }, 0)).toBeNull();
    expect(parseMemberDoc("uid1", { ...valid, memo: undefined }, 0)).toBeNull();
  });

  it("文書がオブジェクトでなければ null", () => {
    expect(parseMemberDoc("uid1", null, 0)).toBeNull();
    expect(parseMemberDoc("uid1", "x", 0)).toBeNull();
  });
});

describe("sortByJoinedAt", () => {
  it("参加した順に並べる。同じ時刻なら id の順", () => {
    const members = [
      { id: "c", joinedAt: 30 },
      { id: "b", joinedAt: 10 },
      { id: "a", joinedAt: 10 },
    ];
    expect(sortByJoinedAt(members).map((m) => m.id)).toEqual(["a", "b", "c"]);
  });

  it("もとの配列は書き換えない", () => {
    const members = [
      { id: "b", joinedAt: 2 },
      { id: "a", joinedAt: 1 },
    ];
    sortByJoinedAt(members);
    expect(members[0].id).toBe("b");
  });
});

describe("parseSavedName", () => {
  it("保存した名前を返す", () => {
    expect(parseSavedName({ name: "田中 さくら" })).toBe("田中 さくら");
  });

  it("文書がない・名前が空・文字列でなければ null", () => {
    expect(parseSavedName(undefined)).toBeNull();
    expect(parseSavedName({ name: "" })).toBeNull();
    expect(parseSavedName({ name: 1 })).toBeNull();
  });
});
