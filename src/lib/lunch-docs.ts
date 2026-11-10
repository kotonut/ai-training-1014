// Firestore から読んだ参加者のデータを、画面で使う形にする（SPEC.md 7章「データ」）
// Firebase には触らない。読み書きは lib/lunch-store.ts で行う。

import { SEAT_COUNT, TOPPINGS, type LunchMember, type StoredTopping } from "@/lib/members";

/** 参加者と、参加した時刻（ミリ秒）。一覧を参加した順に並べるのに使う */
export type MemberRecord = LunchMember & { joinedAt: number };

function isSeat(value: unknown): value is number | null {
  return value === null || (Number.isInteger(value) && (value as number) >= 0 && (value as number) < SEAT_COUNT);
}

function isTopping(value: unknown): value is StoredTopping {
  return typeof value === "string" && (TOPPINGS as readonly string[]).includes(value);
}

/**
 * `lunches/{日付}/members/{アカウントID}` の文書を、画面で使う形にする。
 * 形がおかしい文書（項目が足りない・型が違う）は null にして、画面に出さない。
 * joinedAt は、保存がまだサーバーに届いていないときの見込みの時刻でもよい。
 */
export function parseMemberDoc(id: string, data: unknown, joinedAt: number): MemberRecord | null {
  if (typeof data !== "object" || data === null) return null;
  const { name, memo, seat, topping } = data as Record<string, unknown>;
  if (typeof name !== "string" || typeof memo !== "string") return null;
  if (!isSeat(seat) || !isTopping(topping)) return null;
  return { id, name, memo, seat, topping, joinedAt };
}

/** 参加した順に並べる（同じ時刻なら id の順）。もとの配列は書き換えない */
export function sortByJoinedAt<M extends Pick<MemberRecord, "id" | "joinedAt">>(
  members: readonly M[],
): M[] {
  return [...members].sort((a, b) => a.joinedAt - b.joinedAt || a.id.localeCompare(b.id));
}

/** `users/{アカウントID}` の文書から、保存した名前を取り出す。なければ null */
export function parseSavedName(data: unknown): string | null {
  if (typeof data !== "object" || data === null) return null;
  const { name } = data as Record<string, unknown>;
  return typeof name === "string" && name !== "" ? name : null;
}
