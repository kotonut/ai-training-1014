// SPEC.md 6.1「ログインと QR コード」：社内の人かどうかと、開いたときに出す画面
// ここでの判定は画面の切り替えだけに使う。守りは Firestore のセキュリティルールに置く。

/** ログインしている人のうち、判定に使う情報 */
export type AccountInfo = {
  email: string | null;
  emailVerified: boolean;
};

/** 開いたときに出す画面 */
export type AuthScreen =
  | "checking" // ログインしているか確かめている途中
  | "signedOut" // ログインしていない
  | "otherAccount" // 会社以外のアカウント（またはメールが確認されていない）
  | "inAppBrowser" // アプリの中のブラウザ（LINE・Slack など）で開いた
  | "lunch"; // 今日のランチ

// アプリの中のブラウザが User-Agent に入れる目印（SPEC.md 5.5）。
// Google はアプリの中のブラウザでのログインを止めているので、Safari や Chrome で開き直してもらう。
const IN_APP_BROWSER_MARKS: readonly RegExp[] = [
  /\bLine\//, // LINE（「Line/14.x」。大文字・小文字を区別して、ほかの言葉に当たらないようにする）
  /\bSlack(?:_SSB)?\//, // Slack（「Slack/24.x」「Slack_SSB/4.x」）
  /\bInstagram\b/, // Instagram
  /\b(?:FBAN|FBAV|FBIOS|FB_IAB|FB4A)\b/, // Facebook・Messenger
];

/** User-Agent から、アプリの中のブラウザかどうかを判定する */
export function isInAppBrowser(userAgent: string | null | undefined): boolean {
  if (!userAgent) return false;
  return IN_APP_BROWSER_MARKS.some((mark) => mark.test(userAgent));
}

/**
 * 会社のドメインの書き方をそろえる（前後の空白・先頭の「@」を取り、小文字にする）。
 * 空ならエラーにする。
 */
export function toCompanyDomain(raw: string | undefined): string {
  const domain = (raw ?? "").trim().replace(/^@/, "").toLowerCase();
  if (!domain) {
    throw new Error(
      "会社のドメインが設定されていません。.env.local に NEXT_PUBLIC_COMPANY_DOMAIN を設定してください",
    );
  }
  return domain;
}

/** 会社のドメイン。.env.local の NEXT_PUBLIC_COMPANY_DOMAIN から読む */
export function getCompanyDomain(): string {
  // ビルドのときに埋め込まれるよう、process.env.NEXT_PUBLIC_〇〇 と直接書く
  return toCompanyDomain(process.env.NEXT_PUBLIC_COMPANY_DOMAIN);
}

/**
 * 社内の人かどうか。メールが確認済みで、ドメインが会社のものと完全に一致するとき true。
 * サブドメイン（sub.example.co.jp）や、似た名前のドメイン（example.co.jp.evil.com）は社内とみなさない。
 * firestore.rules の isCompanyUser() と同じ決め方にする（@ がちょうど1つ、@ の前が空でない）。
 * ずれると、画面は開くのにデータが読めない、ということが起きる。
 */
export function isCompanyAccount(account: AccountInfo, companyDomain: string): boolean {
  if (!account.emailVerified || !account.email) return false;
  const parts = account.email.toLowerCase().split("@");
  return parts.length === 2 && parts[0] !== "" && parts[1] === companyDomain.toLowerCase();
}

/**
 * 開いたときに出す画面を決める（SPEC.md 6.1 の表）。
 * account が undefined のときは、まだ確かめている途中。null はログインしていない。
 * アプリの中のブラウザでは Google のログインができないので、ログインのボタンの代わりに
 * 「Safari や Chrome で開いてください」を出す。すでに会社のアカウントでログインしていれば、そのまま使える。
 */
export function decideAuthScreen(
  account: AccountInfo | null | undefined,
  companyDomain: string,
  userAgent?: string | null,
): AuthScreen {
  if (account === undefined) return "checking";
  if (account !== null && isCompanyAccount(account, companyDomain)) return "lunch";
  if (isInAppBrowser(userAgent)) return "inAppBrowser";
  return account === null ? "signedOut" : "otherAccount";
}

/**
 * ログインに失敗したときに出す文。Firebase のエラーコードから決める。
 * 自分でポップアップを閉じたときなど、知らせなくてよいときは null。
 */
export function signInErrorMessage(code: string): string | null {
  switch (code) {
    case "auth/popup-closed-by-user":
    case "auth/cancelled-popup-request":
    case "auth/user-cancelled":
      return null;
    case "auth/popup-blocked":
      return "ログインの画面を開けませんでした。ポップアップを許可して、もう一度お試しください";
    case "auth/network-request-failed":
      return "接続できません。電波のよい場所でもう一度お試しください";
    default:
      return "ログインできませんでした。もう一度お試しください";
  }
}
