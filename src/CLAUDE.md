# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## 概要

社内向けのシャッフルランチのウェブアプリ。今日ランチに行きたい人が、QR コードから開いて「参加する」を押すだけで集まれる。

- 仕様は `SPEC.md`（受け入れ条件は 8章）。画面デザインの経緯は `DESIGN_HISTORY.md`。
- 画面案（採用したのは「A案 After」）：https://claude.ai/artifact/NaBQC1yUqib22NfCQeRzf7
- 今の段階は**作っている途中**（イシュー #1）。Google ログインと、Firestore への保存・読み込み・リアルタイム更新はできた。アプリの中のブラウザの画面、`/blocked`・`/expired` の整理はまだ。
- ログインは会社の Google アカウント（Google Workspace）。社内の人かどうかは「メールが確認済みで会社のドメイン」で決め、守りは Firestore のセキュリティルールに置く（`SPEC.md` 6.1）。合言葉はやめた。

- Next.js 16.4.3 / React 19.3.0 / TypeScript（strict）
- Tailwind CSS v4
- Vitest（`lib/` の関数だけをテストする。画面を操作するテストは作らない）

## 環境

- Docker コンテナの中で動いている。
- 開発サーバーは別のターミナルで起動済み。`npm run dev` は実行しない。
- git と gh はコンテナの中で使える。

## 作業の約束

- 回答は必ず日本語で書く。
- パッケージを追加する前に、パッケージ名と追加する理由を伝えて確認を取る。
- 作業が終わったら、変更したファイルを一覧にする。
- ページのファイルは表示だけにする。判定やデータの加工などのロジックは、`lib/` に関数として置く。
- コミットとプッシュは、頼まれたときだけ
- コミットの前に、対象のファイルとメッセージを見せる
- コミットメッセージは日本語で書く

## コマンド

```bash
npm run build    # 本番ビルド
npm run start    # ビルド結果を起動
npm run lint     # ESLint（eslint-config-next の core-web-vitals + typescript）
npx tsc --noEmit # 型チェック（専用スクリプトはない）
npm run test:run # テストを1回だけ実行（Claude はこちらを使う）
npm run test     # テストを監視モードで実行（人が使う。終わらないので Claude は使わない）
npx vitest run lib/date.test.ts # 1つのファイルだけ実行
```

### テスト

- 設定は `vitest.config.mts`（Next.js 公式ガイド `01-app/02-guides/testing/vitest.md` をもとにした）。
- 対象は `lib/**/*.test.ts` だけ。テストファイルは、テストする関数と同じ `lib/` の中に `〇〇.test.ts` として置く。
- 画面のテストはしないので、jsdom や React Testing Library は入れていない。環境は Node.js。
- テストの中でも `@/...` のインポートが使える（`vite-tsconfig-paths`）。

## Next.js の設定

App Router のガイドは `node_modules/next/dist/docs/01-app/` にある。

`next.config.ts` の設定:

- `cacheComponents: true` — Cache Components が有効。データや UI のキャッシュは `"use cache"` ディレクティブと `cacheLife` で行う。従来の `fetch` のキャッシュオプションや `revalidate` を前提にしないこと（`01-app/01-getting-started/08-caching.md` を参照）。
- `partialPrefetching: true` — `<Link>` はページ全体ではなく、ルートごとの App Shell を prefetch する。
- Tailwind は PostCSS ではなく、Turbopack のローダールール（`*.css` → `@tailwindcss/turbopack`）で処理している。`postcss.config` は存在しない。

## 構成

### 画面（ルート）

| パス | 画面 |
| --- | --- |
| `/` | 今日のランチ（トップ）。`app/page.tsx`。会社のアカウントでログインするまでは、ログインの画面を出す |
| `/blocked` | 社内の人専用です（合言葉の仕様のときの画面。`SPEC.md` 5.5 の「ログインしていない」画面に作り直す予定） |
| `/expired` | この QR コードは使えなくなりました（合言葉の仕様のときの画面。合言葉をやめたので不要。5.5 の「会社以外のアカウント」「アプリの中のブラウザ」の画面に置き換える予定） |

### ファイル

- `app/layout.tsx` — ルートレイアウト。`lang="ja"`、書体、`metadata` を定義。props の型には Next が生成するグローバル型 `LayoutProps<"/">` を使っている。
- `app/globals.css` — Tailwind の読み込み、`@theme` の色と書体のトークン、アニメーション（`anim-*` クラス）。
- `app/_components/auth-gate.tsx` — ログインの関所（Client Component）。会社のアカウントでログインしたときだけ中身を出し、それ以外は 5.5 の画面を出す。ログインしている人は `useSignedInUser()` で取り出す。
- `app/_components/lunch-app.tsx` — トップ画面の本体（Client Component）。Firestore の参加者を待ち受け、参加・参加をやめる・ひとことを `lib/lunch-store.ts` で保存する。下から出てくる画面の移り変わりを `useState` で持ち、下の部品を並べる。
- `app/_components/lunch/` — トップ画面だけで使う部品。`today-header.tsx`（日付の札と見出し）、`lunch-table.tsx`（テーブル・集合時刻と場所・席）、`member-list.tsx`（今日のメンバー）。
- `app/_components/ui/` — どの画面でも使える部品。`Tag`（丸い札）、`Button`（`cta`・`primary`・`secondary`・`subtle`・`link`）、`BottomSheet`、`TextField`、`SpeechBubble`、`ActionBar`（下に固定するボタンの部分）、`IconBadge`。画面に札やボタンを直接書かず、これらを使う。
- `app/_components/illustrations.tsx` — おにぎり、空席のお皿、紙吹雪、アイコンの SVG と、絵の色（`COLORS`）。
- `app/_components/locked-screen.tsx` — 社内の人専用の画面の共通部分（ログインの画面、`/blocked`、`/expired`）。
- `app/_lib/meeting.ts` — 集合時刻と場所（毎日同じ）。
- `lib/firebase.ts`・`lib/firebase-config.ts` — Firebase の初期化と、エラーコードの取り出し（`errorCode`）。接続情報は `.env.local` の `NEXT_PUBLIC_FIREBASE_*` から読む。
- `lib/setup.ts` — `.env.local` の設定がそろっているかを確かめる。足りなければ `AuthGate` が「いまは使えません」を出す（足りない名前はコンソールに出す）。
- `lib/account.ts` — 社内の人かどうかと、開いたときに出す画面の判定（画面の切り替えだけに使う）。会社のドメインは `.env.local` の `NEXT_PUBLIC_COMPANY_DOMAIN`。
- `lib/auth.ts` — Google ログイン（ポップアップ方式）。
- `lib/lunch-store.ts` — Firestore の読み書き（参加者の待ち受け・参加・参加をやめる・ひとこと・保存した名前）。Firebase を使うコードは `lib/` のこれらのファイルにだけ置く。
- `lib/lunch-docs.ts` — Firestore から読んだ文書を画面で使う形にする（Firebase には触らない）。
- `firestore.rules` — Firestore のセキュリティルール。守りの本体。会社のドメインは `companyDomain()` に直接書く。
- 参加者の型は `lib/members.ts` の `LunchMember`。おにぎりの具は色ではなく名前（`ume`・`sake`・`tamago`）で保存し、色は `illustrations.tsx` の `COLORS.topping` で決める。
- `_` で始まるフォルダはルートにならない（App Router の private folder）。
- インポートのエイリアスは `@/*`（プロジェクトルート基準）。

### 見た目の決まり

- 色はハードコードせず、`globals.css` の `@theme` のトークン（`bg-ground`、`bg-brand`、`text-muted` など）を使う。画面でいちばん濃い色（`brand`）は参加ボタンだけに使う。
- 色・角丸・文字の大きさ・影は、`[13px]` や `bg-white` のような値を直接書かず、`@theme` のトークン（`bg-surface`、`rounded-sheet`、`text-caption`、`shadow-join` など）を使う。トークンの名前は色や数字ではなく役割でつける。
  - 文字の大きさは5段階（`text-caption`・`text-body`・`text-heading`・`text-title`・`text-display`）。段階を増やさず、この中から選ぶ。
  - おにぎり・お皿・紙吹雪など絵の色は、`globals.css` ではなく `app/_components/illustrations.tsx` の `COLORS` にまとめる。
  - 社内の人専用の画面も、ランチの画面と同じトークン（`ground`・`ink`・`muted` など）を使う。
- 書体は2つ。`font-display`（Kiwi Maru）は見出し・数字・参加ボタンなど画面の顔になる部分だけ、それ以外は `font-sans`（Zen Kaku Gothic New）。どちらも `next/font/google` で読み込む。
- 動きは `globals.css` の `anim-*` クラスで付ける。新しい動きを足すときは、`prefers-reduced-motion` の一覧にも加えて止まるようにする。
- ダークモードはない（明るい画面だけ）。
