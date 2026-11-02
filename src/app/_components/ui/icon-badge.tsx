// 丸の中にアイコンを置いた印（社内の人専用の画面の鍵）
export function IconBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="flex h-20 w-20 items-center justify-center rounded-full bg-surface">
      {children}
    </span>
  );
}
