import { seatAriaLabel, seatLabel } from "@/lib/labels";
import { SEAT_COUNT, arrangeSeats, displayTopping, type ViewMember } from "@/lib/members";
import { Burst, EmptyPlate, Onigiri } from "../illustrations";
import { Tag } from "../ui/tag";

// テーブル：真ん中に集合時刻と場所、周りに8つの席（SPEC.md 5.1）

/** テーブルの大きさと、席を並べる円の半径 */
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

export function LunchTable({
  members,
  meeting,
  onSelect,
}: {
  members: ViewMember[];
  meeting: { time: string; place: string };
  /** おにぎりをタップしたとき */
  onSelect: (member: ViewMember) => void;
}) {
  return (
    <div className="relative mx-auto mt-3 mb-7 h-[304px] w-[304px] shrink-0">
      <MeetingSpot time={meeting.time} place={meeting.place} />
      {arrangeSeats(members).map(({ seat, member }) => {
        const { cx, cy } = seatPosition(seat);
        return member === null ? (
          <EmptySeat key={seat} x={cx} y={cy} />
        ) : (
          <SeatedMember
            key={member.id}
            seat={seat}
            member={member}
            x={cx}
            y={cy}
            onClick={() => onSelect(member)}
          />
        );
      })}
    </div>
  );
}

/** テーブルの真ん中：「集合」・時刻・場所 */
function MeetingSpot({ time, place }: { time: string; place: string }) {
  return (
    <div className="absolute top-[76px] left-[76px] flex h-[152px] w-[152px] flex-col items-center justify-center gap-1.5 rounded-full bg-table shadow-table">
      <span className="-mb-1 font-display text-caption font-medium tracking-[0.2em] text-brand">
        集合
      </span>
      <span className="font-display text-display leading-none font-medium text-brand-deep">
        {time}
      </span>
      <Tag>{place}</Tag>
    </div>
  );
}

/** 空いている席：お皿。押せない。x, y は席の中心 */
function EmptySeat({ x, y }: { x: number; y: number }) {
  return (
    <span
      className="absolute flex h-16 w-16 items-center justify-center"
      style={{ left: x - 32, top: y - 32 }}
    >
      <EmptyPlate />
    </span>
  );
}

/** 参加している人：おにぎりと名札。自分には紙吹雪。x, y は席の中心 */
function SeatedMember({
  seat,
  member,
  x,
  y,
  onClick,
}: {
  seat: number;
  member: ViewMember;
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
          <Onigiri topping={displayTopping(member, member.isMe)} />
        </span>
        <Tag tone={member.isMe ? "solid" : "ink"} size="sm" className="mt-0.5">
          {seatLabel(member.name, member.isMe)}
        </Tag>
      </button>
      {member.isMe && <Burst x={x} y={y - 8} />}
    </>
  );
}
