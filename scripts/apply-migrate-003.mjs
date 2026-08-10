import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";

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
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Canon MFP → MFP
const { data: oldProd } = await supabase
  .from("priority_products")
  .select("id")
  .eq("product_name", "Canon MFP")
  .eq("fiscal_year", 2026)
  .maybeSingle();

if (oldProd?.id) {
  const { error } = await supabase
    .from("priority_products")
    .update({ product_name: "MFP" })
    .eq("id", oldProd.id);
  console.log(error ? `rename FAIL: ${error.message}` : "OK rename Canon MFP → MFP");
} else {
  console.log("INFO: product already named MFP (or missing)");
}

const { error: ordErr } = await supabase
  .from("orders")
  .update({ category_key: "MFP" })
  .eq("category_key", "Canon MFP");
console.log(ordErr ? `orders FAIL: ${ordErr.message}` : "OK orders category_key Canon MFP → MFP");

// count_mode があれば更新（カラム未作成でも続行可）
const { error: modeErr } = await supabase
  .from("priority_products")
  .update({ count_mode: "line" })
  .eq("product_name", "MFP")
  .eq("fiscal_year", 2026);

if (modeErr) {
  console.log(
    "WARN count_mode 未適用（任意）:",
    modeErr.message,
    "\n  → supabase/migrate_003_mfp_count_mode.sql を SQL Editor で実行するとDB側にも保存されます"
  );
} else {
  console.log("OK count_mode=line for MFP");
}

const { data: check } = await supabase
  .from("priority_products")
  .select("id, product_name")
  .eq("fiscal_year", 2026)
  .eq("product_name", "MFP");
console.log("MFP product:", check);
