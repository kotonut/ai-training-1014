const profile = [
  { label: "名前", value: "吉田 琴乃" },
  { label: "所属", value: "株式会社HRTheory" },
  { label: "趣味", value: "犬と散歩" },
  { label: "ペット", value: "コーギー（4歳）" },
];

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex w-full max-w-2xl flex-col gap-10 py-24 px-8 sm:px-16">
        <header className="flex flex-col gap-3">
          <p className="text-sm font-medium tracking-widest text-zinc-500 dark:text-zinc-400">
            自己紹介
          </p>
          <h1 className="text-4xl font-semibold tracking-tight text-black dark:text-zinc-50">
            吉田 琴乃
          </h1>
          <p className="text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            株式会社HRTheoryに所属しています。休日はコーギーと一緒に散歩するのが楽しみです。
          </p>
        </header>

        <dl className="divide-y divide-black/[.08] rounded-2xl border border-black/[.08] bg-white dark:divide-white/[.145] dark:border-white/[.145] dark:bg-zinc-950">
          {profile.map(({ label, value }) => (
            <div key={label} className="flex flex-col gap-1 px-6 py-4 sm:flex-row sm:gap-6">
              <dt className="w-24 shrink-0 text-sm font-medium text-zinc-500 dark:text-zinc-400">
                {label}
              </dt>
              <dd className="text-base text-black dark:text-zinc-50">{value}</dd>
            </div>
          ))}
        </dl>
      </main>
    </div>
  );
}
