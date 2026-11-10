"use client";

import { useEffect, useRef, useState } from "react";
import { MEETING } from "@/app/_lib/meeting";
import { hasDateChanged, toDateKey } from "@/lib/date";
import { errorCode } from "@/lib/firebase";
import {
  inputErrorMessage,
  lunchErrorMessage,
  memoButtonLabel,
  personMemoText,
  type LunchAction,
} from "@/lib/labels";
import {
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
  // 読み込みの失敗も、どの日のものかを一緒に持つ（日付が変わったら前の日の失敗は出さない）
  const [loadFailure, setLoadFailure] = useState<{ dateKey: string; message: string } | null>(null);
  // undefined：読み込み中、null：まだ一度も参加していない
  const [savedName, setSavedName] = useState<string | null | undefined>(undefined);
  // 参加する・参加をやめるの保存中（ひとことの保存は待たないので含めない）
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [sheet, setSheet] = useState<Sheet>(null);
  const [draftName, setDraftName] = useState("");
  const [draftMemo, setDraftMemo] = useState("");
  // ひとことの保存を続けてしたとき、いちばん新しい保存の失敗だけを出すための番号
  const memoSaveId = useRef(0);

  // 画面を開いたまま日付が変わったら、新しい日に切り替える（SPEC.md 8.2）
  useEffect(() => {
    const id = setInterval(() => {
      setDateKey((current) => (hasDateChanged(current, new Date()) ? toDateKey(new Date()) : current));
    }, DATE_CHECK_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  // その日の参加者を待ち受ける（リアルタイム更新）。
  // 通信が切れているあいだは Firestore が自分でつなぎ直す。onError が呼ばれるのは
  // 権限がないときなど待ち受けが止まったときなので、再読み込みを案内する。
  useEffect(
    () =>
      watchMembers(
        dateKey,
        (members) => {
          setSnapshot({ dateKey, members });
          setLoadFailure(null);
        },
        (error) =>
          setLoadFailure({ dateKey, message: lunchErrorMessage("load", errorCode(error)) }),
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
  const loadError = loadFailure?.dateKey === dateKey ? loadFailure.message : null;
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

  /**
   * 参加する・参加をやめるを保存する。終わるまで、ほかの操作のボタンを押せなくする。
   * 失敗したらそのことを出し、false を返す（画面は保存されたデータのまま）。
   */
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

  const openJoinSheet = () => {
    // 初回は名前の欄に Google アカウントの名前を入れておく
    setDraftName(user.displayName ?? "");
    setDraftMemo("");
    setSheet({ type: "join" });
  };

  // 画面の移り変わり
  const pressJoin = () => {
    if (savedName === null) {
      openJoinSheet();
      return;
    }
    // 名前の読み込みと参加を1つの保存にまとめ、そのあいだボタンを押せなくする
    void save("join", async () => {
      // 名前の読み込みが終わっていなければ、ここで読みに行く
      const name = savedName ?? (await loadSavedName(user.uid));
      setSavedName(name);
      if (name) {
        // 2回目からは押すだけで参加する。ひとことはその日だけなので空から始める
        await joinToday({ dateKey, userId: user.uid, name, memo: "" });
      } else {
        openJoinSheet();
      }
    });
  };
  const submitJoin = async () => {
    if (!nameCheck.ok || !memoCheck.ok) return;
    const name = nameCheck.value;
    const memo = memoCheck.value;
    if (await save("join", () => joinToday({ dateKey, userId: user.uid, name, memo }))) {
      setSavedName(name);
      setSheet(null);
    }
  };
  const openMemo = () => {
    // 参加する・参加をやめるの保存中は開かない（やめた後にひとことを保存して失敗しないように）
    if (busy) return;
    setDraftMemo(myMemo);
    setSheet({ type: "memo" });
  };
  const submitMemo = () => {
    if (!memoCheck.ok) return;
    // 画面にはすぐ出る（通信が切れていても）。保存の終わりは待たないので、ほかのボタンは押せたまま。
    // 保存に失敗したら、もとのひとことに戻ってそのことを出す（続けて保存したときは、いちばん新しいものだけ）
    const id = ++memoSaveId.current;
    setSheet(null);
    setActionError(null);
    saveMemo(dateKey, user.uid, memoCheck.value).catch((error: unknown) => {
      if (id === memoSaveId.current) setActionError(lunchErrorMessage("memo", errorCode(error)));
    });
  };
  const selectMember = (member: ViewMember) =>
    member.isMe ? openMemo() : setSheet({ type: "person", memberId: member.id });
  const leave = () => void save("leave", () => leaveToday(dateKey, user.uid));
  const closeSheet = () => setSheet(null);

  // 待ち受けが止まったときは、表示が古いままなので、そのことを出す
  const errorText = (actionError || loadError) && (
    <p role="alert" className="text-center text-caption leading-relaxed text-muted">
      {actionError ?? loadError}
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
              <Button variant="secondary" onClick={openMemo} disabled={busy} className="flex-1">
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
