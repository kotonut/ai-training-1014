// ひとことの吹き出し。左上の角だけ小さくして、左の人がしゃべっているように見せる
export function SpeechBubble({ children }: { children: React.ReactNode }) {
  return (
    <p className="self-start rounded-bubble rounded-tl-bubble-tail bg-surface px-3 py-[7px] text-body leading-normal shadow-bubble">
      {children}
    </p>
  );
}
