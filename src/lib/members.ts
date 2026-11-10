// SPEC.md 6.3「席の決め方」

export const SEAT_COUNT = 8;

/** 保存するおにぎりの具（梅・鮭・卵）。色そのものは illustrations.tsx の COLORS で決める */
export const TOPPINGS = ["ume", "sake", "tamago"] as const;
export type StoredTopping = (typeof TOPPINGS)[number];

/** 画面に出す具。自分は落ち着いた緑の "mine" で出す（SPEC.md 5.6） */
export type Topping = StoredTopping | "mine";

/**
 * その人の具を決める。アカウント ID から決めるので、同じ人は毎日同じ具になる。
 * （SPEC.md 9章「おにぎりの具の色の決め方」の仮の考え：自動で割り振る）
 */
export function pickTopping(userId: string): StoredTopping {
  let sum = 0;
  for (const ch of userId) sum = (sum + ch.charCodeAt(0)) % TOPPINGS.length;
  return TOPPINGS[sum];
}

/** 画面に出す具。自分は "mine" */
export function displayTopping(member: Pick<LunchMember, "topping">, isMe: boolean): Topping {
  return isMe ? "mine" : member.topping;
}

/** 参加者のデータ。席なし（9人目から）は seat が null */
export type LunchMember = {
  id: string;
  name: string;
  memo: string;
  /** おにぎりの具 */
  topping: StoredTopping;
  /** テーブルの席の番号（0〜7）。席なしは null */
  seat: number | null;
};

/**
 * 参加する人の席を決める。空いている席のうち番号のいちばん小さい席。
 * 8席すべて埋まっていたら null（席なし）。すでに参加していれば "alreadyJoined"。
 */
export function assignSeat(
  members: readonly Pick<LunchMember, "id" | "seat">[],
  userId: string,
): number | null | "alreadyJoined" {
  if (members.some((m) => m.id === userId)) return "alreadyJoined";
  const taken = new Set(members.map((m) => m.seat));
  for (let seat = 0; seat < SEAT_COUNT; seat++) {
    if (!taken.has(seat)) return seat;
  }
  return null;
}

/** 参加する。すでに参加していればメンバーは変えない。もとの配列は書き換えない */
export function joinLunch<M extends LunchMember>(
  members: readonly M[],
  me: Omit<M, "seat">,
): M[] {
  const seat = assignSeat(members, me.id);
  if (seat === "alreadyJoined") return [...members];
  return [...members, { ...me, seat } as M];
}

/** 参加をやめる。もとの配列は書き換えない */
export function leaveLunch<M extends LunchMember>(members: readonly M[], userId: string): M[] {
  return members.filter((m) => m.id !== userId);
}

/** 全体の人数・席にいる人数・席なし（「ほかに◯人」）の人数 */
export function summarizeTable(members: readonly Pick<LunchMember, "seat">[]): {
  total: number;
  seated: number;
  others: number;
} {
  const seated = members.filter((m) => m.seat !== null).length;
  return { total: members.length, seated, others: members.length - seated };
}

/** id で参加者を探す。いなければ undefined */
export function findMember<M extends Pick<LunchMember, "id">>(
  members: readonly M[],
  id: string,
): M | undefined {
  return members.find((m) => m.id === id);
}

/** 参加者に「自分かどうか」の印を付ける。もとの配列は書き換えない */
export function markMe<M extends Pick<LunchMember, "id">>(
  members: readonly M[],
  userId: string,
): (M & { isMe: boolean })[] {
  return members.map((m) => ({ ...m, isMe: m.id === userId }));
}

/** テーブルの8席に人を並べる。席番号の順で、空いている席は member が null */
export function arrangeSeats<M extends Pick<LunchMember, "seat">>(
  members: readonly M[],
): { seat: number; member: M | null }[] {
  return Array.from({ length: SEAT_COUNT }, (_, seat) => ({
    seat,
    member: members.find((m) => m.seat === seat) ?? null,
  }));
}

/** 画面に出す参加者（自分かどうかの印つき）。markMe の結果 */
export type ViewMember = LunchMember & { isMe: boolean };
