-- ============================================================
-- Migration 004: Dコンサービス追加 + 全社目標100件
-- Supabase SQL Editor で実行してください
-- ============================================================

INSERT INTO priority_products (jan_code, product_name, genre_id, fiscal_year, match_patterns)
VALUES (
  NULL,
  'Dコンサービス',
  (SELECT id FROM genres WHERE name = 'DX'),
  2026,
  ARRAY['Dコンサービス', 'Dコン', 'Dｺﾝｻｰﾋﾞｽ', 'Dｺﾝ', 'Ｄコンサービス', 'Ｄコン']
)
ON CONFLICT (product_name, fiscal_year) DO UPDATE
SET match_patterns = EXCLUDED.match_patterns,
    genre_id = EXCLUDED.genre_id;

-- count_mode カラムがある場合のみ unique_contract を設定
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'priority_products' AND column_name = 'count_mode'
  ) THEN
    UPDATE priority_products
    SET count_mode = 'unique_contract'
    WHERE product_name IN ('Dコンサービス', 'GoogleWS・M365')
      AND fiscal_year = 2026;
  END IF;
END $$;

INSERT INTO targets (product_id, department_id, fiscal_year, target_count)
SELECT id, NULL, 2026, 100
FROM priority_products
WHERE product_name = 'Dコンサービス' AND fiscal_year = 2026
ON CONFLICT DO NOTHING;

-- 既存受注のカテゴリ付け直し（半角カナ表記）
UPDATE orders
SET category_key = 'Dコンサービス'
WHERE category_key = ''
  AND (
    product_name ILIKE '%Dｺﾝ%'
    OR product_name ILIKE '%Dコン%'
    OR product_name ILIKE '%Ｄコン%'
  );
