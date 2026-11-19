import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { findSetupProblem } from "@/lib/setup";

// そろっているときの設定。テストごとに入れ直し、1つずつ消して確かめる
const COMPLETE_ENV = {
  NEXT_PUBLIC_FIREBASE_API_KEY: "test-api-key",
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: "test.firebaseapp.com",
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: "test-project",
  NEXT_PUBLIC_FIREBASE_APP_ID: "1:123:web:abc",
  NEXT_PUBLIC_COMPANY_DOMAIN: "example.co.jp",
} as const;

const FIREBASE_ENV_NAMES = [
  "NEXT_PUBLIC_FIREBASE_API_KEY",
  "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
  "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
  "NEXT_PUBLIC_FIREBASE_APP_ID",
] as const;

describe("findSetupProblem", () => {
  beforeEach(() => {
    for (const [name, value] of Object.entries(COMPLETE_ENV)) {
      vi.stubEnv(name, value);
    }
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("Firebase の設定と会社のドメインがそろっていれば null を返す", () => {
    expect(findSetupProblem()).toBeNull();
  });

  it.each(FIREBASE_ENV_NAMES)("Firebase の設定（%s）が足りなければ、その名前を含む説明を返す", (name) => {
    vi.stubEnv(name, undefined);

    const problem = findSetupProblem();

    expect(problem).toContain(name);
    // 足りないのはこの1つだけなので、ほかの名前は出さない
    for (const other of FIREBASE_ENV_NAMES.filter((n) => n !== name)) {
      expect(problem).not.toContain(other);
    }
  });

  it("会社のドメイン（NEXT_PUBLIC_COMPANY_DOMAIN）がなければ、説明を返す", () => {
    vi.stubEnv("NEXT_PUBLIC_COMPANY_DOMAIN", undefined);

    expect(findSetupProblem()).toContain("NEXT_PUBLIC_COMPANY_DOMAIN");
  });
});
