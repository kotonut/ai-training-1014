"use client";

import { useState } from "react";
import { MEETING, MY_ID, MY_TOPPING, TODAY_KEY } from "@/app/_lib/dummy-data";
import { formatDateLabel } from "@/lib/date";
import { buildHeadline } from "@/lib/headline";
import {
  memberListName,
  memoButtonLabel,
  memoText,
  personMemoText,
  seatAriaLabel,
  seatLabel,
} from "@/lib/labels";
import {
  SEAT_COUNT,
  arrangeSeats,
  findMember,
  joinLunch,
  markMe,
  summarizeTable,
  type LunchMember,
} from "@/lib/members";
import { validateMemo, validateName } from "@/lib/text-input";
import { BowlIcon, Burst, EmptyPlate, HandIcon, Onigiri } from "./illustrations";

// 画面のたたき台：見た目と画面の移り変わりだけ。
// 保存・リアルタイム更新などは SPEC.md に沿って後で作る。
// 判定やデータの加工は lib/ の関数で行い、ここでは表示だけをする。

type Sheet =
  | { type: "join" }
  | { type: "memo" }
  | { type: "person"; memberId: string }
  | null;

type ViewMember = LunchMember & { isMe: boolean };

/** テーブルの大きさと、席を並べる円の半径（SPEC.md 5.1） */
const TABLE_AREA = 304;
const SEAT_RADIUS = 114;

/** 席の番号から、テーブルの上での位置（見た目の配置） */
function seatPosition(index: number) {
  const angle = -Math.PI / 2 + (index * 2 * Math.PI) / SEAT_COUNT;
  const center = TABLE_AREA / 2;
  return {
    cx: Math.round(center + SEAT_RADIUS * Math.cos(angle)),
    cy: Math.round(center + SEAT_RADIUS * Math.sin(angle)),
  };
}

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
  const seats = arrangeSeats(members);
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
  const leave = () => setJoined(false);
  const closeSheet = () => setSheet(null);

  return (
    <div className="relative mx-auto flex h-dvh w-full max-w-[430px] flex-col overflow-hidden bg-ground">
      <Header count={total} joined={joined} />

      {/* テーブル */}
      <div className="relative mx-auto mt-3 mb-7 h-[304px] w-[304px] shrink-0">
        <div className="absolute top-[76px] left-[76px] flex h-[152px] w-[152px] flex-col items-center justify-center gap-1.5 rounded-full bg-table shadow-table">
          <span className="-mb-1 font-display text-caption font-medium tracking-[0.2em] text-brand">
            集合
          </span>
          <span className="font-display text-display leading-none font-medium text-brand-deep">
            {MEETING.time}
          </span>
          <span className="rounded-full bg-surface px-3 py-0.5 text-caption font-medium text-brand">
            {MEETING.place}
          </span>
        </div>

        {seats.map(({ seat, member }) => {
          const { cx, cy } = seatPosition(seat);
          return member === null ? (
            <span
              key={seat}
              className="absolute flex h-16 w-16 items-center justify-center"
              style={{ left: cx - 32, top: cy - 32 }}
            >
              <EmptyPlate />
            </span>
          ) : (
            <SeatedMember
              key={member.id}
              seat={seat}
              member={member}
              x={cx}
              y={cy}
              onClick={
                member.isMe ? openMemo : () => setSheet({ type: "person", memberId: member.id })
              }
            />
          );
        })}
      </div>

      <MemberList members={members} />

      {/* 下のボタンの部分（画面の下に固定） */}
      <div className="flex shrink-0 flex-col gap-2 border-t border-line bg-surface px-5 pt-3 pb-6">
        {joined ? (
          <>
            <p className="anim-rise text-center font-display text-body font-medium">
              参加しました！ {MEETING.time} に {MEETING.place}へ
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={openMemo}
                className="h-12 flex-1 cursor-pointer rounded-full border-[1.5px] border-brand bg-surface text-body font-bold text-brand"
              >
                {memoButtonLabel(myMemo)}
              </button>
              <button
                type="button"
                onClick={leave}
                className="h-12 flex-1 cursor-pointer rounded-full border-[1.5px] border-leave bg-surface text-body font-bold text-ink"
              >
                参加をやめる
              </button>
            </div>
          </>
        ) : (
          <button
            type="button"
            onClick={pressJoin}
            className="anim-nudge flex h-[62px] cursor-pointer items-center justify-center gap-2.5 rounded-full bg-brand font-display text-heading font-medium text-on-brand shadow-join"
          >
            <HandIcon className="anim-wave" />
            今日のランチに参加する
          </button>
        )}
      </div>

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
            placeholder="例：4月入社です／中華の気分"
            value={draftMemo}
            onChange={setDraftMemo}
          />
          <PrimaryButton onClick={submitJoin} disabled={!nameCheck.ok || !memoCheck.ok}>
            参加する
          </PrimaryButton>
        </BottomSheet>
      )}

      {sheet?.type === "memo" && (
        <BottomSheet title="ひとこと" onClose={closeSheet}>
          <TextField
            id="my-memo"
            label="みんなに見えます（なくてもOK）"
            placeholder="例：4月入社です／中華の気分"
            value={draftMemo}
            onChange={setDraftMemo}
          />
          <PrimaryButton onClick={saveMemo} disabled={!memoCheck.ok}>
            保存する
          </PrimaryButton>
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

function SeatedMember({
  seat,
  member,
  x,
  y,
  onClick,
}: {
  seat: number;
  member: ViewMember;
  /** 席の中心 */
  x: number;
  y: number;
  onClick: () => void;
}) {
  return (
    <>
      <button
        type="button"
        aria-label={seatAriaLabel(member.name, member.isMe)}
        onClick={onClick}
        className="anim-pop absolute flex h-[78px] w-16 cursor-pointer flex-col items-center"
        style={{ left: x - 32, top: y - 36, animationDelay: member.isMe ? "0s" : `${seat * 0.08}s` }}
      >
        <span className="anim-bob block h-[58px]" style={{ animationDelay: `${seat * 0.3}s` }}>
          <Onigiri topping={member.topping} />
        </span>
        <span
          className={`mt-0.5 rounded-full px-2 text-caption font-medium ${
            member.isMe ? "bg-brand text-on-brand" : "bg-surface text-ink"
          }`}
        >
          {seatLabel(member.name, member.isMe)}
        </span>
      </button>
      {/* 参加したときの紙吹雪 */}
      {member.isMe && <Burst x={x} y={y - 8} />}
    </>
  );
}

function Header({ count, joined }: { count: number; joined: boolean }) {
  const headline = buildHeadline({ count, joined });
  return (
    <header className="flex flex-col items-center gap-2 px-5 pt-6 text-center">
      <p className="flex items-center gap-1.5 rounded-full bg-surface px-3.5 py-1 text-caption font-medium text-brand">
        <BowlIcon />
        {formatDateLabel(TODAY_KEY)}のランチ
      </p>
      {/* 必ず1行に収める。狭い画面では文字を小さくする（SPEC.md 5.1） */}
      <h1 className="font-display text-heading leading-snug font-medium whitespace-nowrap">
        {headline.number ? (
          <>
            {headline.before}{" "}
            <span className="text-title text-brand">{headline.number}</span>{" "}
            {headline.after}
          </>
        ) : (
          headline.after
        )}
      </h1>
    </header>
  );
}

function MemberList({ members }: { members: ViewMember[] }) {
  return (
    <section className="flex min-h-0 flex-1 flex-col px-5">
      <h2 className="mb-2 flex items-center gap-2 font-display text-heading font-medium">
        今日のメンバー
        <span className="rounded-full bg-brand px-2.5 font-sans text-caption text-on-brand">
          {summarizeTable(members).total}人
        </span>
      </h2>
      <ul className="min-h-0 flex-1 overflow-y-auto">
        {members.map((m) => (
          <li key={m.id} className="anim-rise flex items-start gap-2.5 py-2">
            <span className="shrink-0">
              <Onigiri topping={m.topping} size={30} variant="simple" />
            </span>
            <div className="flex min-w-0 flex-1 flex-col gap-[3px]">
              <span className="text-caption font-bold text-brand">
                {memberListName(m.name, m.isMe)}
              </span>
              {m.memo ? (
                <p className="self-start rounded-bubble rounded-tl-bubble-tail bg-surface px-3 py-[7px] text-body leading-normal shadow-bubble">
                  {memoText(m.memo)}
                </p>
              ) : (
                <span className="text-caption text-subtle">{memoText(m.memo)}</span>
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

function BottomSheet({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="absolute inset-0 z-10 flex flex-col justify-end bg-overlay">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="sheet-title"
        className="anim-rise flex flex-col gap-3 rounded-t-sheet bg-surface px-6 pt-6 pb-7"
      >
        <h2 id="sheet-title" className="font-display text-title font-medium">
          {title}
        </h2>
        {children}
        <button
          type="button"
          onClick={onClose}
          className="min-h-11 cursor-pointer text-body text-muted underline"
        >
          閉じる
        </button>
      </div>
    </div>
  );
}

function TextField({
  id,
  label,
  placeholder,
  value,
  onChange,
}: {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-body font-bold">
        {label}
      </label>
      <input
        id={id}
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-[50px] rounded-field border border-field px-3.5 text-heading text-ink outline-brand"
      />
    </div>
  );
}

function PrimaryButton({
  onClick,
  disabled,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="mt-1 h-14 cursor-pointer rounded-full bg-brand text-heading font-bold text-on-brand disabled:cursor-not-allowed disabled:opacity-45"
    >
      {children}
    </button>
  );
}
