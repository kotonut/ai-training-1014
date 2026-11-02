// 画面のたたき台用のダミーデータ。本番では Firestore から読み込む。

export type Member = {
  id: string;
  name: string;
  memo: string;
  /** おにぎりの具の色 */
  topping: string;
  /** テーブルの席の番号（0〜7） */
  seat: number;
};

export const TODAY_LABEL = "11月2日（月）";

export const MEETING = {
  time: "12:00",
  place: "1階エントランス",
};

export const SEAT_COUNT = 8;

/** 自分のおにぎりの具の色 */
export const MY_TOPPING = "#6fae92";

export const DUMMY_MEMBERS: Member[] = [
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
