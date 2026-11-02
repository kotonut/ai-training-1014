import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

// Next.js の公式ガイド（01-app/02-guides/testing/vitest.md）をもとにした設定。
// テストするのは lib/ の関数だけ。画面を操作するテストは作らないので、
// ガイドにある React のプラグインと jsdom は使わず、Node.js の環境で動かす。
export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: "node",
    include: ["lib/**/*.test.ts"],
    // まだテストがなくても、エラーにしない
    passWithNoTests: true,
  },
});
