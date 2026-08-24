-- ============================================================
-- Migration 006: ordersテーブルに quantity 列を追加
-- MFP の count_mode は countActual.ts の QUANTITY_SUM_PRODUCTS でコード管理
-- ============================================================

-- quantity 列追加（既存行は 1 として初期化）
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS quantity INTEGER NOT NULL DEFAULT 1;
