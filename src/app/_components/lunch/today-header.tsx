import { formatDateLabel } from "@/lib/date";
import { buildHeadline } from "@/lib/headline";
import { BowlIcon, Onigiri } from "../illustrations";
import { SpeechBubble } from "../ui/speech-bubble";
import { Tag } from "../ui/tag";

// 画面の上：日付の札と、見出しの一文と、今日の一言（SPEC.md 5.1）
export function TodayHeader({
  dateKey,
  count,
  joined,
  message,
}: {
  dateKey: string;
  count: number;
  joined: boolean;
  /** 今日の一言（lib/today.ts）。null のときは出さない */
  message: string | null;
}) {
  const headline = buildHeadline({ count, joined });
  return (
    <header className="flex flex-col items-center gap-2 px-5 pt-6 text-center">
      <Tag>
        <BowlIcon />
        {formatDateLabel(dateKey)}のランチ
      </Tag>
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
      {/* 今日の一言：おにぎりがしゃべっているように見せる。見出しと違い折り返し、行の長さをそろえる */}
      {message && (
        <div className="flex max-w-80 items-start gap-2 text-left text-balance wrap-break-word">
          <span className="shrink-0">
            <Onigiri topping="ume" size={30} variant="simple" />
          </span>
          <SpeechBubble>{message}</SpeechBubble>
        </div>
      )}
    </header>
  );
}
