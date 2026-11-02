// 画面で使う絵（おにぎり、お皿、アイコン）

type OnigiriProps = {
  topping: string;
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
      {full && <ellipse cx="30" cy="56" rx="16" ry="3" fill="#000" opacity="0.08" />}
      <path d={ONIGIRI_PATH} fill="#fff" stroke="#e2dbcf" strokeWidth={full ? 2 : 3} />
      <ellipse cx="30" cy="14" rx="6" ry="4.5" fill={topping} />
      <rect x="17" y="39" width="26" height="16" rx="3" fill="#2b3a35" />
      <circle cx="23" cy="29" r={full ? 2.3 : 2.6} fill="#2b2b2b" />
      <circle cx="37" cy="29" r={full ? 2.3 : 2.6} fill="#2b2b2b" />
      {full && (
        <>
          <ellipse cx="18.5" cy="34" rx="3.5" ry="2.2" fill="#f3afa6" opacity="0.75" />
          <ellipse cx="41.5" cy="34" rx="3.5" ry="2.2" fill="#f3afa6" opacity="0.75" />
          <path
            d="M27 33q3 3 6 0"
            stroke="#2b2b2b"
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
      <ellipse cx="28" cy="34" rx="22" ry="14" fill="#fff" stroke="#d3ded8" strokeWidth="2" />
      <ellipse cx="28" cy="34" rx="13" ry="7.5" stroke="#e5ece8" strokeWidth="2" />
      <path
        d="M50 12l6 30M45 13l6 30"
        stroke="#d3ded8"
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
