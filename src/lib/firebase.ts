import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { toFirebaseOptions } from "@/lib/firebase-config";

/**
 * Firebase アプリを返す。初めて呼ばれたときに初期化する。
 * 開発サーバーでファイルが読み直されても、二重に初期化しない。
 *
 * ブラウザで使う値は、ビルドのときに埋め込まれる。埋め込まれるのは
 * `process.env.NEXT_PUBLIC_〇〇` と直接書いたものだけなので、1つずつ書く。
 */
export function getFirebaseApp(): FirebaseApp {
  if (getApps().length > 0) return getApp();
  return initializeApp(
    toFirebaseOptions({
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    }),
  );
}

/** ログイン（Firebase Authentication） */
export function getFirebaseAuth(): Auth {
  return getAuth(getFirebaseApp());
}

/** データの保存（Firestore） */
export function getDb(): Firestore {
  return getFirestore(getFirebaseApp());
}
