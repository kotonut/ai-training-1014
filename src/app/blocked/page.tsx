import type { Metadata } from "next";
import { LockedScreen } from "@/app/_components/locked-screen";

export const metadata: Metadata = {
  title: "社内の人専用です | シャッフルランチ",
};

// 合言葉なしの URL で開いたとき（SPEC.md 5.5）
export default function Blocked() {
  return (
    <LockedScreen
      title={"このページは\n社内の人専用です"}
      message="オフィスに置いてある QR コードを読み取って開いてください。"
    />
  );
}
