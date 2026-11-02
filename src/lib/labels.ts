// SPEC.md 5.1「テーブル」「今日のメンバー」「下のボタンの部分」

import { splitCharacters } from "@/lib/text-input";

const NAME_TAG_MAX = 4;

/**
 * おにぎりの下の名札。
 * 空白（半角・全角）があれば最初の空白の前（名字）を使い、4文字を超えたら先頭4文字＋「…」にする。
 */
export function nameTag(name: string): string {
  const head = name.split(/[ 　]/)[0];
  const chars = splitCharacters(head);
  if (chars.length <= NAME_TAG_MAX) return head;
  return `${chars.slice(0, NAME_TAG_MAX).join("")}…`;
}

/** 参加後の、ひとことのボタンの文言 */
export function memoButtonLabel(memo: string): string {
  return memo === "" ? "ひとことを書く" : "ひとことを変える";
}

/** 今日のメンバーの一覧に出す、ひとこと */
export function memoText(memo: string): string {
  return memo === "" ? "ひとことはまだありません" : memo;
}
