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
 *    index.html の GAS_ENDPOINT_URL に貼り付ける
 *
 * ※「デプロイを管理」→ 既存デプロイの「新バージョン」なら URL は変わりません。
 *   「新しいデプロイ」を作った場合のみ URL が変わります。
 */

const SPREADSHEET_ID = "16KddWcH2m4pa3mTKcaShZ6cgjbHD4tY17AWbO_egRAw";
const SHEET_NAME = "お問い合わせ";

function doGet(e) {
  try {
    const spreadsheet = getSpreadsheet();
    const info = spreadsheet.getName() + " (ID: " + spreadsheet.getId() + ")";

    if (e && e.parameter && e.parameter.action === "testWrite") {
      const sheet = getOrCreateSheet();
      sheet.appendRow([
        new Date(),
        "書き込みテスト",
        "test@example.com",
        "",
        "GASの書き込み確認",
        "",
        "",
        ""
      ]);
      return createResponse(true, "書き込みテスト成功。接続先: " + info);
    }

    return createResponse(true, "GASは正常に動作しています。接続先: " + info);
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
    const pageUrl = data.pageUrl || "";
    const referrer = data.referrer || "";
    const pageTitle = data.pageTitle || "";
    const submittedAt = parseSubmittedAt(data.submittedAt);

    if (!name || !email || !message) {
      return createResponse(false, "必須項目が不足しています。");
    }

    const sheet = getOrCreateSheet();
    sheet.appendRow([
      submittedAt,
      name,
      email,
      phone,
      message,
      pageUrl,
      referrer,
      pageTitle
    ]);

    return createResponse(true, "送信が完了しました。");
  } catch (error) {
    return createResponse(false, error.message);
  }
}

function parseSubmittedAt(value) {
  if (!value) {
    return new Date();
  }

  const parsed = new Date(value);
  return isNaN(parsed.getTime()) ? new Date() : parsed;
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

  if (!SPREADSHEET_ID) {
    throw new Error("SPREADSHEET_ID が未設定です。スプレッドシートから Apps Script を開いてください。");
  }

  try {
    return SpreadsheetApp.openById(SPREADSHEET_ID);
  } catch (error) {
    throw new Error(
      "スプレッドシートを開けませんでした。ID: " + SPREADSHEET_ID +
      " / スプレッドシートから「拡張機能→Apps Script」で開き直してください。"
    );
  }
}

function getOrCreateSheet() {
  const spreadsheet = getSpreadsheet();
  let sheet = spreadsheet.getSheetByName(SHEET_NAME);
  const headers = [
    "送信日時",
    "お名前",
    "メールアドレス",
    "電話番号",
    "お問い合わせ内容",
    "送信ページURL",
    "参照元（流入元）",
    "ページタイトル"
  ];

  if (!sheet) {
    sheet = spreadsheet.insertSheet(SHEET_NAME);
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold");
    sheet.setFrozenRows(1);
    return sheet;
  }

  ensureHeaders(sheet, headers);
  return sheet;
}

function ensureHeaders(sheet, headers) {
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold");
    sheet.setFrozenRows(1);
    return;
  }

  const existingHeaders = sheet
    .getRange(1, 1, 1, headers.length)
    .getValues()[0]
    .map(function (value) {
      return String(value || "").trim();
    });

  if (existingHeaders.join("|") === headers.join("|")) {
    return;
  }

  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold");
  sheet.setFrozenRows(1);
}

function createResponse(success, message) {
  const output = ContentService
    .createTextOutput(JSON.stringify({ success: success, message: message }))
    .setMimeType(ContentService.MimeType.JSON);

  return output;
}
