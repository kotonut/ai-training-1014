# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## 概要

社内向けのシャッフルランチのウェブアプリ。今日ランチに行きたい人が、QR コードから開いて「参加する」を押すだけで集まれる。

- 仕様は `SPEC.md`（受け入れ条件は 8章）。画面デザインの経緯は `DESIGN_HISTORY.md`。
- 画面案（採用したのは「A案 After」）：https://claude.ai/artifact/NaBQC1yUqib22NfCQeRzf7
- 今の段階は**画面のたたき台**。見た目と画面の移り変わりだけで、データはダミー。Firebase（匿名認証・Firestore）、合言葉の判定、入力のルールはまだ作っていない。

- Next.js 16.4.3 / React 19.3.0 / TypeScript（strict）
- Tailwind CSS v4
- Vitest（`lib/` の関数だけをテストする。画面を操作するテストは作らない）

## 環境

- Docker コンテナの中で動いている。
- 開発サーバーは別のターミナルで起動済み。`npm run dev` は実行しない。
- git は人がパソコン側で使う。git のコマンドは実行しない。

## 作業の約束

- パッケージを追加する前に、パッケージ名と追加する理由を伝えて確認を取る。
- 作業が終わったら、変更したファイルを一覧にする。

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
| `/` | 今日のランチ（トップ）。`app/page.tsx` |
| `/empty` | 確認用：まだ誰もいない日 |
| `/blocked` | 社内の人専用です（合言葉なしで開いたとき） |
| `/expired` | この QR コードは使えなくなりました（古い合言葉で開いたとき） |

### ファイル

- `app/layout.tsx` — ルートレイアウト。`lang="ja"`、書体、`metadata` を定義。props の型には Next が生成するグローバル型 `LayoutProps<"/">` を使っている。
- `app/globals.css` — Tailwind の読み込み、`@theme` の色と書体のトークン、アニメーション（`anim-*` クラス）。
- `app/_components/lunch-app.tsx` — トップ画面の本体（Client Component）。参加・ひとこと・人のカードなど、画面の移り変わりを `useState` で持つ。`/` と `/empty` で共通。
- `app/_components/illustrations.tsx` — おにぎり、空席のお皿、アイコンの SVG。
- `app/_components/locked-screen.tsx` — `/blocked` と `/expired` の共通部分。
- `app/_lib/dummy-data.ts` — ダミーデータ（参加者、日付、集合時刻・場所）と `Member` 型。本番では Firestore に置き換える。
- `_` で始まるフォルダはルートにならない（App Router の private folder）。
- インポートのエイリアスは `@/*`（プロジェクトルート基準）。

### 見た目の決まり

- 色はハードコードせず、`globals.css` の `@theme` のトークン（`bg-ground`、`bg-brand`、`text-muted` など）を使う。画面でいちばん濃い色（`brand`）は参加ボタンだけに使う。
- 書体は2つ。`font-display`（Kiwi Maru）は見出し・数字・参加ボタンなど画面の顔になる部分だけ、それ以外は `font-sans`（Zen Kaku Gothic New）。どちらも `next/font/google` で読み込む。
- 動きは `globals.css` の `anim-*` クラスで付ける。新しい動きを足すときは、`prefers-reduced-motion` の一覧にも加えて止まるようにする。
- ダークモードはない（明るい画面だけ）。
