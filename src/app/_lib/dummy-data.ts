// 画面のたたき台用のダミーデータ。本番では Firestore から読み込む。

import type { LunchMember } from "@/lib/members";

/** 今日の日付（日本時間、「2026-11-02」の形）。本番では lib/date.ts の toDateKey で今の時刻から作る */
export const TODAY_KEY = "2026-11-02";

export const MEETING = {
  time: "12:00",
  place: "1階エントランス",
};

/** 自分の id。本番では匿名認証の id を使う */
export const MY_ID = "me";

/** 自分のおにぎりの具の色 */
export const MY_TOPPING = "#6fae92";

export const DUMMY_MEMBERS: LunchMember[] = [
  {
    id: "tanaka",
    name: "田中 さくら",
    memo: "10月に中途で入社しました！社内のこと、いろいろ教えてください",
    topping: "#e27d7a",
    seat: 0,
  },
  {
    id: "sato",
    name: "佐藤 健",
    memo: "そばの気分。営業部です",
    topping: "#ef9f6e",
    seat: 3,
  },
  {
    id: "suzuki",
    name: "鈴木 美咲",
    memo: "",
    topping: "#e9b949",
    seat: 5,
  },
];
