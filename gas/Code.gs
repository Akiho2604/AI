/**
 * お問い合わせフォーム → スプレッドシート連携
 *
 * 【セットアップ手順】
 * 1. Googleスプレッドシートを新規作成する
 * 2. スプレッドシートのURLからIDをコピーし、SPREADSHEET_ID に貼り付ける
 *    例: https://docs.google.com/spreadsheets/d/【ここがID】/edit
 * 3. 拡張機能 → Apps Script を開き、このコードを貼り付けて保存する
 * 4. 初回実行時に権限の承認を行う（doPost を選択して実行）
 * 5. デプロイ → 新しいデプロイ → 種類「ウェブアプリ」
 *    - 実行ユーザー: 自分
 *    - アクセスできるユーザー: 全員
 * 6. 表示されたWebアプリURL（/exec で終わるURL）を
 *    js/script.js の GAS_ENDPOINT_URL に貼り付ける
 *
 * ※「デプロイを管理」→ 既存デプロイの「新バージョン」なら URL は変わりません。
 *   「新しいデプロイ」を作った場合のみ URL が変わります。
 */

const SPREADSHEET_ID = "16KddWcH2m4pa3mTKcaShZ6cgjbHD4tY17AWbO_egRAw";
const SHEET_NAME = "お問い合わせ";

function doGet() {
  try {
    const spreadsheet = getSpreadsheet();
    return createResponse(true, "GASは正常に動作しています。接続先: " + spreadsheet.getName());
  } catch (error) {
    return createResponse(false, error.message);
  }
}

function doPost(e) {
  try {
    const data = getRequestData(e);
    const name = data.name || "";
    const email = data.email || "";
    const phone = data.phone || "";
    const message = data.message || "";

    if (!name || !email || !message) {
      return createResponse(false, "必須項目が不足しています。");
    }

    const sheet = getOrCreateSheet();
    sheet.appendRow([
      new Date(),
      name,
      email,
      phone,
      message
    ]);

    return createResponse(true, "送信が完了しました。");
  } catch (error) {
    return createResponse(false, error.message);
  }
}

function getRequestData(e) {
  if (e.parameter && (e.parameter.name || e.parameter.email || e.parameter.message)) {
    return e.parameter;
  }

  if (e.postData && e.postData.contents) {
    return JSON.parse(e.postData.contents);
  }

  return {};
}

function getSpreadsheet() {
  const activeSpreadsheet = SpreadsheetApp.getActiveSpreadsheet();

  if (activeSpreadsheet) {
    return activeSpreadsheet;
  }

  return SpreadsheetApp.openById(SPREADSHEET_ID);
}

function getOrCreateSheet() {
  const spreadsheet = getSpreadsheet();
  let sheet = spreadsheet.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = spreadsheet.insertSheet(SHEET_NAME);
    sheet.appendRow(["送信日時", "お名前", "メールアドレス", "電話番号", "お問い合わせ内容"]);
    sheet.getRange(1, 1, 1, 5).setFontWeight("bold");
    sheet.setFrozenRows(1);
  }

  return sheet;
}

function createResponse(success, message) {
  const output = ContentService
    .createTextOutput(JSON.stringify({ success: success, message: message }))
    .setMimeType(ContentService.MimeType.JSON);

  return output;
}
