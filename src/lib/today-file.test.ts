import { mkdtemp, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { getTodayMessage } from "@/lib/today";
import { setTodayMessage, TODAY_FILE_PATH, TodayMessageError } from "@/lib/today-file";

// SPEC.md 6.4。本物の data/today.json は書き換えず、一時フォルダーのファイルで確かめる

let dir: string;
let file: string;
const ORIGINAL = `${JSON.stringify({ text: "もとの一言" }, null, 2)}\n`;

beforeEach(async () => {
  dir = await mkdtemp(path.join(tmpdir(), "today-"));
  file = path.join(dir, "today.json");
  await writeFile(file, ORIGINAL, "utf8");
});

afterEach(async () => {
  await rm(dir, { recursive: true, force: true });
});

const readJson = async () => JSON.parse(await readFile(file, "utf8")) as unknown;

describe("setTodayMessage：一言を保存する", () => {
  test("{ text } の形で保存し、保存した一言を返す", async () => {
    await expect(setTodayMessage("寒いので鍋の気分", file)).resolves.toBe("寒いので鍋の気分");
    expect(await readJson()).toEqual({ text: "寒いので鍋の気分" });
  });

  test("保存した一言は getTodayMessage でそのまま読める", async () => {
    await setTodayMessage("<b>カレー</b> & ラーメン", file);
    expect(getTodayMessage(await readJson())).toBe("<b>カレー</b> & ラーメン");
  });

  test("前後の空白を取り、途中の改行を空白1つにして保存する", async () => {
    await setTodayMessage("　今日も\n\nいい一日を ", file);
    expect(await readJson()).toEqual({ text: "今日も いい一日を" });
  });

  test("40文字ちょうどは保存できる", async () => {
    const text = "あ".repeat(40);
    await setTodayMessage(text, file);
    expect(await readJson()).toEqual({ text });
  });

  test("一時ファイルを残さない", async () => {
    await setTodayMessage("今日も", file);
    expect(await readdir(dir)).toEqual(["today.json"]);
  });
});

describe("setTodayMessage：保存できない一言", () => {
  test.each([
    ["空", "", "empty"],
    ["空白だけ", " 　\n", "empty"],
    ["41文字", "あ".repeat(41), "tooLong"],
  ])("%sのときは TodayMessageError を投げ、ファイルは変えない", async (_, text, reason) => {
    const error = await setTodayMessage(text, file).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(TodayMessageError);
    expect((error as TodayMessageError).reason).toBe(reason);
    expect(await readFile(file, "utf8")).toBe(ORIGINAL);
    expect(await readdir(dir)).toEqual(["today.json"]);
  });

  test("エラーの文は理由を伝える", async () => {
    await expect(setTodayMessage("あ".repeat(41), file)).rejects.toThrow(
      "一言は40文字までにしてください",
    );
  });
});

describe("TODAY_FILE_PATH：保存先", () => {
  test("プロジェクトの data/today.json を指す（起動したフォルダーに関係なく）", () => {
    const projectRoot = path.resolve(import.meta.dirname, "..");
    expect(TODAY_FILE_PATH).toBe(path.join(projectRoot, "data", "today.json"));
  });
});
