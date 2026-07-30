#!/usr/bin/env node
/**
 * import-orders.mjs
 *
 * 重点商材CSVを毎日取り込むスクリプト
 * 実行例: node scripts/import-orders.mjs
 *
 * 必要環境変数 (.env.local または システム環境変数):
 *   SUPABASE_URL       - Supabase プロジェクト URL
 *   SUPABASE_SERVICE_KEY - Service Role Key (書き込み権限)
 *   CSV_FOLDER         - CSVが置かれるフォルダパス
 *   CSV_GENRE_MAP      - JAN→ジャンル対応JSON (省略可)
 */

import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";
import iconv from "iconv-lite";

// ---- 設定読み込み -------------------------------------------------------
function loadEnv() {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, "utf-8").split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const idx = trimmed.indexOf("=");
      if (idx === -1) continue;
      const key = trimmed.slice(0, idx).trim();
      const value = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, "");
      if (!process.env[key]) process.env[key] = value;
    }
  }
}
loadEnv();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const CSV_FOLDER = process.env.CSV_FOLDER ?? "\\\\192.168.0.2\\工具用pcデータ交換\\koabe";

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error("[ERROR] SUPABASE_URL / SUPABASE_SERVICE_KEY が設定されていません");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// ---- ログ ---------------------------------------------------------------
const LOG_DIR = path.resolve(process.cwd(), "scripts", "logs");
if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR, { recursive: true });

const today = new Date().toISOString().slice(0, 10);
const logFile = path.join(LOG_DIR, `import-${today}.log`);

function log(msg) {
  const ts = new Date().toISOString();
  const line = `[${ts}] ${msg}`;
  console.log(line);
  fs.appendFileSync(logFile, line + "\n", "utf-8");
}

// ---- CSVパース ----------------------------------------------------------
/**
 * Shift-JIS の CSV ファイルを読み込んでオブジェクト配列を返す
 * ヘッダ行: 伝票日付,商品コード,商品名,受注先 名称1,部署,担当者名[,ジャンル]
 */
function parseCSV(filePath) {
  const raw = fs.readFileSync(filePath);
  const text = iconv.decode(raw, "Shift_JIS");
  const lines = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");

  const records = [];
  let header = null;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // 簡易CSVパース（ダブルクォート対応）
    const cols = trimmed.match(/("(?:[^"]|"")*"|[^,]*)/g)?.map((c) =>
      c.replace(/^"|"$/g, "").replace(/""/g, '"').trim()
    ) ?? [];

    if (!header) {
      header = cols;
      continue;
    }

    const row = {};
    header.forEach((h, i) => {
      row[h] = cols[i] ?? "";
    });
    records.push(row);
  }
  return records;
}

// ---- メイン処理 ---------------------------------------------------------
async function main() {
  log("=== CSV取込開始 ===");

  // CSVフォルダ内の全CSVファイルを処理
  let files;
  try {
    files = fs.readdirSync(CSV_FOLDER).filter((f) =>
      f.toLowerCase().endsWith(".csv")
    );
  } catch (e) {
    log(`[ERROR] フォルダ読み込み失敗: ${CSV_FOLDER} - ${e.message}`);
    process.exit(1);
  }

  if (files.length === 0) {
    log("[INFO] 処理対象のCSVファイルが見つかりませんでした");
    return;
  }

  log(`[INFO] 対象ファイル数: ${files.length}`);

  let totalInserted = 0;
  let totalSkipped = 0;
  let totalErrors = 0;

  for (const file of files) {
    const filePath = path.join(CSV_FOLDER, file);
    log(`[INFO] 処理中: ${file}`);

    let records;
    try {
      records = parseCSV(filePath);
    } catch (e) {
      log(`[ERROR] CSV解析失敗: ${file} - ${e.message}`);
      totalErrors++;
      continue;
    }

    // 2行目以降がサンプルの場合はスキップ指示があるため、ヘッダ行確認
    const validRecords = records.filter((r) => {
      const dateStr = r["伝票日付"] ?? "";
      return /^\d{4}\/\d{2}\/\d{2}$/.test(dateStr);
    });

    if (validRecords.length === 0) {
      log(`[WARN] 有効なレコードなし: ${file}`);
      continue;
    }

    // Supabase upsert
    const rows = validRecords.map((r) => ({
      slip_date: r["伝票日付"].replace(/\//g, "-"),
      jan_code: String(r["商品コード"] ?? "").trim(),
      product_name: (r["商品名"] ?? "").trim(),
      customer_name: (r["受注先 名称1"] ?? "").trim(),
      department: (r["部署"] ?? "").trim(),
      person: (r["担当者名"] ?? "").trim(),
      genre: (r["ジャンル"] ?? "").trim(),
    }));

    const { data, error } = await supabase
      .from("orders")
      .upsert(rows, {
        onConflict: "slip_date,jan_code,customer_name,person",
        ignoreDuplicates: true,
      })
      .select("id");

    if (error) {
      log(`[ERROR] DB書き込み失敗: ${file} - ${error.message}`);
      totalErrors++;
    } else {
      const inserted = data?.length ?? 0;
      const skipped = rows.length - inserted;
      log(`[INFO] ${file}: ${inserted}件挿入 / ${skipped}件スキップ（重複）`);
      totalInserted += inserted;
      totalSkipped += skipped;
    }
  }

  log(`=== 取込完了: 挿入=${totalInserted} スキップ=${totalSkipped} エラー=${totalErrors} ===`);
}

main().catch((e) => {
  log(`[FATAL] ${e.message}`);
  process.exit(1);
});
