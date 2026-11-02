import { describe, expect, test } from "vitest";
import { judgeAccess } from "@/lib/access-key";

// SPEC.md 6.1「合言葉と QR コード」の判定表・8.6「部外者を防ぐこと」

const CURRENT = "k7Qm2xR9vT"; // 今の合言葉
const OLD = "a1B2c3D4e5"; // 古い合言葉
const OLDER = "z9Y8x7W6v5"; // さらに古い合言葉
const RANDOM = "xxxxxxxxxx"; // でたらめな合言葉

const keys = { currentKey: CURRENT, oldKeys: [OLD, OLDER] };

describe("judgeAccess：開いたときに、どの画面を出すか", () => {
  test("URL に今の合言葉がある → 今日のランチ。その合言葉をブラウザに覚えさせる", () => {
    expect(judgeAccess({ fromUrl: CURRENT, remembered: null, ...keys })).toEqual({
      screen: "lunch",
      remember: CURRENT,
    });
  });

  test("URL にはないが、ブラウザが今の合言葉を覚えている → 今日のランチ", () => {
    expect(judgeAccess({ fromUrl: null, remembered: CURRENT, ...keys })).toEqual({
      screen: "lunch",
      remember: CURRENT,
    });
  });

  test("URL とブラウザの両方に今の合言葉がある → 今日のランチ", () => {
    expect(judgeAccess({ fromUrl: CURRENT, remembered: CURRENT, ...keys })).toEqual({
      screen: "lunch",
      remember: CURRENT,
    });
  });

  test("合言葉がどこにもない → 社内の人専用です", () => {
    expect(judgeAccess({ fromUrl: null, remembered: null, ...keys })).toEqual({
      screen: "blocked",
    });
  });

  test("URL に古い合言葉がある → この QR コードは使えなくなりました", () => {
    expect(judgeAccess({ fromUrl: OLD, remembered: null, ...keys })).toEqual({
      screen: "expired",
    });
  });

  test("さらに古い合言葉でも → この QR コードは使えなくなりました", () => {
    expect(judgeAccess({ fromUrl: OLDER, remembered: null, ...keys })).toEqual({
      screen: "expired",
    });
  });

  test("URL にはなく、ブラウザが古い合言葉を覚えている → この QR コードは使えなくなりました", () => {
    expect(judgeAccess({ fromUrl: null, remembered: OLD, ...keys })).toEqual({
      screen: "expired",
    });
  });

  test("URL にでたらめな合言葉がある → 社内の人専用です（当たり外れのヒントを出さない）", () => {
    expect(judgeAccess({ fromUrl: RANDOM, remembered: null, ...keys })).toEqual({
      screen: "blocked",
    });
  });

  test("ブラウザがでたらめな合言葉を覚えている → 社内の人専用です", () => {
    expect(judgeAccess({ fromUrl: null, remembered: RANDOM, ...keys })).toEqual({
      screen: "blocked",
    });
  });

  describe("URL とブラウザの両方に合言葉があるときは、URL を優先する", () => {
    test("URL が今の合言葉、ブラウザが古い合言葉 → 今日のランチ。覚える合言葉を今のものに更新する", () => {
      expect(judgeAccess({ fromUrl: CURRENT, remembered: OLD, ...keys })).toEqual({
        screen: "lunch",
        remember: CURRENT,
      });
    });

    test("URL が古い合言葉、ブラウザが今の合言葉 → この QR コードは使えなくなりました", () => {
      expect(judgeAccess({ fromUrl: OLD, remembered: CURRENT, ...keys })).toEqual({
        screen: "expired",
      });
    });

    test("URL がでたらめ、ブラウザが今の合言葉 → 社内の人専用です", () => {
      expect(judgeAccess({ fromUrl: RANDOM, remembered: CURRENT, ...keys })).toEqual({
        screen: "blocked",
      });
    });
  });

  test("合言葉は大文字と小文字を区別する", () => {
    expect(judgeAccess({ fromUrl: CURRENT.toLowerCase(), remembered: null, ...keys })).toEqual({
      screen: "blocked",
    });
  });
});
