# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## 概要

`create-next-app` から作成した Next.js（App Router）のプロジェクト。

- Next.js 16.4.0 / React 19.3.0 / TypeScript（strict）
- Tailwind CSS v4
- テストフレームワークは未導入

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
```

## Next.js の設定

App Router のガイドは `node_modules/next/dist/docs/01-app/` にある。

`next.config.ts` の設定:

- `cacheComponents: true` — Cache Components が有効。データや UI のキャッシュは `"use cache"` ディレクティブと `cacheLife` で行う。従来の `fetch` のキャッシュオプションや `revalidate` を前提にしないこと（`01-app/01-getting-started/08-caching.md` を参照）。
- `partialPrefetching: true` — `<Link>` はページ全体ではなく、ルートごとの App Shell を prefetch する。
- Tailwind は PostCSS ではなく、Turbopack のローダールール（`*.css` → `@tailwindcss/turbopack`）で処理している。`postcss.config` は存在しない。

## 構成

- `app/layout.tsx` — ルートレイアウト。`lang="ja"`、Geist フォント（`next/font/google`）、`metadata` を定義。props の型には Next が生成するグローバル型 `LayoutProps<"/">` を使っている。
- `app/globals.css` — Tailwind の読み込みと、CSS 変数 `--background` / `--foreground` によるライト/ダークのテーマ定義（`prefers-color-scheme` で切り替え）。
- インポートのエイリアスは `@/*`（プロジェクトルート基準）。
