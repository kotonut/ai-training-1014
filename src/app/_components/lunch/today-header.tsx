import { formatDateLabel } from "@/lib/date";
import { buildHeadline } from "@/lib/headline";
import { BowlIcon } from "../illustrations";
import { Tag } from "../ui/tag";

// 画面の上：日付の札と、見出しの一文（SPEC.md 5.1）
export function TodayHeader({
  dateKey,
  count,
  joined,
}: {
  dateKey: string;
  count: number;
  joined: boolean;
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
    </header>
  );
}
