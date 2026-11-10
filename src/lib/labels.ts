// SPEC.md 5.1「テーブル」「今日のメンバー」「下のボタンの部分」

import {
  MEMO_MAX_LENGTH,
  NAME_MAX_LENGTH,
  splitCharacters,
  type ValidationResult,
} from "@/lib/text-input";

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

/** 失敗した操作（SPEC.md 8.7） */
export type LunchAction = "load" | "join" | "leave" | "memo";

const ACTION_FAILED: Record<LunchAction, string> = {
  load: "今日のメンバーを読み込めませんでした。再読み込みしてください",
  join: "参加できませんでした。もう一度お試しください",
  leave: "参加をやめられませんでした。もう一度お試しください",
  memo: "ひとことを保存できませんでした。もう一度お試しください",
};

/**
 * 読み書きに失敗したときに出す文。code は Firebase のエラーコード（わからなければ undefined）。
 * 通信が切れているとき（unavailable）は、操作にかかわらず接続できないことを伝える。
 */
export function lunchErrorMessage(action: LunchAction, code?: string): string {
  if (code === "unavailable") return "接続できません。電波のよい場所でもう一度お試しください";
  return ACTION_FAILED[action];
}

/**
 * 入力欄の下に出す、押せない理由（SPEC.md 8.4）。問題がなければ null。
 * 名前が空のときも出す（Google アカウントに名前がないと、空のまま入力画面が出るため）。
 */
export function inputErrorMessage(field: "name" | "memo", result: ValidationResult): string | null {
  if (result.ok) return null;
  if (field === "name") {
    return result.reason === "empty"
      ? "名前を入れてください"
      : `名前は${NAME_MAX_LENGTH}文字までにしてください`;
  }
  return `ひとことは${MEMO_MAX_LENGTH}文字までにしてください`;
}
