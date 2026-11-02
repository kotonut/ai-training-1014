import { LockIcon } from "./illustrations";

// 社内の人専用の画面（SPEC.md 5.5）。参加者の情報は一切出さない。
export function LockedScreen({ title, message }: { title: string; message: string }) {
  return (
    <main className="mx-auto flex h-dvh w-full max-w-[430px] flex-col items-center justify-center gap-5 bg-[#f3f4f6] px-8 text-center text-[#1f2937]">
      <span className="flex h-20 w-20 items-center justify-center rounded-full bg-[#e5e7eb] text-[#374151]">
        <LockIcon />
      </span>
      <h1 className="font-display text-[22px] leading-normal font-medium whitespace-pre-line">
        {title}
      </h1>
      <p className="text-[15px] leading-loose text-[#4b5563]">{message}</p>
    </main>
  );
}
