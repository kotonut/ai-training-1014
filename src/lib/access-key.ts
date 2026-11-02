// SPEC.md 6.1「合言葉と QR コード」

export type AccessInput = {
  /** URL に付いていた合言葉（なければ null） */
  fromUrl: string | null;
  /** ブラウザが覚えている合言葉（なければ null） */
  remembered: string | null;
  /** 今の合言葉 */
  currentKey: string;
  /** 古い合言葉の一覧 */
  oldKeys: readonly string[];
};

export type AccessResult =
  | { screen: "lunch"; remember: string }
  | { screen: "expired" }
  | { screen: "blocked" };

/**
 * 開いたときに出す画面を決める。
 * URL とブラウザの両方に合言葉があるときは URL を優先する。
 * URL の合言葉が空（`?key=` だけ）のときは、URL に合言葉がないものとして扱う。
 * でたらめな合言葉は、当たり外れのヒントを出さないよう「合言葉なし」と同じ扱いにする。
 */
export function judgeAccess({ fromUrl, remembered, currentKey, oldKeys }: AccessInput): AccessResult {
  const key = fromUrl === null || fromUrl === "" ? remembered : fromUrl;
  if (key === null) return { screen: "blocked" };
  if (key === currentKey) return { screen: "lunch", remember: currentKey };
  if (oldKeys.includes(key)) return { screen: "expired" };
  return { screen: "blocked" };
}
