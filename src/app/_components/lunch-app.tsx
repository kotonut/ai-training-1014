"use client";

import { useState } from "react";
import { MEETING, MY_ID, MY_TOPPING, TODAY_KEY } from "@/app/_lib/dummy-data";
import { memoButtonLabel, personMemoText } from "@/lib/labels";
import {
  findMember,
  joinLunch,
  markMe,
  summarizeTable,
  type LunchMember,
  type ViewMember,
} from "@/lib/members";
import { validateMemo, validateName } from "@/lib/text-input";
import { HandIcon } from "./illustrations";
import { LunchTable } from "./lunch/lunch-table";
import { MemberList } from "./lunch/member-list";
import { TodayHeader } from "./lunch/today-header";
import { ActionBar } from "./ui/action-bar";
import { BottomSheet } from "./ui/bottom-sheet";
import { Button } from "./ui/button";
import { TextField } from "./ui/text-field";

// 画面のたたき台：見た目と画面の移り変わりだけ。
// 保存・リアルタイム更新などは SPEC.md に沿って後で作る。
// 判定やデータの加工は lib/ の関数で行い、見た目は部品（./lunch、./ui）に任せる。

type Sheet =
  | { type: "join" }
  | { type: "memo" }
  | { type: "person"; memberId: string }
  | null;

const MEMO_PLACEHOLDER = "例：4月入社です／中華の気分";

export function LunchApp({ initialMembers }: { initialMembers: LunchMember[] }) {
  const [myName, setMyName] = useState<string | null>(null);
  const [joined, setJoined] = useState(false);
  const [myMemo, setMyMemo] = useState("");
  const [sheet, setSheet] = useState<Sheet>(null);
  const [draftName, setDraftName] = useState("");
  const [draftMemo, setDraftMemo] = useState("");

  const members: ViewMember[] = markMe(
    joined && myName !== null
      ? joinLunch(initialMembers, { id: MY_ID, name: myName, memo: myMemo, topping: MY_TOPPING })
      : initialMembers,
    MY_ID,
  );
  const { total } = summarizeTable(members);
  const nameCheck = validateName(draftName);
  const memoCheck = validateMemo(draftMemo);

  const viewedMember =
    sheet?.type === "person" ? findMember(members, sheet.memberId) : undefined;

  // 画面の移り変わり
  const pressJoin = () => {
    if (myName) {
      setJoined(true);
    } else {
      setDraftName("");
      setDraftMemo("");
      setSheet({ type: "join" });
    }
  };
  const submitJoin = () => {
    if (!nameCheck.ok || !memoCheck.ok) return;
    setMyName(nameCheck.value);
    setMyMemo(memoCheck.value);
    setJoined(true);
    setSheet(null);
  };
  const openMemo = () => {
    setDraftMemo(myMemo);
    setSheet({ type: "memo" });
  };
  const saveMemo = () => {
    if (!memoCheck.ok) return;
    setMyMemo(memoCheck.value);
    setSheet(null);
  };
  const selectMember = (member: ViewMember) =>
    member.isMe ? openMemo() : setSheet({ type: "person", memberId: member.id });
  const leave = () => setJoined(false);
  const closeSheet = () => setSheet(null);

  return (
    <div className="relative mx-auto flex h-dvh w-full max-w-[430px] flex-col overflow-hidden bg-ground">
      <TodayHeader dateKey={TODAY_KEY} count={total} joined={joined} />
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
              <Button variant="subtle" onClick={leave} className="flex-1">
                参加をやめる
              </Button>
            </div>
          </>
        ) : (
          <Button variant="cta" onClick={pressJoin}>
            <HandIcon className="anim-wave" />
            今日のランチに参加する
          </Button>
        )}
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
          />
          <TextField
            id="join-memo"
            label="ひとこと（なくてもOK）"
            placeholder={MEMO_PLACEHOLDER}
            value={draftMemo}
            onChange={setDraftMemo}
          />
          <Button
            variant="primary"
            onClick={submitJoin}
            disabled={!nameCheck.ok || !memoCheck.ok}
            className="mt-1"
          >
            参加する
          </Button>
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
          />
          <Button variant="primary" onClick={saveMemo} disabled={!memoCheck.ok} className="mt-1">
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
