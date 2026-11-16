// SPEC.md 5.1「今日の一言」・6.4。参加者の「ひとこと」とは別物で、data/today.json に置く。

import today from "@/data/today.json";
import { normalize, splitCharacters } from "./text-input";

export const TODAY_MESSAGE_MAX_LENGTH = 40;

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
