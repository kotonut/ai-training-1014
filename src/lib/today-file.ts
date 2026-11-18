// 今日の一言を data/today.json に書く（SPEC.md 6.4）。MCP サーバー（mcp/server.ts）から使う。
// node:fs を使うので、画面からは読み込まない（画面は lib/today.ts だけを使う）。

import { randomUUID } from "node:crypto";
import { rename, rm, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { todayMessageErrorText, validateTodayMessage } from "./today";

/** 保存先。このファイルの場所を基準にするので、どこから起動しても同じファイルになる */
export const TODAY_FILE_PATH = fileURLToPath(new URL("../data/today.json", import.meta.url));

/** 一言が空・長すぎるなど、保存できない一言を渡したときのエラー */
export class TodayMessageError extends Error {
  constructor(readonly reason: "empty" | "tooLong") {
    super(todayMessageErrorText(reason));
    this.name = "TodayMessageError";
  }
}

/**
 * 今日の一言を確かめてから保存し、保存した一言を返す。
 * 空・41文字以上のときは TodayMessageError を投げ、ファイルは変えない。
 * 一時ファイルに書いてから置き換えるので、途中まで書かれたファイルが読まれることはない。
 * @param filePath 保存先。テストでは一時フォルダーのファイルを渡す
 */
export async function setTodayMessage(
  text: string,
  filePath: string = TODAY_FILE_PATH,
): Promise<string> {
  const result = validateTodayMessage(text);
  if (!result.ok) throw new TodayMessageError(result.reason);

  const tempPath = `${filePath}.${randomUUID()}.tmp`;
  try {
    await writeFile(tempPath, `${JSON.stringify({ text: result.value }, null, 2)}\n`, "utf8");
    await rename(tempPath, filePath);
  } catch (error) {
    await rm(tempPath, { force: true });
    throw error;
  }
  return result.value;
}
