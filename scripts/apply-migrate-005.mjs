/**
 * apply-migrate-005.mjs
 * 介護ソフト・見守りサービスをDBに追加する
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

// ---- 1. ジャンル追加 -----------------------------------------------
log("1. 介護ジャンル追加...");
const { error: genreErr } = await supabase
  .from("genres")
  .upsert({ name: "介護", color: "#f97316" }, { onConflict: "name" });
if (genreErr) { console.error("genres upsert:", genreErr); process.exit(1); }

const { data: genre } = await supabase.from("genres").select("id").eq("name", "介護").single();
log(`  genre id = ${genre.id}`);

// ---- 2. 介護ソフト ---------------------------------------------------
log("2. 介護ソフト priority_product 追加...");
const { error: kaigoErr } = await supabase.from("priority_products").upsert(
  {
    jan_code: null,
    product_name: "介護ソフト",
    genre_id: genre.id,
    fiscal_year: 2026,
    match_patterns: [
      "ほのぼの",
      "OL NEXT",
      "Care Palette",
      "地域包括支援",
      "NDS NEXT",
      "OL more",
      "moreつながる",
      "Voice fun",
      "Vital Beats",
      "Care Patrol",
      "Mr.献",
      "onlineﾌﾟﾗｯﾄﾌｫｰﾑ",
      "NEXTCarePalette",
      "ほのぼのTALK",
      "ほのぼのIoT",
    ],
    // count_mode は DB カラム未存在のため lib/countActual.ts で管理
  },
  { onConflict: "product_name,fiscal_year" }
);
if (kaigoErr) { console.error("介護ソフト upsert:", kaigoErr); process.exit(1); }
log("  OK");

// ---- 3. 見守りサービス -----------------------------------------------
log("3. 見守りサービス priority_product 追加...");
const { error: mimamoriErr } = await supabase.from("priority_products").upsert(
  {
    jan_code: null,
    product_name: "見守りサービス",
    genre_id: genre.id,
    fiscal_year: 2026,
    match_patterns: [
      "安心ひつじ",
      "ﾗｲﾌﾘｽﾞﾑﾅﾋﾞ",
      "SleepSensor",
      "離床ｾﾝｻｰ",
      "AISH",
      "LifeRhythm",
    ],
    // count_mode = "line" は lib/countActual.ts で管理（DBカラム未存在）
  },
  { onConflict: "product_name,fiscal_year" }
);
if (mimamoriErr) { console.error("見守りサービス upsert:", mimamoriErr); process.exit(1); }
log("  OK");

// ---- 4. 既存受注への category_key 付け直し ---------------------------
log("4. 既存受注の category_key 付け直し...");

// 介護ソフトパターン（ILIKEに使う）
const kaigoPatternsSQL = [
  "product_name ILIKE '%ほのぼの%'",
  "product_name ILIKE '%OL NEXT%'",
  "product_name ILIKE '%Care Palette%'",
  "product_name ILIKE '%地域包括支援%'",
  "product_name ILIKE '%NDS NEXT%'",
  "product_name ILIKE '%OL more%'",
  "product_name ILIKE '%moreつながる%'",
  "product_name ILIKE '%Voice fun%'",
  "product_name ILIKE '%Vital Beats%'",
  "product_name ILIKE '%Care Patrol%'",
  "product_name ILIKE '%onlineﾌﾟﾗｯﾄﾌｫｰﾑ%'",
  "product_name ILIKE '%NEXTCarePalette%'",
  "product_name ILIKE '%ほのぼのTALK%'",
  "product_name ILIKE '%ほのぼのIoT%'",
].join(" OR ");

// Supabase JS SDK ではOR付きILIKEは .or() を使用
const { count: kaigoUpdated, error: kaigoUpdErr } = await supabase
  .from("orders")
  .update({ category_key: "介護ソフト" })
  .eq("category_key", "")
  .or(
    [
      "product_name.ilike.%ほのぼの%",
      "product_name.ilike.%OL NEXT%",
      "product_name.ilike.%Care Palette%",
      "product_name.ilike.%地域包括支援%",
      "product_name.ilike.%NDS NEXT%",
      "product_name.ilike.%OL more%",
      "product_name.ilike.%moreつながる%",
      "product_name.ilike.%Voice fun%",
      "product_name.ilike.%Vital Beats%",
      "product_name.ilike.%Care Patrol%",
      "product_name.ilike.%NEXTCarePalette%",
      "product_name.ilike.%ほのぼのTALK%",
      "product_name.ilike.%ほのぼのIoT%",
    ].join(",")
  )
  .select("id", { count: "exact", head: true });
if (kaigoUpdErr) { console.error("介護ソフト orders update:", kaigoUpdErr); }
else log(`  介護ソフト: ${kaigoUpdated ?? 0} 件更新`);

// 見守りサービス
const { count: mimamoriUpdated, error: mimamoriUpdErr } = await supabase
  .from("orders")
  .update({ category_key: "見守りサービス" })
  .eq("category_key", "")
  .or(
    [
      "product_name.ilike.%安心ひつじ%",
      "product_name.ilike.%ﾗｲﾌﾘｽﾞﾑﾅﾋﾞ%",
      "product_name.ilike.%SleepSensor%",
      "product_name.ilike.%離床ｾﾝｻｰ%",
      "product_name.ilike.%AISH%",
    ].join(",")
  )
  .select("id", { count: "exact", head: true });
if (mimamoriUpdErr) { console.error("見守りサービス orders update:", mimamoriUpdErr); }
else log(`  見守りサービス: ${mimamoriUpdated ?? 0} 件更新`);

log("=== 完了 ===");
