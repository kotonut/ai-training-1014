import { describe, expect, it } from "vitest";
import {
  decideAuthScreen,
  isCompanyAccount,
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

  it("サブドメインや、似た名前のドメインは社内ではない", () => {
    for (const email of [
      "hanako@sub.example.co.jp",
      "hanako@example.co.jp.evil.com",
      "hanako@notexample.co.jp",
      "example.co.jp@gmail.com",
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
