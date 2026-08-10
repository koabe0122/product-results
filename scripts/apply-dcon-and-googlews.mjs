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

const MATCH = [
  "Dコンサービス",
  "Dコン",
  "Dｺﾝｻｰﾋﾞｽ",
  "Dｺﾝ",
  "Ｄコンサービス",
  "Ｄコン",
];

const { data: genre, error: gErr } = await supabase
  .from("genres")
  .select("id")
  .eq("name", "DX")
  .single();
if (gErr) throw gErr;

const { data: existing } = await supabase
  .from("priority_products")
  .select("id")
  .eq("product_name", "Dコンサービス")
  .eq("fiscal_year", 2026)
  .maybeSingle();

let productId = existing?.id;
if (productId) {
  const { error } = await supabase
    .from("priority_products")
    .update({
      genre_id: genre.id,
      match_patterns: MATCH,
    })
    .eq("id", productId);
  if (error) throw error;
  console.log("OK update Dコンサービス", productId);
} else {
  const { data, error } = await supabase
    .from("priority_products")
    .insert({
      jan_code: null,
      product_name: "Dコンサービス",
      genre_id: genre.id,
      fiscal_year: 2026,
      match_patterns: MATCH,
    })
    .select("id")
    .single();
  if (error) throw error;
  productId = data.id;
  console.log("OK insert Dコンサービス", productId);
}

// count_mode（カラム未作成でも続行）
for (const name of ["Dコンサービス", "GoogleWS・M365"]) {
  const { error } = await supabase
    .from("priority_products")
    .update({ count_mode: "unique_contract" })
    .eq("product_name", name)
    .eq("fiscal_year", 2026);
  if (error) {
    console.log(`WARN count_mode skip (${name}):`, error.message);
  } else {
    console.log(`OK count_mode=unique_contract (${name})`);
  }
}

const { data: companyTarget } = await supabase
  .from("targets")
  .select("id,target_count")
  .eq("product_id", productId)
  .eq("fiscal_year", 2026)
  .is("department_id", null)
  .maybeSingle();

if (companyTarget) {
  const { error } = await supabase
    .from("targets")
    .update({ target_count: 100 })
    .eq("id", companyTarget.id);
  if (error) throw error;
  console.log("OK update company target → 100");
} else {
  const { error } = await supabase.from("targets").insert({
    product_id: productId,
    department_id: null,
    fiscal_year: 2026,
    target_count: 100,
  });
  if (error) throw error;
  console.log("OK insert company target 100");
}

// 既存受注の category_key 付け直し（ページネーション）
let updated = 0;
let from = 0;
const page = 1000;
for (;;) {
  const { data: rows, error } = await supabase
    .from("orders")
    .select("id, product_name, category_key")
    .range(from, from + page - 1);
  if (error) throw error;
  if (!rows?.length) break;

  const ids = rows
    .filter((r) => {
      const name = r.product_name ?? "";
      const hit =
        name.includes("Dｺﾝ") ||
        name.includes("Dコン") ||
        name.includes("Ｄコン");
      return hit && r.category_key !== "Dコンサービス";
    })
    .map((r) => r.id);

  if (ids.length > 0) {
    const { error: uErr } = await supabase
      .from("orders")
      .update({ category_key: "Dコンサービス" })
      .in("id", ids);
    if (uErr) throw uErr;
    updated += ids.length;
  }

  if (rows.length < page) break;
  from += page;
}
console.log("OK orders categorized as Dコンサービス:", updated);

const { count } = await supabase
  .from("orders")
  .select("*", { count: "exact", head: true })
  .eq("category_key", "Dコンサービス");
console.log("Dコンサービス order rows now:", count);
