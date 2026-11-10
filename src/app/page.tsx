import { AuthGate } from "@/app/_components/auth-gate";
import { LunchApp } from "@/app/_components/lunch-app";
import { DUMMY_MEMBERS } from "@/app/_lib/dummy-data";

// 今日のランチ（アプリのトップ）。SPEC.md 5.1
// 会社のアカウントでログインするまでは、ログインの画面を出す（SPEC.md 5.5）
export default function Home() {
  return (
    <AuthGate>
      <LunchApp initialMembers={DUMMY_MEMBERS} />
    </AuthGate>
  );
}
