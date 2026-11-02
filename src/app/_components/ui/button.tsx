// ボタン。見た目は variant で選ぶ

type ButtonProps = {
  /**
   * cta：参加ボタン（画面でいちばん目立つ。brand の塗りはこれと primary だけ）
   * primary：下から出てくる画面の決定ボタン
   * secondary：緑の枠のボタン（ひとことを書く）
   * subtle：灰色の枠のボタン（参加をやめる）
   * link：下線の文字だけのボタン（閉じる）
   */
  variant: "cta" | "primary" | "secondary" | "subtle" | "link";
  onClick: () => void;
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
};

const VARIANTS = {
  cta: "anim-nudge flex h-[62px] items-center justify-center gap-2.5 rounded-full bg-brand font-display text-heading font-medium text-on-brand shadow-join",
  primary: "h-14 rounded-full bg-brand text-heading font-bold text-on-brand",
  secondary: "h-12 rounded-full border-[1.5px] border-brand bg-surface text-body font-bold text-brand",
  subtle: "h-12 rounded-full border-[1.5px] border-leave bg-surface text-body font-bold text-ink",
  link: "min-h-11 text-body text-muted underline",
} as const;

export function Button({ variant, onClick, disabled, className = "", children }: ButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`cursor-pointer disabled:cursor-not-allowed disabled:opacity-45 ${VARIANTS[variant]} ${className}`}
    >
      {children}
    </button>
  );
}
