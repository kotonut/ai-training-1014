# シャッフルランチ

社内向けのシャッフルランチのウェブアプリです。今日ランチに行きたい人が、デスクに置いた QR コードからアプリを開いて「参加する」を押すだけで集まれます。

- ログインは会社の Google アカウント（Google Workspace）で行います。
- 参加者は Firestore に保存され、ほかの人の画面にもすぐに反映されます。

## 動かし方

### 1. 設定を書く

プロジェクトのフォルダに `.env.local` を作り、次の設定を書きます（値はここには書きません。Firebase のコンソールなどで確かめてください）。

| 名前 | 内容 |
| --- | --- |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase の API キー |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase の認証ドメイン |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase のプロジェクト ID |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase のアプリ ID |
| `NEXT_PUBLIC_COMPANY_DOMAIN` | 会社のメールのドメイン（先頭の `@` はなくてもよい） |

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_COMPANY_DOMAIN=
```

- 足りない設定があると、画面に「いまは使えません」が出ます。足りない名前はブラウザのコンソールに出ます。
- 社内の人かどうかの守りは Firestore のセキュリティルール（`firestore.rules`）にあります。会社のドメインは `firestore.rules` の `companyDomain()` にも直接書いてあるので、`NEXT_PUBLIC_COMPANY_DOMAIN` と同じにしてください。

### 2. 開発サーバーを起動する

```bash
npm install
npm run dev
```

ブラウザで http://localhost:3000 を開きます。

## よく使うコマンド

```bash
npm run build    # 本番ビルド
npm run start    # ビルド結果を起動
npm run lint     # ESLint（eslint-config-next の core-web-vitals + typescript）
npx tsc --noEmit # 型チェック（専用スクリプトはない）
npm run test:run # テストを1回だけ実行
npm run test     # テストを監視モードで実行
npx vitest run lib/date.test.ts # 1つのファイルだけ実行
npx tsx scripts/make-qr.ts <アプリの URL> # デスクに置く QR コード（印刷用の SVG）を qr/lunch-qr.svg に書き出す
```

## 詳しい資料

- [SPEC.md](./SPEC.md) — 仕様（受け入れ条件は 8章）
- [DESIGN_HISTORY.md](./DESIGN_HISTORY.md) — 画面デザインの経緯
- [CLAUDE.md](./CLAUDE.md) — 開発の決まり・ファイルの構成・見た目の決まり
