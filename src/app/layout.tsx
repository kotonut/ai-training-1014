import type { Metadata } from "next";
import { Kiwi_Maru, Zen_Kaku_Gothic_New } from "next/font/google";
import "./globals.css";

// 見出し・数字・参加ボタンなど「画面の顔」に使う書体
const kiwiMaru = Kiwi_Maru({
  variable: "--font-kiwi-maru",
  weight: ["400", "500"],
  preload: false,
});

// 名前・ひとこと・説明など、読みやすさを優先する書体
const zenKaku = Zen_Kaku_Gothic_New({
  variable: "--font-zen-kaku",
  weight: ["400", "500", "700"],
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
      className={`${kiwiMaru.variable} ${zenKaku.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-ground font-sans text-ink">{children}</body>
    </html>
  );
}
