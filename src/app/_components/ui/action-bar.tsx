// 画面の下に固定する、ボタンの部分
export function ActionBar({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex shrink-0 flex-col gap-2 border-t border-line bg-surface px-5 pt-3 pb-6">
      {children}
    </div>
  );
}
