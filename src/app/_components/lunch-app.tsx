"use client";

import { useEffect, useState } from "react";
import { MEETING } from "@/app/_lib/meeting";
import { hasDateChanged, toDateKey } from "@/lib/date";
import {
  inputErrorMessage,
  lunchErrorMessage,
  memoButtonLabel,
  personMemoText,
  type LunchAction,
} from "@/lib/labels";
import {
  errorCode,
  joinToday,
  leaveToday,
  loadSavedName,
  saveMemo,
  watchMembers,
} from "@/lib/lunch-store";
import { findMember, markMe, summarizeTable, type LunchMember, type ViewMember } from "@/lib/members";
import { validateMemo, validateName } from "@/lib/text-input";
import { useSignedInUser } from "./auth-gate";
import { HandIcon } from "./illustrations";
import { LunchTable } from "./lunch/lunch-table";
import { MemberList } from "./lunch/member-list";
import { TodayHeader } from "./lunch/today-header";
import { ActionBar } from "./ui/action-bar";
import { BottomSheet } from "./ui/bottom-sheet";
import { Button } from "./ui/button";
import { TextField } from "./ui/text-field";

// 今日のランチ（SPEC.md 5.1〜5.4）。AuthGate の中で使う。
// データは Firestore から読み書きする（lib/lunch-store.ts）。他の人の変更もすぐ反映される。
// 判定やデータの加工は lib/ の関数で行い、見た目は部品（./lunch、./ui）に任せる。

type Sheet =
  | { type: "join" }
  | { type: "memo" }
  | { type: "person"; memberId: string }
  | null;

const MEMO_PLACEHOLDER = "例：4月入社です／中華の気分";

/** 日付が変わったか確かめる間隔 */
const DATE_CHECK_INTERVAL_MS = 60_000;

export function LunchApp() {
  const user = useSignedInUser();
  const [dateKey, setDateKey] = useState(() => toDateKey(new Date()));
  // どの日のデータかも一緒に持ち、日付が変わったら古い日のデータを出さない
  const [snapshot, setSnapshot] = useState<{ dateKey: string; members: LunchMember[] } | null>(
    null,
  );
  const [loadError, setLoadError] = useState<string | null>(null);
  // undefined：読み込み中、null：まだ一度も参加していない
  const [savedName, setSavedName] = useState<string | null | undefined>(undefined);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [sheet, setSheet] = useState<Sheet>(null);
  const [draftName, setDraftName] = useState("");
  const [draftMemo, setDraftMemo] = useState("");

  // 画面を開いたまま日付が変わったら、新しい日に切り替える（SPEC.md 8.2）
  useEffect(() => {
    const id = setInterval(() => {
      setDateKey((current) => (hasDateChanged(current, new Date()) ? toDateKey(new Date()) : current));
    }, DATE_CHECK_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  // その日の参加者を待ち受ける（リアルタイム更新）
  useEffect(
    () =>
      watchMembers(
        dateKey,
        (members) => {
          setSnapshot({ dateKey, members });
          setLoadError(null);
        },
        (error) => setLoadError(lunchErrorMessage("load", errorCode(error))),
      ),
    [dateKey],
  );

  // 前に参加したときの名前（2回目からは入力なしで参加する）
  useEffect(() => {
    let active = true;
    loadSavedName(user.uid).then(
      (name) => active && setSavedName(name),
      // 読めなかったら undefined のまま。参加ボタンを押したときに読み直す
      (error) => console.error("保存した名前を読み込めませんでした", error),
    );
    return () => {
      active = false;
    };
  }, [user.uid]);

  const loaded = snapshot?.dateKey === dateKey ? snapshot.members : null;
  if (loaded === null) {
    return (
      <main aria-busy={!loadError} className="flex h-dvh items-center justify-center bg-ground px-8">
        {loadError && (
          <p role="alert" className="text-center text-body leading-loose text-muted">
            {loadError}
          </p>
        )}
      </main>
    );
  }

  const members: ViewMember[] = markMe(loaded, user.uid);
  const me = findMember(members, user.uid);
  const joined = me !== undefined;
  const myMemo = me?.memo ?? "";
  const { total } = summarizeTable(members);
  const nameCheck = validateName(draftName);
  const memoCheck = validateMemo(draftMemo);

  const viewedMember =
    sheet?.type === "person" ? findMember(members, sheet.memberId) : undefined;

  /** 保存する。失敗したらそのことを出し、false を返す（画面は保存されたデータのまま） */
  const save = async (action: LunchAction, task: () => Promise<void>): Promise<boolean> => {
    setBusy(true);
    setActionError(null);
    try {
      await task();
      return true;
    } catch (error) {
      setActionError(lunchErrorMessage(action, errorCode(error)));
      return false;
    } finally {
      setBusy(false);
    }
  };

  const join = (name: string, memo: string) =>
    save("join", () => joinToday({ dateKey, userId: user.uid, name, memo }));

  // 画面の移り変わり
  const pressJoin = async () => {
    let name = savedName;
    if (name === undefined) {
      // 名前の読み込みが終わっていなければ、ここで読みに行く。読めなければ失敗を出して止める
      setBusy(true);
      setActionError(null);
      try {
        name = await loadSavedName(user.uid);
        setSavedName(name);
      } catch (error) {
        setActionError(lunchErrorMessage("join", errorCode(error)));
        return;
      } finally {
        setBusy(false);
      }
    }
    if (name) {
      // 2回目からは押すだけで参加する。ひとことはその日だけなので空から始める
      void join(name, "");
    } else {
      // 初回は名前の欄に Google アカウントの名前を入れておく
      setDraftName(user.displayName ?? "");
      setDraftMemo("");
      setSheet({ type: "join" });
    }
  };
  const submitJoin = async () => {
    if (!nameCheck.ok || !memoCheck.ok) return;
    if (await join(nameCheck.value, memoCheck.value)) {
      setSavedName(nameCheck.value);
      setSheet(null);
    }
  };
  const openMemo = () => {
    setDraftMemo(myMemo);
    setSheet({ type: "memo" });
  };
  const submitMemo = () => {
    if (!memoCheck.ok) return;
    // 通信が切れていても画面にはすぐ出る。保存に失敗したら、もとのひとことに戻ってそのことを出す
    setSheet(null);
    void save("memo", () => saveMemo(dateKey, user.uid, memoCheck.value));
  };
  const selectMember = (member: ViewMember) =>
    member.isMe ? openMemo() : setSheet({ type: "person", memberId: member.id });
  const leave = () => void save("leave", () => leaveToday(dateKey, user.uid));
  const closeSheet = () => setSheet(null);

  const errorText = actionError && (
    <p role="alert" className="text-center text-caption leading-relaxed text-muted">
      {actionError}
    </p>
  );

  return (
    <div className="relative mx-auto flex h-dvh w-full max-w-[430px] flex-col overflow-hidden bg-ground">
      <TodayHeader dateKey={dateKey} count={total} joined={joined} />
      <LunchTable members={members} meeting={MEETING} onSelect={selectMember} />
      <MemberList members={members} />

      <ActionBar>
        {joined ? (
          <>
            <p className="anim-rise text-center font-display text-body font-medium">
              参加しました！ {MEETING.time} に {MEETING.place}へ
            </p>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={openMemo} className="flex-1">
                {memoButtonLabel(myMemo)}
              </Button>
              <Button variant="subtle" onClick={leave} disabled={busy} className="flex-1">
                参加をやめる
              </Button>
            </div>
          </>
        ) : (
          <Button variant="cta" onClick={pressJoin} disabled={busy}>
            <HandIcon className="anim-wave" />
            今日のランチに参加する
          </Button>
        )}
        {sheet === null && errorText}
      </ActionBar>

      {/* 下から出てくる画面 */}
      {sheet?.type === "join" && (
        <BottomSheet title="今日のランチに参加する" onClose={closeSheet}>
          <TextField
            id="join-name"
            label="名前（次からは入力不要）"
            placeholder="例：山田 花子"
            value={draftName}
            onChange={setDraftName}
            error={inputErrorMessage("name", nameCheck)}
          />
          <TextField
            id="join-memo"
            label="ひとこと（なくてもOK）"
            placeholder={MEMO_PLACEHOLDER}
            value={draftMemo}
            onChange={setDraftMemo}
            error={inputErrorMessage("memo", memoCheck)}
          />
          <Button
            variant="primary"
            onClick={submitJoin}
            disabled={busy || !nameCheck.ok || !memoCheck.ok}
            className="mt-1"
          >
            参加する
          </Button>
          {errorText}
        </BottomSheet>
      )}

      {sheet?.type === "memo" && (
        <BottomSheet title="ひとこと" onClose={closeSheet}>
          <TextField
            id="my-memo"
            label="みんなに見えます（なくてもOK）"
            placeholder={MEMO_PLACEHOLDER}
            value={draftMemo}
            onChange={setDraftMemo}
            error={inputErrorMessage("memo", memoCheck)}
          />
          <Button variant="primary" onClick={submitMemo} disabled={!memoCheck.ok} className="mt-1">
            保存する
          </Button>
        </BottomSheet>
      )}

      {sheet?.type === "person" && viewedMember && (
        <BottomSheet title={viewedMember.name} onClose={closeSheet}>
          <p className="text-body leading-relaxed">{personMemoText(viewedMember.memo)}</p>
        </BottomSheet>
      )}
    </div>
  );
}
