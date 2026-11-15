// 見出しつきの入力欄。error があれば、欄の下に出して読み上げにも伝える
export function TextField({
  id,
  label,
  placeholder,
  value,
  onChange,
  error,
}: {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  error?: string | null;
}) {
  const errorId = `${id}-error`;
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-body font-bold">
        {label}
      </label>
      <input
        id={id}
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className="h-[50px] rounded-field border border-field px-3.5 text-heading text-ink outline-brand"
      />
      {error && (
        <p id={errorId} className="text-caption text-muted">
          {error}
        </p>
      )}
    </div>
  );
}
