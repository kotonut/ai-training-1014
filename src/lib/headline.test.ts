import { describe, expect, test } from "vitest";
import { buildHeadline } from "@/lib/headline";

// SPEC.md 5.1「見出し」の表。数字だけ大きく出すので、前・数字・後の3つに分けて返す。

describe("buildHeadline：人数と状況に合わせた見出しの一文", () => {
  test("まだ誰もいない →「一番乗りしませんか？」", () => {
    expect(buildHeadline({ count: 0, joined: false })).toEqual({
      before: "",
      number: "",
      after: "一番乗りしませんか？",
    });
  });

  test("参加する前で、3人いる →「今日は 3人 がランチに行きたい！」", () => {
    expect(buildHeadline({ count: 3, joined: false })).toEqual({
      before: "今日は",
      number: "3人",
      after: "がランチに行きたい！",
    });
  });

  test("参加する前で、1人いる →「今日は 1人 がランチに行きたい！」", () => {
    expect(buildHeadline({ count: 1, joined: false })).toEqual({
      before: "今日は",
      number: "1人",
      after: "がランチに行きたい！",
    });
  });

  test("参加した後で、自分を含めて4人 →「今日は 4人 でランチ！」", () => {
    expect(buildHeadline({ count: 4, joined: true })).toEqual({
      before: "今日は",
      number: "4人",
      after: "でランチ！",
    });
  });

  test("参加した後で、自分を含めて2人 →「今日は 2人 でランチ！」", () => {
    expect(buildHeadline({ count: 2, joined: true })).toEqual({
      before: "今日は",
      number: "2人",
      after: "でランチ！",
    });
  });

  test("参加した後で、自分だけ →「一番乗り！ だれか来るかな？」", () => {
    expect(buildHeadline({ count: 1, joined: true })).toEqual({
      before: "",
      number: "",
      after: "一番乗り！ だれか来るかな？",
    });
  });

  test("9人以上でも、席なしの人を含めた全体の人数を出す", () => {
    expect(buildHeadline({ count: 11, joined: false })).toEqual({
      before: "今日は",
      number: "11人",
      after: "がランチに行きたい！",
    });
  });
});
