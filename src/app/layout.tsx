import type { Metadata } from "next";
import { BIZ_UDPGothic, Yusei_Magic } from "next/font/google";
import "./globals.css";

// 見出し・数字・参加ボタンなど「画面の顔」に使う書体（油性マーカーの手書き。太さは 400 だけ）
const yuseiMagic = Yusei_Magic({
  variable: "--font-yusei-magic",
  weight: "400",
  preload: false,
});

// 名前・ひとこと・説明など、読みやすさを優先する書体（太さは 400 と 700 だけ）
const bizUdpGothic = BIZ_UDPGothic({
  variable: "--font-biz-udp-gothic",
  weight: ["400", "700"],
  preload: false,
});

export const metadata: Metadata = {
  title: "シャッフルランチ",
  description: "今日ランチに行きたい人が集まれる、社内向けのシャッフルランチ",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ja"
      className={`${yuseiMagic.variable} ${bizUdpGothic.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-ground font-sans text-ink">{children}</body>
    </html>
  );
}
