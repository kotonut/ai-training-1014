"use client";

import { useEffect, useState } from "react";
import { decideAuthScreen, getCompanyDomain, signInErrorMessage } from "@/lib/account";
import { signInWithGoogle, watchSignedInUser, type SignedInUser } from "@/lib/auth";
import { LockedScreen } from "./locked-screen";
import { Button } from "./ui/button";

// ログインの関所（SPEC.md 5.5・6.1）。会社のアカウントでログインしたときだけ children を出す。
// それまでは参加者の名前・ひとこと・人数を一切出さない。

export function AuthGate({ children }: { children: React.ReactNode }) {
  // undefined：確かめている途中、null：ログインしていない
  const [user, setUser] = useState<SignedInUser | null | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => watchSignedInUser(setUser), []);

  const screen = user === undefined ? "checking" : decideAuthScreen(user, getCompanyDomain());

  // ポップアップがブロックされないよう、押したらすぐ呼ぶ
  const signIn = () => {
    setError(null);
    signInWithGoogle().then((result) => {
      if (!result.ok) setError(signInErrorMessage(result.code));
    });
  };

  if (screen === "lunch") return children;

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
