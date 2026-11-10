// 画面で使う絵（おにぎり、お皿、紙吹雪、アイコン）。絵の色はこのファイルの中だけで使うので、globals.css ではなくここにまとめる

import type { CSSProperties } from "react";
import type { Topping } from "@/lib/members";

const COLORS = {
  rice: "#fff", // おにぎりのご飯
  riceEdge: "#e2dbcf", // ご飯の輪郭
  dark: "#2b3a35", // 海苔と、目・口
  cheek: "#f3afa6", // ほっぺ
  shadow: "rgb(0 0 0 / 0.08)", // おにぎりの足元の影
  plate: "#fff", // お皿
  plateEdge: "#d3ded8", // お皿の縁とお箸
  plateInner: "#e5ece8", // お皿の内側の線
  confetti: ["#e9b949", "#e27d7a", "#6fae92", "#ef9f6e"], // 紙吹雪
  // おにぎりの具（くすませて強さをそろえる）。自分（mine）は落ち着いた緑
  topping: { ume: "#e27d7a", sake: "#ef9f6e", tamago: "#e9b949", mine: "#6fae92" },
} as const;

type OnigiriProps = {
  topping: Topping;
  size?: number;
  /** "full" は顔（ほっぺ・口）と影つき。"simple" は一覧用の小さい絵 */
  variant?: "full" | "simple";
};

const ONIGIRI_PATH =
  "M30 6C36 6 40 12 46 22C52 32 56 40 54 46C52 53 44 55 30 55C16 55 8 53 6 46C4 40 8 32 14 22C20 12 24 6 30 6Z";

export function Onigiri({ topping, size = 58, variant = "full" }: OnigiriProps) {
  const full = variant === "full";
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" aria-hidden="true">
      {full && <ellipse cx="30" cy="56" rx="16" ry="3" fill={COLORS.shadow} />}
      <path d={ONIGIRI_PATH} fill={COLORS.rice} stroke={COLORS.riceEdge} strokeWidth={full ? 2 : 3} />
      <ellipse cx="30" cy="14" rx="6" ry="4.5" fill={COLORS.topping[topping]} />
      <rect x="17" y="39" width="26" height="16" rx="3" fill={COLORS.dark} />
      <circle cx="23" cy="29" r={full ? 2.3 : 2.6} fill={COLORS.dark} />
      <circle cx="37" cy="29" r={full ? 2.3 : 2.6} fill={COLORS.dark} />
      {full && (
        <>
          <ellipse cx="18.5" cy="34" rx="3.5" ry="2.2" fill={COLORS.cheek} opacity="0.75" />
          <ellipse cx="41.5" cy="34" rx="3.5" ry="2.2" fill={COLORS.cheek} opacity="0.75" />
          <path
            d="M27 33q3 3 6 0"
            stroke={COLORS.dark}
            strokeWidth="1.8"
            fill="none"
            strokeLinecap="round"
          />
        </>
      )}
    </svg>
  );
}

/** 空いている席：お箸を添えた空のお皿 */
export function EmptyPlate() {
  return (
    <svg width="48" height="48" viewBox="0 0 60 60" fill="none" aria-hidden="true">
      <ellipse cx="28" cy="34" rx="22" ry="14" fill={COLORS.plate} stroke={COLORS.plateEdge} strokeWidth="2" />
      <ellipse cx="28" cy="34" rx="13" ry="7.5" stroke={COLORS.plateInner} strokeWidth="2" />
      <path
        d="M50 12l6 30M45 13l6 30"
        stroke={COLORS.plateEdge}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** 日付の札のお茶碗とお箸 */
export function BowlIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4 12h16a8 8 0 0 1-16 0z" />
      <path d="M15 3l-3 7M19 4l-5 6" />
    </svg>
  );
}

/** 参加ボタンの、手を振る手 */
export function HandIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="26"
      height="26"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M8 13V5.5a1.5 1.5 0 0 1 3 0V11" />
      <path d="M11 10.5V4a1.5 1.5 0 0 1 3 0v6.5" />
      <path d="M14 10.5V5.5a1.5 1.5 0 0 1 3 0V14" />
      <path d="M17 9.5a1.5 1.5 0 0 1 3 0V15a6 6 0 0 1-6 6h-1.5a6 6 0 0 1-4.6-2.2L4.5 15.5a1.6 1.6 0 0 1 2.4-2.1L8 14.5" />
    </svg>
  );
}

/** 社内の人専用の画面の鍵 */
export function LockIcon() {
  return (
    <svg
      width="38"
      height="38"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

/** 参加したときの紙吹雪。x, y は弾ける中心 */
export function Burst({ x, y }: { x: number; y: number }) {
  const [c1, c2, c3, c4] = COLORS.confetti;
  const dots = [
    { dx: 0, dy: -46, color: c1, size: 8 },
    { dx: 40, dy: -24, color: c2, size: 7 },
    { dx: 40, dy: 24, color: c3, size: 8 },
    { dx: 0, dy: 46, color: c4, size: 7 },
    { dx: -40, dy: 24, color: c1, size: 8 },
    { dx: -40, dy: -24, color: c2, size: 7 },
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
