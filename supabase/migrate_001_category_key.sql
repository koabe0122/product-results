-- ============================================================
-- Migration 001: カテゴリキー対応
-- Supabase SQL Editor で実行してください
-- ============================================================

-- 1. priority_products に match_patterns カラムを追加
ALTER TABLE priority_products ADD COLUMN IF NOT EXISTS match_patterns TEXT[] NOT NULL DEFAULT '{}';

-- 2. jan_code を nullable に変更
ALTER TABLE priority_products ALTER COLUMN jan_code DROP NOT NULL;

-- 3. ユニーク制約を jan_code+fiscal_year → product_name+fiscal_year に変更
ALTER TABLE priority_products DROP CONSTRAINT IF EXISTS priority_products_jan_code_fiscal_year_key;
ALTER TABLE priority_products ADD CONSTRAINT priority_products_product_name_fiscal_year_key
  UNIQUE (product_name, fiscal_year);

-- 4. orders に category_key カラムを追加
ALTER TABLE orders ADD COLUMN IF NOT EXISTS category_key TEXT NOT NULL DEFAULT '';

-- 5. インデックス追加
CREATE INDEX IF NOT EXISTS idx_orders_category_key ON orders(category_key);

-- 6. DX ジャンルを追加
INSERT INTO genres (name, color) VALUES ('DX', '#06b6d4')
ON CONFLICT (name) DO NOTHING;
