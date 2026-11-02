// Stop フック：回答の最後にテストを実行し、失敗したら結果を Claude に渡して修正させる。
// 止めるのは連続1回まで（stop_hook_active が true のときは止めない）。
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";

let input = {};
try {
  input = JSON.parse(readFileSync(0, "utf8") || "{}");
} catch {
  // 入力が読めなくてもテストは実行する
}

// すでにこのフックで1回止めて続けている途中なら、もう止めない
if (input.stop_hook_active) process.exit(0);

// `npm run test` は監視モードで終わらないため、1回だけ実行する test:run を使う
const result = spawnSync("npm", ["run", "test:run"], {
  cwd: process.env.CLAUDE_PROJECT_DIR || process.cwd(),
  encoding: "utf8",
  env: { ...process.env, CI: "1", FORCE_COLOR: "0" },
});

if (result.status === 0) process.exit(0);

const output = `${result.stdout ?? ""}${result.stderr ?? ""}`.replace(
  /\u001b\[[0-9;]*m/g,
  "",
);
const MAX = 8000;
const tail = output.length > MAX ? `…(省略)…\n${output.slice(-MAX)}` : output;

console.log(
  JSON.stringify({
    decision: "block",
    reason: `npm run test:run が失敗しました。次の結果を読んで、テストが通るように修正してください。\n\n${tail}`,
  }),
);
process.exit(0);
