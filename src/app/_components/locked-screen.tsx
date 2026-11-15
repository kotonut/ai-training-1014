import { LockIcon } from "./illustrations";
import { IconBadge } from "./ui/icon-badge";

// 社内の人専用の画面（SPEC.md 5.5）。参加者の情報は一切出さない。
// children にはログインのボタンなどを置く。
export function LockedScreen({
  title,
  message,
  children,
}: {
  title: string;
  message: string;
  children?: React.ReactNode;
}) {
  return (
    <main className="mx-auto flex h-dvh w-full max-w-[430px] flex-col items-center justify-center gap-5 bg-ground px-8 text-center text-ink">
      <IconBadge>
        <LockIcon />
      </IconBadge>
      <h1 className="font-display text-title leading-normal font-medium whitespace-pre-line">
        {title}
      </h1>
      <p className="text-body leading-loose text-muted">{message}</p>
      {children && <div className="flex w-full flex-col items-center gap-3">{children}</div>}
    </main>
  );
}
