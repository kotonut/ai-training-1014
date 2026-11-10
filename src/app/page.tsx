import { AuthGate } from "@/app/_components/auth-gate";
import { LunchApp } from "@/app/_components/lunch-app";

// 今日のランチ（アプリのトップ）。SPEC.md 5.1
// 会社のアカウントでログインするまでは、ログインの画面を出す（SPEC.md 5.5）。
// 参加者のデータはログインした後に Firestore から読み込む。
export default function Home() {
  return (
    <AuthGate>
      <LunchApp />
    </AuthGate>
  );
}
