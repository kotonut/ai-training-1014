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

/** 人のカード（5.4）に出す、ひとこと */
export function personMemoText(memo: string): string {
  return memo === "" ? "ひとことはありません" : memo;
}

/** おにぎりの下の札。自分は「あなた」、ほかの人は名札 */
export function seatLabel(name: string, isMe: boolean): string {
  return isMe ? "あなた" : nameTag(name);
}

/** おにぎりの読み上げ（8章：読み上げ） */
export function seatAriaLabel(name: string, isMe: boolean): string {
  return isMe ? "あなた。タップしてひとことを書く" : `${name}さん。タップしてひとことを見る`;
}

/** 今日のメンバーの一覧に出す名前。自分は「（あなた）」を付ける */
export function memberListName(name: string, isMe: boolean): string {
  return isMe ? `${name}（あなた）` : name;
}
