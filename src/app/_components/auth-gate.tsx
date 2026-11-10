"use client";

import { createContext, use, useEffect, useState } from "react";
import { decideAuthScreen, getCompanyDomain, signInErrorMessage } from "@/lib/account";
import { signInWithGoogle, watchSignedInUser, type SignedInUser } from "@/lib/auth";
import { findSetupProblem } from "@/lib/setup";
import { LockedScreen } from "./locked-screen";
import { Button } from "./ui/button";

// ログインの関所（SPEC.md 5.5・6.1）。会社のアカウントでログインしたときだけ children を出す。
// それまでは参加者の名前・ひとこと・人数を一切出さない。

const SignedInUserContext = createContext<SignedInUser | null>(null);

/** ログインしている人。AuthGate の中でだけ使える */
export function useSignedInUser(): SignedInUser {
  const user = use(SignedInUserContext);
  if (!user) throw new Error("useSignedInUser は AuthGate の中で使ってください");
  return user;
}

// 設定（.env.local）に足りないものがあるか。値はビルドのときに決まるので、1回だけ確かめる
const SETUP_PROBLEM = findSetupProblem();

export function AuthGate({ children }: { children: React.ReactNode }) {
  // undefined：確かめている途中、null：ログインしていない
  const [user, setUser] = useState<SignedInUser | null | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (SETUP_PROBLEM) {
      // 足りない設定の名前は開発する人向けなので、画面ではなくコンソールに出す
      console.error(SETUP_PROBLEM);
      return;
    }
    return watchSignedInUser(setUser);
  }, []);

  // ポップアップがブロックされないよう、押したらすぐ呼ぶ（signInWithGoogle は失敗しても例外を投げない）
  const signIn = () => {
    setError(null);
    void signInWithGoogle().then((result) => {
      if (!result.ok) setError(signInErrorMessage(result.code));
    });
  };

  if (SETUP_PROBLEM) {
    return (
      <LockedScreen
        title={"いまは\n使えません"}
        message="アプリの設定に足りないものがあります。アプリを管理している人に知らせてください。"
      />
    );
  }

  const screen = user === undefined ? "checking" : decideAuthScreen(user, getCompanyDomain());

  if (screen === "lunch" && user) {
    return <SignedInUserContext value={user}>{children}</SignedInUserContext>;
  }

  if (screen === "checking") {
    // ログイン済みの人に、一瞬ログインの画面が見えないように何も出さない
    return <main aria-busy="true" className="h-dvh bg-ground" />;
  }

  const errorText = error && (
    <p role="alert" className="text-caption leading-relaxed text-muted">
      {error}
    </p>
  );

  if (screen === "otherAccount") {
    return (
      <LockedScreen
        title={"このアカウントでは\n使えません"}
        message="会社の Google アカウントでログインし直してください。"
      >
        <Button variant="primary" onClick={signIn} className="w-full">
          別のアカウントでログイン
        </Button>
        {errorText}
      </LockedScreen>
    );
  }

  return (
    <LockedScreen
      title={"このページは\n社内の人専用です"}
      message="会社の Google アカウントでログインしてください。"
    >
      <Button variant="primary" onClick={signIn} className="w-full">
        Google でログイン
      </Button>
      {errorText}
    </LockedScreen>
  );
}
