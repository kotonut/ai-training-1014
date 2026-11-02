"use client";

import { useState, type CSSProperties } from "react";
import {
  MEETING,
  MY_TOPPING,
  SEAT_COUNT,
  TODAY_LABEL,
  type Member,
} from "@/app/_lib/dummy-data";
import { BowlIcon, EmptyPlate, HandIcon, Onigiri } from "./illustrations";

// 画面のたたき台：見た目と画面の移り変わりだけ。
// 保存・入力チェック・リアルタイム更新などは SPEC.md に沿って後で作る。

type Sheet =
  | { type: "join" }
  | { type: "memo" }
  | { type: "person"; memberId: string }
  | null;

type Seat =
  | { kind: "empty"; index: number; x: number; y: number }
  | { kind: "member"; index: number; x: number; y: number; member: Member; isMe: boolean };

/** テーブルの大きさと、席を並べる円の半径（SPEC.md 5.1） */
const TABLE_AREA = 304;
const SEAT_RADIUS = 114;

function seatPosition(index: number) {
  const angle = -Math.PI / 2 + (index * 2 * Math.PI) / SEAT_COUNT;
  const center = TABLE_AREA / 2;
  return {
    cx: Math.round(center + SEAT_RADIUS * Math.cos(angle)),
    cy: Math.round(center + SEAT_RADIUS * Math.sin(angle)),
  };
}

export function LunchApp({ initialMembers }: { initialMembers: Member[] }) {
  const [myName, setMyName] = useState<string | null>(null);
  const [joined, setJoined] = useState(false);
  const [myMemo, setMyMemo] = useState("");
  const [sheet, setSheet] = useState<Sheet>(null);
  const [draftName, setDraftName] = useState("");
  const [draftMemo, setDraftMemo] = useState("");

  // 自分の席：空いている席のうち番号のいちばん小さい席（SPEC.md 6.3）
  const usedSeats = new Set(initialMembers.map((m) => m.seat));
  const mySeat = joined
    ? Array.from({ length: SEAT_COUNT }, (_, i) => i).find((i) => !usedSeats.has(i)) ?? -1
    : -1;

  const me: Member | null =
    joined && myName
      ? { id: "me", name: myName, memo: myMemo, topping: MY_TOPPING, seat: mySeat }
      : null;
  const members = me ? [...initialMembers, me] : initialMembers;

  const seats: Seat[] = Array.from({ length: SEAT_COUNT }, (_, index) => {
    const { cx, cy } = seatPosition(index);
    const member = members.find((m) => m.seat === index);
    return member
      ? { kind: "member", index, x: cx - 32, y: cy - 36, member, isMe: member.id === "me" }
      : { kind: "empty", index, x: cx - 32, y: cy - 32 };
  });

  const viewedMember =
    sheet?.type === "person" ? initialMembers.find((m) => m.id === sheet.memberId) : undefined;

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
    setMyName(draftName);
    setMyMemo(draftMemo);
    setJoined(true);
    setSheet(null);
  };
  const openMemo = () => {
    setDraftMemo(myMemo);
    setSheet({ type: "memo" });
  };
  const saveMemo = () => {
    setMyMemo(draftMemo);
    setSheet(null);
  };
  const leave = () => setJoined(false);
  const closeSheet = () => setSheet(null);

  const myPosition = mySeat >= 0 ? seatPosition(mySeat) : null;

  return (
    <div className="relative mx-auto flex h-dvh w-full max-w-[430px] flex-col overflow-hidden bg-ground">
      <Header count={members.length} joined={joined} />

      {/* テーブル */}
      <div className="relative mx-auto mt-3 mb-7 h-[304px] w-[304px] shrink-0">
        <div className="absolute top-[76px] left-[76px] flex h-[152px] w-[152px] flex-col items-center justify-center gap-1.5 rounded-full bg-table shadow-[0_7px_0_var(--color-table-edge)]">
          <span className="-mb-1 font-display text-[13px] font-medium tracking-[0.2em] text-brand">
            集合
          </span>
          <span className="font-display text-[40px] leading-none font-medium text-brand-deep">
            {MEETING.time}
          </span>
          <span className="rounded-full bg-white px-3 py-0.5 text-[13px] font-medium text-brand">
            {MEETING.place}
          </span>
        </div>

        {seats.map((seat) =>
          seat.kind === "empty" ? (
            <span
              key={seat.index}
              className="absolute flex h-16 w-16 items-center justify-center"
              style={{ left: seat.x, top: seat.y }}
            >
              <EmptyPlate />
            </span>
          ) : (
            <button
              key={seat.member.id}
              type="button"
              aria-label={
                seat.isMe
                  ? "あなた。タップしてひとことを書く"
                  : `${seat.member.name}さん。タップしてひとことを見る`
              }
              onClick={
                seat.isMe
                  ? openMemo
                  : () => setSheet({ type: "person", memberId: seat.member.id })
              }
              className="anim-pop absolute flex h-[78px] w-16 cursor-pointer flex-col items-center"
              style={{ left: seat.x, top: seat.y, animationDelay: seat.isMe ? "0s" : `${seat.index * 0.08}s` }}
            >
              <span className="anim-bob block h-[58px]" style={{ animationDelay: `${seat.index * 0.3}s` }}>
                <Onigiri topping={seat.member.topping} />
              </span>
              <span
                className={`mt-0.5 rounded-full px-2 text-xs font-medium ${
                  seat.isMe ? "bg-brand text-white" : "bg-white text-ink"
                }`}
              >
                {seat.isMe ? "あなた" : seat.member.name.split(" ")[0]}
              </span>
            </button>
          ),
        )}

        {/* 参加したときの紙吹雪 */}
        {myPosition && <Burst key={mySeat} x={myPosition.cx} y={myPosition.cy - 8} />}
      </div>

      <MemberList members={members} />

      {/* 下のボタンの部分（画面の下に固定） */}
      <div className="flex shrink-0 flex-col gap-2 border-t border-line bg-white px-5 pt-3 pb-6">
        {joined ? (
          <>
            <p className="anim-rise text-center font-display text-base font-medium">
              参加しました！ {MEETING.time} に {MEETING.place}へ
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={openMemo}
                className="h-12 flex-1 cursor-pointer rounded-full border-[1.5px] border-brand bg-white text-[15px] font-bold text-brand"
              >
                {myMemo ? "ひとことを変える" : "ひとことを書く"}
              </button>
              <button
                type="button"
                onClick={leave}
                className="h-12 flex-1 cursor-pointer rounded-full border-[1.5px] border-leave bg-white text-[15px] font-bold text-ink"
              >
                参加をやめる
              </button>
            </div>
          </>
        ) : (
          <button
            type="button"
            onClick={pressJoin}
            className="anim-nudge flex h-[62px] cursor-pointer items-center justify-center gap-2.5 rounded-full bg-brand font-display text-[19px] font-medium text-white shadow-[0_6px_16px_rgba(47,93,80,0.28)]"
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
          <PrimaryButton onClick={submitJoin} disabled={draftName.trim() === ""}>
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
          <PrimaryButton onClick={saveMemo}>保存する</PrimaryButton>
        </BottomSheet>
      )}

      {sheet?.type === "person" && viewedMember && (
        <BottomSheet title={viewedMember.name} onClose={closeSheet}>
          <p className="text-base leading-relaxed">
            {viewedMember.memo || "ひとことはありません"}
          </p>
        </BottomSheet>
      )}
    </div>
  );
}

function Header({ count, joined }: { count: number; joined: boolean }) {
  return (
    <header className="flex flex-col items-center gap-2 px-5 pt-6 text-center">
      <p className="flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1 text-[13px] font-medium text-brand">
        <BowlIcon />
        {TODAY_LABEL}のランチ
      </p>
      {/* 必ず1行に収める。狭い画面では文字を小さくする（SPEC.md 5.1） */}
      <h1 className="font-display text-[clamp(15px,4.9vw,19px)] leading-snug font-medium whitespace-nowrap">
        {count === 0 ? (
          "一番乗りしませんか？"
        ) : (
          <>
            今日は{" "}
            <span className="text-[clamp(24px,7.7vw,30px)] text-brand">{count}人</span>{" "}
            {joined ? "でランチ！" : "がランチに行きたい！"}
          </>
        )}
      </h1>
    </header>
  );
}

function MemberList({ members }: { members: Member[] }) {
  return (
    <section className="flex min-h-0 flex-1 flex-col px-5">
      <h2 className="mb-2 flex items-center gap-2 font-display text-[17px] font-medium">
        今日のメンバー
        <span className="rounded-full bg-brand px-2.5 font-sans text-[13px] text-white">
          {members.length}人
        </span>
      </h2>
      <ul className="min-h-0 flex-1 overflow-y-auto">
        {members.map((m) => (
          <li key={m.id} className="anim-rise flex items-start gap-2.5 py-2">
            <span className="shrink-0">
              <Onigiri topping={m.topping} size={30} variant="simple" />
            </span>
            <div className="flex min-w-0 flex-1 flex-col gap-[3px]">
              <span className="text-[13px] font-bold text-brand">
                {m.id === "me" ? `${m.name}（あなた）` : m.name}
              </span>
              {m.memo ? (
                <p className="self-start rounded-[4px_14px_14px_14px] bg-white px-3 py-[7px] text-sm leading-normal shadow-[0_1px_0_#d6e2db]">
                  {m.memo}
                </p>
              ) : (
                <span className="text-xs text-subtle">ひとことはまだありません</span>
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Burst({ x, y }: { x: number; y: number }) {
  const dots = [
    { dx: 0, dy: -46, color: "#e9b949", size: 8 },
    { dx: 40, dy: -24, color: "#e27d7a", size: 7 },
    { dx: 40, dy: 24, color: "#6fae92", size: 8 },
    { dx: 0, dy: 46, color: "#ef9f6e", size: 7 },
    { dx: -40, dy: 24, color: "#e9b949", size: 8 },
    { dx: -40, dy: -24, color: "#e27d7a", size: 7 },
  ];
  return (
    <span aria-hidden="true" className="absolute h-0 w-0" style={{ left: x, top: y }}>
      {dots.map((d, i) => (
        <span
          key={i}
          className="anim-burst absolute rounded-full"
          style={
            {
              width: d.size,
              height: d.size,
              background: d.color,
              "--dx": `${d.dx}px`,
              "--dy": `${d.dy}px`,
            } as CSSProperties
          }
        />
      ))}
    </span>
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
    <div className="absolute inset-0 z-10 flex flex-col justify-end bg-[rgba(15,25,22,0.45)]">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="sheet-title"
        className="anim-rise flex flex-col gap-3 rounded-t-[22px] bg-white px-6 pt-6 pb-7"
      >
        <h2 id="sheet-title" className="font-display text-[21px] font-medium">
          {title}
        </h2>
        {children}
        <button
          type="button"
          onClick={onClose}
          className="min-h-11 cursor-pointer text-[15px] text-muted underline"
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
      <label htmlFor={id} className="text-sm font-bold">
        {label}
      </label>
      <input
        id={id}
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-[50px] rounded-[10px] border border-field px-3.5 text-[17px] text-ink outline-brand"
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
      className="mt-1 h-14 cursor-pointer rounded-full bg-brand text-[17px] font-bold text-white disabled:cursor-not-allowed disabled:opacity-45"
    >
      {children}
    </button>
  );
}
