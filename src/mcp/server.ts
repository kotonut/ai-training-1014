// 今日の一言を変える MCP サーバー（stdio）。Claude Code から使う（.mcp.json の hitokoto）。
// 起動：npx tsx mcp/server.ts
// 標準出力は MCP のやりとりに使うので、ログは console.error（標準エラー）にだけ出す。
// 一言のチェックと保存は lib/today-file.ts に任せ、ここは道具として出すだけにする。

import { McpServer } from "@modelcontextprotocol/server";
import { StdioServerTransport } from "@modelcontextprotocol/server/stdio";
import * as z from "zod/v4";
// tsx は起動したフォルダーの tsconfig.json でエイリアス（@/）を解くので、どこから起動しても動くように相対パスで書く
import { setTodayMessage, TODAY_FILE_PATH, TodayMessageError } from "../lib/today-file";

const server = new McpServer({ name: "hitokoto", version: "1.0.0" });

server.registerTool(
  "set_today_message",
  {
    description: "トップの吹き出しの『今日の一言』を変える。40文字まで",
    inputSchema: z.object({
      text: z.string().describe("新しい今日の一言（1〜40文字）"),
    }),
  },
  async ({ text }) => {
    try {
      const saved = await setTodayMessage(text);
      return { content: [{ type: "text", text: `今日の一言を「${saved}」に変えました` }] };
    } catch (error) {
      // 一言がだめなときは、理由を Claude に返す（ファイルは変わらない）
      if (error instanceof TodayMessageError) {
        return { content: [{ type: "text", text: error.message }], isError: true };
      }
      console.error("今日の一言を保存できませんでした", error);
      return {
        content: [{ type: "text", text: "今日の一言を保存できませんでした" }],
        isError: true,
      };
    }
  },
);

async function main() {
  await server.connect(new StdioServerTransport());
  console.error(`hitokoto を起動しました（保存先：${TODAY_FILE_PATH}）`);
}

main().catch((error: unknown) => {
  console.error("hitokoto を起動できませんでした", error);
  process.exit(1);
});
