#!/usr/bin/env node
/**
 * import-orders.mjs
 *
 * 重点商材CSVを毎日取り込むスクリプト
 * 実行例: node scripts/import-orders.mjs
 *
 * 必要環境変数 (.env.local または システム環境変数):
 *   SUPABASE_URL         - Supabase プロジェクト URL
 *   SUPABASE_SERVICE_KEY - Service Role Key (書き込み権限)
 *   CSV_FOLDER           - CSVが置かれるフォルダパス
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

// ---- カテゴリマップ構築 --------------------------------------------------
/**
 * priority_products から match_patterns を取得し、
 * 商品名 → 施策名（product_name）のマッピングマップを構築する。
 * @returns {{ product_name: string; match_patterns: string[] }[]}
 */
async function buildCategoryMap() {
  const { data, error } = await supabase
    .from("priority_products")
    .select("product_name, match_patterns")
    .order("id");

  if (error) {
    log(`[WARN] カテゴリマップ取得失敗: ${error.message} - category_key は空になります`);
    return [];
  }
  return data ?? [];
}

/**
 * 商品名に対してパターンマッチングを行い、施策名（category_key）を返す。
 * 一致した最初の施策名を返す。どれにも一致しない場合は空文字を返す。
 * @param {string} productName
 * @param {{ product_name: string; match_patterns: string[] }[]} categoryMap
 * @returns {string}
 */
function matchCategory(productName, categoryMap) {
  const upper = productName.toUpperCase();
  for (const cat of categoryMap) {
    for (const pattern of (cat.match_patterns ?? [])) {
      if (upper.includes(pattern.toUpperCase())) {
        return cat.product_name;
      }
    }
  }
  return "";
}

// ---- ネットワーク待機 ---------------------------------------------------
/**
 * ネットワーク共有フォルダが利用可能になるまで待機する。
 * PC起動直後はネットワークが安定しておらず共有フォルダにアクセスできない場合があるため。
 */
async function waitForFolder(folderPath, maxRetries = 6, intervalSec = 10) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      fs.accessSync(folderPath);
      log(`[INFO] フォルダへのアクセス確認OK: ${folderPath}`);
      return true;
    } catch {
      log(`[INFO] フォルダ待機中... (${i + 1}/${maxRetries}) ${folderPath}`);
      await new Promise((r) => setTimeout(r, intervalSec * 1000));
    }
  }
  return false;
}

// ---- メイン処理 ---------------------------------------------------------
async function main() {
  log("=== CSV取込開始 ===");

  // カテゴリマップを先に取得
  const categoryMap = await buildCategoryMap();
  log(`[INFO] カテゴリマップ: ${categoryMap.length}件の施策を読み込みました`);

  // ネットワーク共有フォルダが利用可能になるまで待機（最大60秒）
  const folderReady = await waitForFolder(CSV_FOLDER);
  if (!folderReady) {
    log(`[ERROR] フォルダにアクセスできませんでした（タイムアウト）: ${CSV_FOLDER}`);
    process.exit(1);
  }

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

    // 伝票日付が日付形式の行のみ処理（サンプル行などを除外）
    const validRecords = records.filter((r) => {
      const dateStr = r["伝票日付"] ?? "";
      return /^\d{4}\/\d{2}\/\d{2}$/.test(dateStr);
    });

    if (validRecords.length === 0) {
      log(`[WARN] 有効なレコードなし: ${file}`);
      continue;
    }

    // 各レコードにカテゴリキーを付与
    const rows = validRecords.map((r) => {
      const productName = (r["商品名"] ?? "").trim();
      const categoryKey = matchCategory(productName, categoryMap);
      return {
        slip_date: r["伝票日付"].replace(/\//g, "-"),
        jan_code: String(r["商品コード"] ?? "").trim(),
        product_name: productName,
        customer_name: (r["受注先 名称1"] ?? "").trim(),
        department: (r["部署"] ?? "").trim(),
        person: (r["担当者名"] ?? "").trim(),
        genre: (r["ジャンル"] ?? "").trim(),
        category_key: categoryKey,
      };
    });

    const matchedCount = rows.filter((r) => r.category_key !== "").length;
    log(`[INFO] ${file}: ${validRecords.length}件中 ${matchedCount}件が重点商材にマッチ`);

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
