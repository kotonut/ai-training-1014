// デスクに置く QR コード（印刷用の SVG）を書き出す。
// 使い方: npx tsx scripts/make-qr.ts <アプリの URL>
// 書き出す先: qr/lunch-qr.svg（どこから起動しても、プロジェクトの qr/ に置く）
// URL には合言葉などを付けず、そのまま QR にする（SPEC.md 6.1）。毎日同じ QR を使う。

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import QRCode from "qrcode";

const USAGE = "使い方: npx tsx scripts/make-qr.ts <アプリの URL>（例: https://example.com）";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outFile = path.join(projectRoot, "qr", "lunch-qr.svg");

function fail(message: string): never {
  console.error(`エラー: ${message}`);
  console.error(USAGE);
  process.exit(1);
}

function parseUrl(arg: string | undefined): string {
  if (!arg) fail("URL が渡されていません。");
  let url: URL;
  try {
    url = new URL(arg);
  } catch {
    fail(`URL として読めません: ${arg}`);
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") {
    fail(`http:// か https:// で始まる URL を渡してください: ${arg}`);
  }
  // 渡された文字をそのまま使う（new URL で書き換えると、末尾に「/」が付くなどして渡した URL と変わるため）
  return arg;
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length > 1) fail("URL は1つだけ渡してください。");
  const url = parseUrl(args[0]);

  const svg = await QRCode.toString(url, {
    type: "svg",
    // 印刷して机に置くので、少し汚れても読めるように誤り訂正は M（約15%）にする
    errorCorrectionLevel: "M",
    // まわりの余白（クワイエットゾーン）は規格どおり 4 マス
    margin: 4,
    color: { dark: "#000000", light: "#ffffff" },
  });

  await mkdir(path.dirname(outFile), { recursive: true });
  await writeFile(outFile, svg, "utf8");
  console.log(`QR コードを書き出しました: ${path.relative(process.cwd(), outFile) || outFile}`);
  console.log(`中身の URL: ${url}`);
}

main().catch((error: unknown) => {
  console.error("エラー: QR コードを書き出せませんでした。");
  console.error(error);
  process.exit(1);
});
