import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";

function loadEnv() {
  const envPath = path.resolve(process.cwd(), ".env.local");
  for (const line of fs.readFileSync(envPath, "utf-8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i < 0) continue;
    const k = t.slice(0, i).trim();
    const v = t.slice(i + 1).trim().replace(/^["']|["']$/g, "");
    if (!process.env[k]) process.env[k] = v;
  }
}
loadEnv();

const supabase = createClient(
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const updates = {
  "HOME-UNIT": [
    "HOME-UNIT", "ホームユニット", "home unit",
    "HomeType", "HOME type", "HOME TYPE", "Home Type",
    "HOME-Type", "type-U5", "Type-U5", "type-U",
  ],
  // メーカー名単体は使わない（「ｷﾔﾉﾝ ESET」誤分類防止）
  "Canon MFP": [
    "imageRUNNER", "iR-ADV", "iR ADV", "imageFORCE", "ImageFORCE", "複合機",
  ],
  "Canon プロダクト機": ["imagePRESS", "Image PRESS", "varioPRINT", "LBP"],
  "RISO RPS": ["RISOGRAPH", "RISO", "理想科学", "RPS"],
  "RISO ORP": ["ComColor", "ComColorFW", "ORP", "RISO ORP"],
  ESET: ["ESET", "イーセット", "ｲｰｾｯﾄ"],
  "Server&NASクラウドバックアップ": [
    "NAS", "バックアップ", "あんしんクラウド", "Synology", "QNAP",
    "HPE", "サーバ", "サーバー",
  ],
  "GoogleWS・M365": [
    "Google Workspace", "Google Apps", "Microsoft 365", "Microsoft365",
    "M365", "Office 365", "Office365", "Gmail",
  ],
  "AIツール100件受注": [
    "ChatGPT", "Copilot", "kintone", "キントーン", "ｷﾝﾄｰﾝ",
    "Salesforce", "セールスフォース", "人工知能",
    "AIツール", "生成AI", "HerozASK", "HEROZ ASK", "ASKライセンス",
  ],
  "勤怠管理拡販": [
    "勤怠", "タイムレコーダー", "KING OF TIME", "ジョブカン",
    "TimeWatcher", "HRシステム", "クロノス", "ｸﾛﾉｽ",
  ],
  "電子取引ツール": [
    "電子帳簿", "電子請求", "インボイス", "受発注",
    "BtoBプラットフォーム", "電子取引", "Sansan",
    "マネーフォワード", "楽楽明細", "明細電子化", "明細配信",
  ],
};

for (const [name, patterns] of Object.entries(updates)) {
  const { error } = await supabase
    .from("priority_products")
    .update({ match_patterns: patterns })
    .eq("product_name", name)
    .eq("fiscal_year", 2026);
  if (error) console.error("FAIL", name, error.message);
  else console.log("OK", name, patterns.length, "patterns");
}
