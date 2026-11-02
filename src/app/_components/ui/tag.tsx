// 丸い札（日付・集合場所・名札・人数）

type TagProps = {
  /** brand：白地に緑の文字 / ink：白地に黒の文字 / solid：緑地に白の文字 */
  tone?: "brand" | "ink" | "solid";
  /** sm：おにぎりの下の名札など、幅の狭いところ用 */
  size?: "sm" | "md";
  className?: string;
  children: React.ReactNode;
};

const TONES = {
  brand: "bg-surface text-brand",
  ink: "bg-surface text-ink",
  solid: "bg-brand text-on-brand",
} as const;

const SIZES = {
  sm: "px-2",
  md: "px-3 py-0.5",
} as const;

export function Tag({ tone = "brand", size = "md", className = "", children }: TagProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-sans text-caption font-medium ${TONES[tone]} ${SIZES[size]} ${className}`}
    >
      {children}
    </span>
  );
}
