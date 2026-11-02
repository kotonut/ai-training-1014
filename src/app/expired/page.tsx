import type { Metadata } from "next";
import { LockedScreen } from "@/app/_components/locked-screen";

export const metadata: Metadata = {
  title: "QR コードが古くなっています | シャッフルランチ",
};

// 古い合言葉の URL で開いたとき（SPEC.md 5.5）
export default function Expired() {
  return (
    <LockedScreen
      title={"この QR コードは\n使えなくなりました"}
      message="QR コードを新しくしました。オフィスに置いてある新しい QR コードを読み取ってください。"
    />
  );
}
