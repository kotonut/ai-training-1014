import { LunchApp } from "@/app/_components/lunch-app";
import { DUMMY_MEMBERS } from "@/app/_lib/dummy-data";

// 今日のランチ（アプリのトップ）。SPEC.md 5.1
export default function Home() {
  return <LunchApp initialMembers={DUMMY_MEMBERS} />;
}
