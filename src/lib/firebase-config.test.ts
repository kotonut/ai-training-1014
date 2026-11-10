import { describe, expect, it } from "vitest";
import { toFirebaseOptions, type FirebaseEnv } from "@/lib/firebase-config";

const fullEnv: FirebaseEnv = {
  apiKey: "test-api-key",
  authDomain: "example.firebaseapp.com",
  projectId: "example",
  appId: "1:123:web:abc",
};

describe("toFirebaseOptions", () => {
  it("すべてそろっていれば、Firebase の設定にする", () => {
    expect(toFirebaseOptions(fullEnv)).toEqual(fullEnv);
  });

  it("前後の空白は取り除く", () => {
    expect(toFirebaseOptions({ ...fullEnv, projectId: "  example \n" }).projectId).toBe("example");
  });

  it("未設定の値があれば、その名前をエラーに出す", () => {
    expect(() => toFirebaseOptions({ ...fullEnv, apiKey: undefined })).toThrow(
      "NEXT_PUBLIC_FIREBASE_API_KEY",
    );
  });

  it("空や空白だけの値も、足りないとみなす", () => {
    expect(() => toFirebaseOptions({ ...fullEnv, authDomain: "", appId: "  " })).toThrow(
      "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN, NEXT_PUBLIC_FIREBASE_APP_ID",
    );
  });
});
