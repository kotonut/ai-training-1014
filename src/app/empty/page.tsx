import type { Metadata } from "next";
import { LunchApp } from "@/app/_components/lunch-app";

export const metadata: Metadata = {
  title: "まだ誰もいない日 | シャッフルランチ",
};

// 確認用：まだ誰も参加していない日の見た目（見出しが「一番乗りしませんか？」になる）
export default function EmptyDay() {
  return <LunchApp initialMembers={[]} />;
}
