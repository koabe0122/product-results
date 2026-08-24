/**
 * apply-migrate-006.mjs
 * orders テーブルに quantity 列を追加する
 *
 * ALTER TABLE は PostgREST 経由では実行できないため、
 * Supabase SQL Editor で migrate_006_quantity.sql を実行してください:
 *
 *   ALTER TABLE orders ADD COLUMN IF NOT EXISTS quantity INTEGER NOT NULL DEFAULT 1;
 *
 * このスクリプトは実行確認のみ行います。
 */
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

for (const line of fs.readFileSync(path.resolve(".env.local"), "utf8").split("\n")) {
  const t = line.trim();
  if (!t || t.startsWith("#")) continue;
  const i = t.indexOf("=");
  if (i < 0) continue;
  const k = t.slice(0, i).trim();
  const v = t.slice(i + 1).trim().replace(/^["']|["']$/g, "");
  if (!process.env[k]) process.env[k] = v;
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

function log(msg) { console.log(`[${new Date().toISOString()}] ${msg}`); }

log("orders.quantity 列の存在を確認中...");
const { data, error } = await supabase
  .from("orders")
  .select("quantity")
  .limit(1);

if (error?.message?.includes("quantity")) {
  log("[ERROR] quantity 列が存在しません。");
  log("  Supabase SQL Editor で以下を実行してください:");
  log("  ALTER TABLE orders ADD COLUMN IF NOT EXISTS quantity INTEGER NOT NULL DEFAULT 1;");
  process.exit(1);
} else {
  log("  OK: quantity 列が存在します");
}

log("=== 確認完了 ===");
