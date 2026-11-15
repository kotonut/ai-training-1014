import type { FirebaseOptions } from "firebase/app";

/** Firebase の接続情報。値は .env.local の NEXT_PUBLIC_FIREBASE_* から読む */
export type FirebaseEnv = {
  apiKey: string | undefined;
  authDomain: string | undefined;
  projectId: string | undefined;
  appId: string | undefined;
};

/** 接続情報の項目と、.env.local での名前 */
export const FIREBASE_ENV_NAMES = {
  apiKey: "NEXT_PUBLIC_FIREBASE_API_KEY",
  authDomain: "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
  projectId: "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
  appId: "NEXT_PUBLIC_FIREBASE_APP_ID",
} as const satisfies Record<keyof FirebaseEnv, string>;

/**
 * 接続情報を Firebase の設定にする。
 * 足りない値（未設定・空・空白だけ）があれば、その .env.local の名前を並べてエラーにする。
 */
export function toFirebaseOptions(env: FirebaseEnv): FirebaseOptions {
  const keys = Object.keys(FIREBASE_ENV_NAMES) as (keyof FirebaseEnv)[];
  const missing = keys.filter((key) => !env[key]?.trim());
  if (missing.length > 0) {
    const names = missing.map((key) => FIREBASE_ENV_NAMES[key]).join(", ");
    throw new Error(`Firebase の接続情報が足りません。.env.local に設定してください: ${names}`);
  }
  return {
    apiKey: env.apiKey!.trim(),
    authDomain: env.authDomain!.trim(),
    projectId: env.projectId!.trim(),
    appId: env.appId!.trim(),
  };
}
