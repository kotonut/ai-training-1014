import { Button } from "./button";

// 下から出てくる画面（参加する・ひとこと・人のカード）
export function BottomSheet({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="absolute inset-0 z-10 flex flex-col justify-end bg-overlay">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="sheet-title"
        className="anim-rise flex flex-col gap-3 rounded-t-sheet bg-surface px-6 pt-6 pb-7"
      >
        <h2 id="sheet-title" className="font-display text-title font-medium">
          {title}
        </h2>
        {children}
        <Button variant="link" onClick={onClose}>
          閉じる
        </Button>
      </div>
    </div>
  );
}
