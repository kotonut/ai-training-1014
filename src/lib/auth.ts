// Google ログイン（SPEC.md 6.1）。Firebase Authentication を使うコードはここにまとめる。
// ブラウザでだけ呼ぶ（Client Component の useEffect やボタンの onClick から）。

import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  type Unsubscribe,
} from "firebase/auth";
import { getCompanyDomain, type AccountInfo } from "@/lib/account";
import { errorCode, getFirebaseAuth } from "@/lib/firebase";

/** ログインしている人。メールは判定にだけ使い、保存も表示もしない（SPEC.md 6.2） */
export type SignedInUser = AccountInfo & {
  uid: string;
  /** Google アカウントの名前（初回の参加で名前の欄に入れる） */
  displayName: string | null;
};

/**
 * ログインの状態が変わるたびに onChange を呼ぶ（ログインしていなければ null）。
 * ログインした状態はブラウザに残るので、2回目からは開くとすぐログイン済みで呼ばれる。
 * 戻り値を呼ぶと、待ち受けをやめる。
 */
export function watchSignedInUser(onChange: (user: SignedInUser | null) => void): Unsubscribe {
  return onAuthStateChanged(getFirebaseAuth(), (user) => {
    onChange(
      user && {
        uid: user.uid,
        displayName: user.displayName,
        email: user.email,
        emailVerified: user.emailVerified,
      },
    );
  });
}

export type SignInResult = { ok: true } | { ok: false; code: string };

/**
 * Google でログインする（ポップアップ）。
 *
 * iPhone の Safari ではリダイレクト方式に追加の設定（認証用アドレスのプロキシなど）が要るため、
 * ポップアップ方式にした（https://firebase.google.com/docs/auth/web/redirect-best-practices）。
 * ポップアップがブロックされないよう、ボタンの onClick から await を挟まずに呼ぶこと。
 *
 * 会社のドメインのアカウントを候補に出し（hd）、毎回アカウントを選べるようにする。
 * hd は案内のためで、守りにはならない。
 * 失敗しても例外は投げず、結果で返す（設定の間違いで準備に失敗したときも含む）。
 */
export async function signInWithGoogle(): Promise<SignInResult> {
  try {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ hd: getCompanyDomain(), prompt: "select_account" });
    await signInWithPopup(getFirebaseAuth(), provider);
    return { ok: true };
  } catch (error) {
    console.error("Google でログインできませんでした", error);
    return { ok: false, code: errorCode(error) ?? "unknown" };
  }
}
