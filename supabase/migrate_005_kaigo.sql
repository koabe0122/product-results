-- ============================================================
-- Migration 005: 介護ソフト・見守りサービス追加
-- Excelファイル「重点商材リスト20260818.xlsx」の修正を反映
-- Supabase SQL Editor または apply-migrate-005.mjs で実行
-- ============================================================

-- ---- 1. ジャンル追加 -----------------------------------------------
INSERT INTO genres (name, color)
VALUES ('介護', '#f97316')
ON CONFLICT (name) DO NOTHING;

-- ---- 2. 介護ソフト（重点商材・新規のみ対象） -------------------------
INSERT INTO priority_products (jan_code, product_name, genre_id, fiscal_year, match_patterns)
VALUES (
  NULL,
  '介護ソフト',
  (SELECT id FROM genres WHERE name = '介護'),
  2026,
  ARRAY[
    'ほのぼの',
    'OL NEXT',
    'Care Palette',
    '地域包括支援',
    'NDS NEXT',
    'OL more',
    'moreつながる',
    'Voice fun',
    'Vital Beats',
    'Care Patrol',
    'Mr.献',
    'onlineﾌﾟﾗｯﾄﾌｫｰﾑ',
    'NEXTCarePalette',
    'ほのぼのTALK',
    'ほのぼのIoT'
  ]
)
ON CONFLICT (product_name, fiscal_year) DO UPDATE
  SET match_patterns = EXCLUDED.match_patterns,
      genre_id        = EXCLUDED.genre_id;

-- count_mode: 客先初回のみカウント（新規のみ対象）
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'priority_products' AND column_name = 'count_mode'
  ) THEN
    UPDATE priority_products
    SET count_mode = 'unique_contract'
    WHERE product_name = '介護ソフト' AND fiscal_year = 2026;
  END IF;
END $$;

-- ---- 3. 見守りサービス ---------------------------------------------
INSERT INTO priority_products (jan_code, product_name, genre_id, fiscal_year, match_patterns)
VALUES (
  NULL,
  '見守りサービス',
  (SELECT id FROM genres WHERE name = '介護'),
  2026,
  ARRAY[
    '安心ひつじ',
    'ﾗｲﾌﾘｽﾞﾑﾅﾋﾞ',
    'SleepSensor',
    '離床ｾﾝｻｰ',
    'AISH',
    'LifeRhythm'
  ]
)
ON CONFLICT (product_name, fiscal_year) DO UPDATE
  SET match_patterns = EXCLUDED.match_patterns,
      genre_id        = EXCLUDED.genre_id;

-- 見守りサービスは line カウント（機器販売ベース）
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'priority_products' AND column_name = 'count_mode'
  ) THEN
    UPDATE priority_products
    SET count_mode = 'line'
    WHERE product_name = '見守りサービス' AND fiscal_year = 2026;
  END IF;
END $$;

-- ---- 5. Canon プロダクト機: imageFORCE C7xxx 追加 ---------------------
-- imageFORCE C7165F など高機能機は MFP ではなく Canon プロダクト機として計上
UPDATE priority_products
SET match_patterns = array_append(match_patterns, 'imageFORCE C7')
WHERE product_name = 'Canon プロダクト機'
  AND fiscal_year = 2026
  AND NOT 'imageFORCE C7' = ANY(match_patterns);

-- ---- 補足: import-orders.mjs の変更 ----------------------------------
-- 大分類=複写機 の強制 MFP 判定に以下の例外を追加:
--   isMfpBypassProduct(): LM-C\d|imageFORCE C7|imagePRESS に該当する商品は
--   MFP に強制せず pattern matching へフォールスルー
--
-- 対象商品（Excel 重点商材リスト20260818.xlsx 差分）:
--   EPSON LM-C6000 / LM-C5000 / LM-C4000 → EPSON LX/LM
--   Canon imageFORCE C7165F              → Canon プロダクト機
-- 介護ソフト（ほのぼの・OL NEXT・Care Palette 等）
UPDATE orders
SET category_key = '介護ソフト'
WHERE category_key = ''
  AND (
    product_name ILIKE '%ほのぼの%'
    OR product_name ILIKE '%OL NEXT%'
    OR product_name ILIKE '%Care Palette%'
    OR product_name ILIKE '%地域包括支援%'
    OR product_name ILIKE '%NDS NEXT%'
    OR product_name ILIKE '%OL more%'
    OR product_name ILIKE '%moreつながる%'
    OR product_name ILIKE '%Voice fun%'
    OR product_name ILIKE '%Vital Beats%'
    OR product_name ILIKE '%Care Patrol%'
    OR product_name ILIKE '%Mr.献%'
    OR product_name ILIKE '%onlineﾌﾟﾗｯﾄﾌｫｰﾑ%'
    OR product_name ILIKE '%NEXTCarePalette%'
    OR product_name ILIKE '%ほのぼのTALK%'
    OR product_name ILIKE '%ほのぼのIoT%'
  );

-- 見守りサービス
UPDATE orders
SET category_key = '見守りサービス'
WHERE category_key = ''
  AND (
    product_name ILIKE '%安心ひつじ%'
    OR product_name ILIKE '%ﾗｲﾌﾘｽﾞﾑﾅﾋﾞ%'
    OR product_name ILIKE '%SleepSensor%'
    OR product_name ILIKE '%離床ｾﾝｻｰ%'
    OR product_name ILIKE '%AISH%'
  );
