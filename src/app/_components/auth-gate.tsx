"use client";

import { createContext, use, useEffect, useState, useSyncExternalStore } from "react";
import { decideAuthScreen, getCompanyDomain, signInErrorMessage } from "@/lib/account";
import { signInWithGoogle, watchSignedInUser, type SignedInUser } from "@/lib/auth";
import { copyText } from "@/lib/clipboard";
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

// User-Agent は変わらないので、待ち受けは何もしない。サーバーで描くときは null（わからない）
const subscribeNothing = () => () => {};
const readUserAgent = () => navigator.userAgent;
const noUserAgentOnServer = () => null;

export function AuthGate({ children }: { children: React.ReactNode }) {
  // undefined：確かめている途中、null：ログインしていない
  const [user, setUser] = useState<SignedInUser | null | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const userAgent = useSyncExternalStore(subscribeNothing, readUserAgent, noUserAgentOnServer);

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

  const screen = decideAuthScreen(user, getCompanyDomain(), userAgent);

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

  if (screen === "inAppBrowser") {
    // Google はアプリの中のブラウザでのログインを止めているので、ログインのボタンは出さない
    return (
      <LockedScreen
        title={"このままでは\nログインできません"}
        message="Safari や Chrome で開いてください。下のボタンで URL をコピーして、Safari や Chrome のアドレス欄に貼り付けると開けます。"
      >
        <CopyUrlButton />
      </LockedScreen>
    );
  }

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

// 今のページの URL をコピーするボタン（SPEC.md 5.5）。
// コピーできなかったときのために、URL も文字で出しておく（長押しで選べる）。
function CopyUrlButton() {
  const [result, setResult] = useState<"copied" | "failed" | null>(null);
  const url = useSyncExternalStore(subscribeNothing, readPageUrl, noPageUrlOnServer);

  const copy = () => {
    void copyText(window.location.href).then((ok) => setResult(ok ? "copied" : "failed"));
  };

  return (
    <>
      <Button variant="primary" onClick={copy} className="w-full">
        URL をコピー
      </Button>
      <p role="status" className="text-caption leading-relaxed text-muted">
        {result === "copied" && "コピーしました。Safari や Chrome に貼り付けて開いてください"}
        {result === "failed" && "コピーできませんでした。下の URL を長押しして選んでください"}
      </p>
      {url && <p className="text-caption break-all text-muted select-all">{url}</p>}
    </>
  );
}

const readPageUrl = () => window.location.href;
const noPageUrlOnServer = () => null;
