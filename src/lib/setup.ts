// アプリを動かすのに必要な設定（.env.local）がそろっているか

import { getCompanyDomain } from "@/lib/account";
import { readFirebaseOptions } from "@/lib/firebase";

/**
 * 設定に足りないものがあれば、その説明（開発する人向け）を返す。そろっていれば null。
 * 足りないまま Firebase を使うと画面ごと止まるので、先にこれで確かめる。
 */
export function findSetupProblem(): string | null {
  try {
    readFirebaseOptions();
    getCompanyDomain();
    return null;
  } catch (error) {
    return error instanceof Error ? error.message : String(error);
  }
}
