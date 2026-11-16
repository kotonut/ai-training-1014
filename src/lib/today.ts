// SPEC.md 5.1「今日の一言」・6.4。参加者の「ひとこと」とは別物で、data/today.json に置く。

// MCP サーバー（mcp/server.ts）からも読み込まれ、どこから起動しても動くように、エイリアス（@/）ではなく相対パスで書く
import today from "../data/today.json";
import { countCharacters, normalize, splitCharacters, type ValidationResult } from "./text-input";

// このファイルは画面からも読み込まれるので、ファイルを扱うコード（node:fs など）は置かない。
// data/today.json に書くのは lib/today-file.ts。

export const TODAY_MESSAGE_MAX_LENGTH = 40;

/**
 * 保存する一言を確かめる（SPEC.md 6.4）。読むときと違い、長すぎても勝手に切らない。
 * 前後の空白を取り、途中の改行を空白1つにしてから数える。空なら empty、41文字以上なら tooLong。
 */
export function validateTodayMessage(input: string): ValidationResult {
  const value = normalize(input);
  if (value === "") return { ok: false, reason: "empty" };
  if (countCharacters(value) > TODAY_MESSAGE_MAX_LENGTH) return { ok: false, reason: "tooLong" };
  return { ok: true, value };
}

/** 保存できなかった理由の文 */
export function todayMessageErrorText(reason: "empty" | "tooLong"): string {
  return reason === "empty"
    ? "一言が空です。1〜40文字で書いてください"
    : `一言は${TODAY_MESSAGE_MAX_LENGTH}文字までにしてください`;
}

/**
 * 今日の一言を取り出す。出すものがないときは null（吹き出しを出さない）。
 * - `text` がない・文字列でない・空白だけ → null
 * - 前後の空白を取り、途中の改行を空白1つにする（ひとことと同じ決まり）
 * - 40文字を超えたら、先頭の40文字に「…」を付ける（文字数は見た目の1文字を1文字と数える）
 * 記号や HTML のような文字列は書き換えない（画面に出すときに React がエスケープする）。
 * @param data data/today.json の中身。テストでは別の値を渡す
 */
export function getTodayMessage(data: unknown = today): string | null {
  if (typeof data !== "object" || data === null || !("text" in data)) return null;
  if (typeof data.text !== "string") return null;
  const value = normalize(data.text);
  if (value === "") return null;
  const characters = splitCharacters(value);
  if (characters.length <= TODAY_MESSAGE_MAX_LENGTH) return value;
  // 切った先が空白で終わるときは、空白を残さず「…」を付ける
  return `${characters.slice(0, TODAY_MESSAGE_MAX_LENGTH).join("").trimEnd()}…`;
}
