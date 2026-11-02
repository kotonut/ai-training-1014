// SPEC.md 5.1「見出し」。数字だけ大きく出すので、前・数字・後の3つに分けて返す。

export type Headline = {
  before: string;
  number: string;
  after: string;
};

/**
 * 人数と状況に合わせた見出しの一文を作る。
 * @param count 席なしの人も含めた全体の人数（参加後は自分を含む）
 * @param joined 自分が参加しているか
 */
export function buildHeadline({ count, joined }: { count: number; joined: boolean }): Headline {
  if (count === 0) return { before: "", number: "", after: "一番乗りしませんか？" };
  if (joined && count === 1) return { before: "", number: "", after: "一番乗り！ だれか来るかな？" };
  return {
    before: "今日は",
    number: `${count}人`,
    after: joined ? "でランチ！" : "がランチに行きたい！",
  };
}
