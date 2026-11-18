import { describe, expect, it } from "vitest";
import {
  decideAuthScreen,
  isCompanyAccount,
  isInAppBrowser,
  signInErrorMessage,
  toCompanyDomain,
} from "@/lib/account";

const DOMAIN = "example.co.jp";

describe("toCompanyDomain", () => {
  it("前後の空白と先頭の @ を取り、小文字にする", () => {
    expect(toCompanyDomain("  @Example.CO.jp \n")).toBe("example.co.jp");
  });

  it("未設定や空ならエラーにする", () => {
    expect(() => toCompanyDomain(undefined)).toThrow("NEXT_PUBLIC_COMPANY_DOMAIN");
    expect(() => toCompanyDomain("  ")).toThrow("NEXT_PUBLIC_COMPANY_DOMAIN");
    expect(() => toCompanyDomain("@")).toThrow("NEXT_PUBLIC_COMPANY_DOMAIN");
  });
});

describe("isCompanyAccount", () => {
  it("確認済みで会社のドメインなら社内", () => {
    expect(isCompanyAccount({ email: "hanako@example.co.jp", emailVerified: true }, DOMAIN)).toBe(
      true,
    );
  });

  it("大文字・小文字の違いは気にしない", () => {
    expect(isCompanyAccount({ email: "Hanako@Example.CO.JP", emailVerified: true }, DOMAIN)).toBe(
      true,
    );
  });

  it("メールが確認されていなければ、会社のドメインでも社内ではない", () => {
    expect(isCompanyAccount({ email: "hanako@example.co.jp", emailVerified: false }, DOMAIN)).toBe(
      false,
    );
  });

  it("個人の Gmail は社内ではない", () => {
    expect(isCompanyAccount({ email: "hanako@gmail.com", emailVerified: true }, DOMAIN)).toBe(false);
  });

  it("サブドメイン・似た名前のドメイン・@ が2つあるアドレスは社内ではない", () => {
    for (const email of [
      "hanako@sub.example.co.jp",
      "hanako@example.co.jp.evil.com",
      "hanako@notexample.co.jp",
      "example.co.jp@gmail.com",
      "a@b@example.co.jp",
    ]) {
      expect(isCompanyAccount({ email, emailVerified: true }, DOMAIN)).toBe(false);
    }
  });

  it("メールがない・@ がない・@ の前が空なら社内ではない", () => {
    for (const email of [null, "", "example.co.jp", "@example.co.jp"]) {
      expect(isCompanyAccount({ email, emailVerified: true }, DOMAIN)).toBe(false);
    }
  });
});

describe("decideAuthScreen", () => {
  it("確かめている途中なら checking", () => {
    expect(decideAuthScreen(undefined, DOMAIN)).toBe("checking");
  });

  it("ログインしていなければ signedOut", () => {
    expect(decideAuthScreen(null, DOMAIN)).toBe("signedOut");
  });

  it("会社のアカウントなら lunch", () => {
    expect(decideAuthScreen({ email: "a@example.co.jp", emailVerified: true }, DOMAIN)).toBe(
      "lunch",
    );
  });

  it("会社以外のアカウントや、確認されていないメールなら otherAccount", () => {
    expect(decideAuthScreen({ email: "a@gmail.com", emailVerified: true }, DOMAIN)).toBe(
      "otherAccount",
    );
    expect(decideAuthScreen({ email: "a@example.co.jp", emailVerified: false }, DOMAIN)).toBe(
      "otherAccount",
    );
  });
});

// User-Agent の例
const UA = {
  iPhoneSafari:
    "Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Mobile/15E148 Safari/604.1",
  androidChrome:
    "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.6723.58 Mobile Safari/537.36",
  iPhoneChrome:
    "Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/130.0.6723.90 Mobile/15E148 Safari/604.1",
  pcEdge:
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36 Edg/130.0.0.0",
  macSafari:
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Safari/605.1.15",
  iPhoneLine:
    "Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Safari Line/14.18.0",
  androidLine:
    "Mozilla/5.0 (Linux; Android 14; Pixel 8 Build/AP2A.240905.003; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/130.0.6723.58 Mobile Safari/537.36 Line/14.18.1/IAB",
  iPhoneSlack:
    "Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Slack/24.10.10",
  androidSlack:
    "Mozilla/5.0 (Linux; Android 14; Pixel 8; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/130.0.6723.58 Mobile Safari/537.36 Slack/24.10.10.0",
  iPhoneInstagram:
    "Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Instagram 354.0.0.21.106 (iPhone15,2; iOS 18_1; ja_JP; ja; scale=3.00; 1179x2556; 652325225)",
  androidInstagram:
    "Mozilla/5.0 (Linux; Android 14; Pixel 8 Build/AP2A.240905.003; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/130.0.6723.58 Mobile Safari/537.36 Instagram 354.0.0.29.90 Android",
  iPhoneFacebook:
    "Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/22B83 [FBAN/FBIOS;FBAV/487.0.0.43.105;FBBV/655060226;FBDV/iPhone15,2;FBMD/iPhone;FBSN/iOS;FBSV/18.1;FBSS/3;FBCR/;FBID/phone;FBLC/ja_JP;FBOP/80]",
  androidFacebook:
    "Mozilla/5.0 (Linux; Android 14; Pixel 8 Build/AP2A.240905.003; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/130.0.6723.58 Mobile Safari/537.36 [FB_IAB/FB4A;FBAV/487.0.0.53.109;]",
};

describe("isInAppBrowser", () => {
  it("iPhone の Safari・Android の Chrome・PC のブラウザは、アプリの中ではない", () => {
    for (const ua of [UA.iPhoneSafari, UA.androidChrome, UA.iPhoneChrome, UA.pcEdge, UA.macSafari]) {
      expect(isInAppBrowser(ua)).toBe(false);
    }
  });

  it("LINE・Slack・Instagram・Facebook の中のブラウザは、アプリの中", () => {
    for (const ua of [
      UA.iPhoneLine,
      UA.androidLine,
      UA.iPhoneSlack,
      UA.androidSlack,
      UA.iPhoneInstagram,
      UA.androidInstagram,
      UA.iPhoneFacebook,
      UA.androidFacebook,
    ]) {
      expect(isInAppBrowser(ua)).toBe(true);
    }
  });

  it("User-Agent がないときは、アプリの中ではないとみなす", () => {
    expect(isInAppBrowser(undefined)).toBe(false);
    expect(isInAppBrowser(null)).toBe(false);
    expect(isInAppBrowser("")).toBe(false);
  });
});

describe("decideAuthScreen（アプリの中のブラウザ）", () => {
  it("ログインしていなければ inAppBrowser", () => {
    expect(decideAuthScreen(null, DOMAIN, UA.iPhoneLine)).toBe("inAppBrowser");
  });

  it("会社以外のアカウントでも inAppBrowser（ここではログインし直せないため）", () => {
    expect(
      decideAuthScreen({ email: "a@gmail.com", emailVerified: true }, DOMAIN, UA.iPhoneSlack),
    ).toBe("inAppBrowser");
  });

  it("すでに会社のアカウントでログインしていれば、そのまま lunch", () => {
    expect(
      decideAuthScreen({ email: "a@example.co.jp", emailVerified: true }, DOMAIN, UA.iPhoneLine),
    ).toBe("lunch");
  });

  it("確かめている途中なら checking", () => {
    expect(decideAuthScreen(undefined, DOMAIN, UA.iPhoneLine)).toBe("checking");
  });

  it("iPhone の Safari・Android の Chrome では、ふだんの画面になる", () => {
    expect(decideAuthScreen(null, DOMAIN, UA.iPhoneSafari)).toBe("signedOut");
    expect(decideAuthScreen(null, DOMAIN, UA.androidChrome)).toBe("signedOut");
    expect(
      decideAuthScreen({ email: "a@gmail.com", emailVerified: true }, DOMAIN, UA.androidChrome),
    ).toBe("otherAccount");
  });
});

describe("signInErrorMessage", () => {
  it("自分で閉じたときは何も出さない", () => {
    expect(signInErrorMessage("auth/popup-closed-by-user")).toBeNull();
    expect(signInErrorMessage("auth/cancelled-popup-request")).toBeNull();
  });

  it("ポップアップがブロックされたら、許可するよう伝える", () => {
    expect(signInErrorMessage("auth/popup-blocked")).toContain("ポップアップを許可");
  });

  it("通信が切れていたら、接続できないと伝える", () => {
    expect(signInErrorMessage("auth/network-request-failed")).toContain("接続できません");
  });

  it("知らないエラーは、もう一度試すよう伝える", () => {
    expect(signInErrorMessage("auth/internal-error")).toBe(
      "ログインできませんでした。もう一度お試しください",
    );
  });
});
