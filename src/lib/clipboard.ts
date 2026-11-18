// 文字をコピーする（SPEC.md 5.5「URL をコピーするボタン」）。ブラウザでだけ呼ぶ（ボタンの onClick から）。
// アプリの中のブラウザでは navigator.clipboard が使えないことがあるので、古いやり方も試す。

/** text をコピーする。できたら true */
export async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // 許可されていないときなど。下の古いやり方を試す
  }
  return copyWithSelection(text);
}

// 見えない入力欄に文字を入れて選び、execCommand("copy") でコピーする
function copyWithSelection(text: string): boolean {
  const field = document.createElement("textarea");
  field.value = text;
  field.setAttribute("readonly", "");
  field.style.position = "fixed";
  field.style.opacity = "0";
  document.body.appendChild(field);
  try {
    field.select();
    field.setSelectionRange(0, text.length);
    return document.execCommand("copy");
  } catch {
    return false;
  } finally {
    field.remove();
  }
}
