import { memberListName, memoText } from "@/lib/labels";
import { summarizeTable, type ViewMember } from "@/lib/members";
import { Onigiri } from "../illustrations";
import { SpeechBubble } from "../ui/speech-bubble";
import { Tag } from "../ui/tag";

// 今日のメンバー（SPEC.md 5.1）。人数が多いときは、この部分だけスクロールする
export function MemberList({ members }: { members: ViewMember[] }) {
  return (
    <section className="flex min-h-0 flex-1 flex-col px-5">
      <h2 className="mb-2 flex items-center gap-2 font-display text-heading font-medium">
        今日のメンバー
        <Tag tone="solid">{summarizeTable(members).total}人</Tag>
      </h2>
      <ul className="min-h-0 flex-1 overflow-y-auto">
        {members.map((m) => (
          <MemberRow key={m.id} member={m} />
        ))}
      </ul>
    </section>
  );
}

/** 一人分：小さなおにぎり・名前・ひとこと */
function MemberRow({ member }: { member: ViewMember }) {
  return (
    <li className="anim-rise flex items-start gap-2.5 py-2">
      <span className="shrink-0">
        <Onigiri topping={member.topping} size={30} variant="simple" />
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-[3px]">
        <span className="text-caption font-bold text-brand">
          {memberListName(member.name, member.isMe)}
        </span>
        {member.memo ? (
          <SpeechBubble>{memoText(member.memo)}</SpeechBubble>
        ) : (
          <span className="text-caption text-subtle">{memoText(member.memo)}</span>
        )}
      </div>
    </li>
  );
}
