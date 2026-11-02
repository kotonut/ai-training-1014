// SPEC.md 6.2「入力のルール」

const segmenter = new Intl.Segmenter("ja", { granularity: "grapheme" });

/** 見た目の1文字を1文字として数える（絵文字の組み合わせも1文字） */
export function countCharacters(text: string): number {
  return splitCharacters(text).length;
}

/** 見た目の1文字ずつに分ける */
export function splitCharacters(text: string): string[] {
  return Array.from(segmenter.segment(text), (s) => s.segment);
}

/**
 * 前後の空白（半角・全角スペース、タブ、改行）を取り除き、途中の改行を空白1つにする。
 * 記号や HTML のような文字列は書き換えない（画面に出すときに React がエスケープする）。
 */
function normalize(text: string): string {
  return text.trim().replace(/\r\n|\r|\n/g, " ");
}

export type ValidationResult =
  | { ok: true; value: string }
  | { ok: false; reason: "empty" | "tooLong" };

export const NAME_MAX_LENGTH = 20;
export const MEMO_MAX_LENGTH = 40;

/** 名前は1〜20文字 */
export function validateName(input: string): ValidationResult {
  const value = normalize(input);
  if (value === "") return { ok: false, reason: "empty" };
  if (countCharacters(value) > NAME_MAX_LENGTH) return { ok: false, reason: "tooLong" };
  return { ok: true, value };
}

/** ひとことは0〜40文字 */
export function validateMemo(input: string): ValidationResult {
  const value = normalize(input);
  if (countCharacters(value) > MEMO_MAX_LENGTH) return { ok: false, reason: "tooLong" };
  return { ok: true, value };
}
