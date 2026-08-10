-- ============================================================
-- Migration 003: MFP改名 + count_mode 追加
-- ============================================================

-- 集計モード: line=受注行数 / unique_contract=客先×商品のユニーク
ALTER TABLE priority_products
  ADD COLUMN IF NOT EXISTS count_mode TEXT NOT NULL DEFAULT 'line';

-- Canon MFP → MFP に改名
UPDATE priority_products
SET product_name = 'MFP'
WHERE product_name = 'Canon MFP' AND fiscal_year = 2026;

-- 既存受注の category_key も追従
UPDATE orders
SET category_key = 'MFP'
WHERE category_key = 'Canon MFP';

-- 集計モード初期設定
UPDATE priority_products SET count_mode = 'line'
WHERE product_name IN (
  'MFP', 'Canon プロダクト機', 'RISO ORP', 'RISO RPS', 'EPSON LX/LM',
  'HOME-UNIT', 'Fortigate', 'Barracuda', 'SubGate',
  'Server&NASクラウドバックアップ', 'Network＆カメラ'
) AND fiscal_year = 2026;

UPDATE priority_products SET count_mode = 'unique_contract'
WHERE product_name IN (
  'ESET', 'SKYSEA', 'AppCheck', 'GoogleWS・M365',
  'AIツール100件受注', '勤怠管理拡販', 'ノンコードツール拡販', '電子取引ツール'
) AND fiscal_year = 2026;
