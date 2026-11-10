// 今日のランチのデータの読み書き（SPEC.md 6.2・6.3・7章）。Firestore を使うコードはここにまとめる。
// ブラウザでだけ呼ぶ（Client Component の useEffect やボタンの onClick から）。
//
// データの置き場所（守りは firestore.rules）
//   users/{アカウントID}                    名前（次の参加から使う）
//   lunches/{日付}/members/{アカウントID}   名前・ひとこと・席の番号・具・参加した時刻
//   lunches/{日付}/seats/{0〜7}             その席にいる人のアカウントID（席が重ならないようにするため）
// メールアドレスは保存しない。

import { FirebaseError } from "firebase/app";
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  runTransaction,
  serverTimestamp,
  updateDoc,
  type Unsubscribe,
} from "firebase/firestore";
import { getDb } from "@/lib/firebase";
import { parseMemberDoc, parseSavedName, sortByJoinedAt, type MemberRecord } from "@/lib/lunch-docs";
import { SEAT_COUNT, assignSeat, pickTopping } from "@/lib/members";

const memberRef = (dateKey: string, userId: string) =>
  doc(getDb(), "lunches", dateKey, "members", userId);
const seatRef = (dateKey: string, seat: number) =>
  doc(getDb(), "lunches", dateKey, "seats", String(seat));
const userRef = (userId: string) => doc(getDb(), "users", userId);

/**
 * その日の参加者を待ち受ける。変わるたびに、参加した順に並べて onChange を呼ぶ。
 * 読めなかったとき（通信・権限）は onError を呼ぶ。戻り値を呼ぶと待ち受けをやめる。
 */
export function watchMembers(
  dateKey: string,
  onChange: (members: MemberRecord[]) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  return onSnapshot(
    collection(getDb(), "lunches", dateKey, "members"),
    (snapshot) => {
      const members = snapshot.docs.flatMap((d) => {
        // 自分の参加がまだサーバーに届いていないときは、見込みの時刻で並べる
        const data = d.data({ serverTimestamps: "estimate" });
        const joinedAt = data.joinedAt?.toMillis?.() ?? Date.now();
        return parseMemberDoc(d.id, data, joinedAt) ?? [];
      });
      onChange(sortByJoinedAt(members));
    },
    onError,
  );
}

/** 前に参加したときの名前。まだ一度も参加していなければ null */
export async function loadSavedName(userId: string): Promise<string | null> {
  const snapshot = await getDoc(userRef(userId));
  return parseSavedName(snapshot.data());
}

/**
 * 参加する。空いている席のうち番号のいちばん小さい席に入る（8席埋まっていたら席なし）。
 * 2人がほぼ同時に参加しても同じ席にならないよう、トランザクションで席を取る。
 * 取ろうとした席を先に取られたら、Firestore が自動でやり直す。
 * すでに参加していれば何もしない。名前は次の参加のために users にも保存する。
 */
export async function joinToday(params: {
  dateKey: string;
  userId: string;
  name: string;
  memo: string;
}): Promise<void> {
  const { dateKey, userId, name, memo } = params;
  await runTransaction(getDb(), async (tx) => {
    const mine = await tx.get(memberRef(dateKey, userId));
    if (mine.exists()) return;

    const seatDocs = await Promise.all(
      Array.from({ length: SEAT_COUNT }, (_, seat) => tx.get(seatRef(dateKey, seat))),
    );
    const taken = seatDocs.flatMap((s, seat) =>
      s.exists() ? [{ id: String(s.data().uid), seat }] : [],
    );
    const result = assignSeat(taken, userId);
    // 席の文書だけ残っているとき（ふつうは起きない）は、その席に戻る
    const seat = result === "alreadyJoined" ? taken.find((t) => t.id === userId)!.seat : result;

    if (seat !== null && result !== "alreadyJoined") {
      tx.set(seatRef(dateKey, seat), { uid: userId });
    }
    tx.set(memberRef(dateKey, userId), {
      name,
      memo,
      seat,
      topping: pickTopping(userId),
      joinedAt: serverTimestamp(),
    });
    tx.set(userRef(userId), { name });
  });
}

/** 参加をやめる。席も空ける。参加していなければ何もしない */
export async function leaveToday(dateKey: string, userId: string): Promise<void> {
  await runTransaction(getDb(), async (tx) => {
    const mine = await tx.get(memberRef(dateKey, userId));
    if (!mine.exists()) return;
    const seat = mine.data().seat;
    if (typeof seat === "number") tx.delete(seatRef(dateKey, seat));
    tx.delete(memberRef(dateKey, userId));
  });
}

/** ひとことを保存する */
export async function saveMemo(dateKey: string, userId: string, memo: string): Promise<void> {
  await updateDoc(memberRef(dateKey, userId), { memo });
}

/** Firebase のエラーコード（"unavailable" など）。Firebase のエラーでなければ undefined */
export function errorCode(error: unknown): string | undefined {
  return error instanceof FirebaseError ? error.code : undefined;
}
