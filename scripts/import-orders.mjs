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

const SUPABASE_URL =
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const CSV_FOLDER = process.env.CSV_FOLDER ?? "\\\\192.168.0.2\\工具用pcデータ交換\\koabe";

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error("[ERROR] SUPABASE_URL / SUPABASE_SERVICE_KEY が設定されていません");
  console.error("  .env.local に SUPABASE_URL と SUPABASE_SERVICE_KEY を設定してください");
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

// ---- CSVパース（クォート対応・空カラム混入なし） --------------------------
/**
 * ヘッダ例: 伝票日付,大分類,商品コード,商品名,受注先 名称1,部署,担当者名
 */
function parseCSV(filePath) {
  const text = iconv.decode(fs.readFileSync(filePath), "Shift_JIS");
  const lines = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");

  const records = [];
  let header = null;

  for (const line of lines) {
    if (!line.trim()) continue;

    const cols = [];
    let cur = "";
    let inQ = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (inQ) {
        if (ch === '"' && line[i + 1] === '"') {
          cur += '"';
          i++;
        } else if (ch === '"') {
          inQ = false;
        } else {
          cur += ch;
        }
      } else if (ch === '"') {
        inQ = true;
      } else if (ch === ",") {
        cols.push(cur.trim());
        cur = "";
      } else {
        cur += ch;
      }
    }
    cols.push(cur.trim());

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

// ---- 部門名正規化 -------------------------------------------------------
const DEPT_MAP = [
  [/ＡＭ\s*１\s*Ｇ|AM\s*1\s*G|ＡＭ第一|AM第一/i, "AM第一G"],
  [/ＡＭ\s*２\s*Ｇ|AM\s*2\s*G|ＡＭ第二|AM第二/i, "AM第二G"],
  [/ＡＭ公共|AM公共|公共部/i, "AM公共部"],
  [/ＡＭオフィス|AMオフィス|オフィス部/i, "AMオフィス部"],
  [/村山/i, "村山支店"],
  [/米沢/i, "米沢支店"],
  [/新庄/i, "新庄営業所"],
  [/酒田/i, "酒田支店"],
  [/鶴岡/i, "鶴岡支店"],
  [/ＳＣ|SC部門|ＳＥ|SE部門/i, "SC部門"],
];

function normalizeDepartment(dept) {
  const raw = (dept ?? "").trim();
  if (!raw) return raw;
  for (const [re, name] of DEPT_MAP) {
    if (re.test(raw)) return name;
  }
  return raw.replace(/[Ａ-Ｚａ-ｚ０-９]/i, (ch) =>
    String.fromCharCode(ch.charCodeAt(0) - 0xfee0)
  );
}

// ---- カテゴリマップ構築 --------------------------------------------------
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
 * 最長パターン一致で施策名を返す。
 * 同長の場合は固有ソフト（ESET等）を優先。
 */
function matchCategory(productName, categoryMap) {
  const upper = productName.toUpperCase();
  const hits = [];

  for (const cat of categoryMap) {
    for (const pattern of cat.match_patterns ?? []) {
      const p = String(pattern);
      if (!p) continue;
      if (upper.includes(p.toUpperCase())) {
        hits.push({ category: cat.product_name, pattern: p, len: p.length });
      }
    }
  }

  if (hits.length === 0) return "";

  const PRIORITY = {
    ESET: 100,
    SKYSEA: 100,
    AppCheck: 100,
    Fortigate: 90,
    Barracuda: 90,
    SubGate: 90,
    "HOME-UNIT": 90,
    "GoogleWS・M365": 80,
    "AIツール100件受注": 70,
    "勤怠管理拡販": 70,
    "電子取引ツール": 70,
    "Canon MFP": 60,
    "Canon プロダクト機": 50,
    "RISO RPS": 60,
    "RISO ORP": 60,
  };

  hits.sort((a, b) => {
    if (b.len !== a.len) return b.len - a.len;
    return (PRIORITY[b.category] ?? 0) - (PRIORITY[a.category] ?? 0);
  });

  return hits[0].category;
}

// ---- ネットワーク待機 ---------------------------------------------------
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

  const categoryMap = await buildCategoryMap();
  log(`[INFO] カテゴリマップ: ${categoryMap.length}件の施策を読み込みました`);

  const folderReady = await waitForFolder(CSV_FOLDER);
  if (!folderReady) {
    log(`[ERROR] フォルダにアクセスできませんでした（タイムアウト）: ${CSV_FOLDER}`);
    process.exit(1);
  }

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

    const validRecords = records.filter((r) => {
      const dateStr = r["伝票日付"] ?? "";
      return /^\d{4}\/\d{2}\/\d{2}$/.test(dateStr);
    });

    if (validRecords.length === 0) {
      log(`[WARN] 有効なレコードなし: ${file}`);
      continue;
    }

    const rawRows = validRecords.map((r) => {
      const productName = (r["商品名"] ?? "").trim();
      return {
        slip_date: r["伝票日付"].replace(/\//g, "-"),
        jan_code: String(r["商品コード"] ?? "").trim(),
        product_name: productName,
        customer_name: (r["受注先 名称1"] ?? "").trim(),
        department: normalizeDepartment(r["部署"] ?? ""),
        person: (r["担当者名"] ?? "").trim(),
        genre: (r["大分類"] || r["ジャンル"] || "").trim(),
        category_key: matchCategory(productName, categoryMap),
      };
    });

    const deduped = new Map();
    for (const row of rawRows) {
      const key = `${row.slip_date}|${row.jan_code}|${row.customer_name}|${row.person}`;
      deduped.set(key, row);
    }
    const rows = Array.from(deduped.values());
    const dupInFile = rawRows.length - rows.length;

    const matchedCount = rows.filter((r) => r.category_key !== "").length;
    log(
      `[INFO] ${file}: ${validRecords.length}件中 ${matchedCount}件が重点商材にマッチ` +
        (dupInFile > 0 ? `（ファイル内重複 ${dupInFile}件を除去）` : "")
    );

    const CHUNK = 200;
    let inserted = 0;
    let fileError = false;
    for (let i = 0; i < rows.length; i += CHUNK) {
      const chunk = rows.slice(i, i + CHUNK);
      const { data, error } = await supabase
        .from("orders")
        .upsert(chunk, {
          onConflict: "slip_date,jan_code,customer_name,person",
          ignoreDuplicates: false,
        })
        .select("id");

      if (error) {
        log(`[ERROR] DB書き込み失敗: ${file} (chunk ${i}-${i + chunk.length}) - ${error.message}`);
        totalErrors++;
        fileError = true;
        break;
      }
      inserted += data?.length ?? 0;
    }

    if (!fileError) {
      const skipped = rows.length - inserted;
      log(`[INFO] ${file}: ${inserted}件 upsert / 差分スキップ相当 ${Math.max(0, skipped)}件`);
      totalInserted += inserted;
      totalSkipped += Math.max(0, skipped);
    }
  }

  log(`=== 取込完了: 挿入=${totalInserted} スキップ=${totalSkipped} エラー=${totalErrors} ===`);
}

main().catch((e) => {
  log(`[FATAL] ${e.message}`);
  process.exit(1);
});
