-- ============================================================
-- Migration 002: match_patterns 精度改善
-- Supabase SQL Editor で実行してください
-- ============================================================

-- HOME-UNIT: CSV表記 HomeType-U / HOME type-U に対応
UPDATE priority_products
SET match_patterns = ARRAY[
  'HOME-UNIT', 'ホームユニット', 'home unit',
  'HomeType', 'HOME type', 'HOME TYPE', 'Home Type',
  'HOME-Type', 'type-U5', 'Type-U5', 'type-U'
]
WHERE product_name = 'HOME-UNIT' AND fiscal_year = 2026;

-- Canon MFP: imageFORCE対応（メーカー名単体は使わない＝ESET誤分類防止）
UPDATE priority_products
SET match_patterns = ARRAY[
  'imageRUNNER', 'iR-ADV', 'iR ADV', 'imageFORCE', 'ImageFORCE', '複合機'
]
WHERE product_name = 'Canon MFP' AND fiscal_year = 2026;

-- Canon プロダクト機: 短い PRO を廃止（PROTECT 誤爆防止）
UPDATE priority_products
SET match_patterns = ARRAY[
  'imagePRESS', 'Image PRESS', 'varioPRINT', 'LBP'
]
WHERE product_name = 'Canon プロダクト機' AND fiscal_year = 2026;

-- RISO RPS: 短すぎる SF/HC/MF9 を廃止
UPDATE priority_products
SET match_patterns = ARRAY[
  'RISOGRAPH', 'RISO', '理想科学', 'RPS'
]
WHERE product_name = 'RISO RPS' AND fiscal_year = 2026;

-- RISO ORP
UPDATE priority_products
SET match_patterns = ARRAY[
  'ComColor', 'ComColorFW', 'ORP', 'RISO ORP'
]
WHERE product_name = 'RISO ORP' AND fiscal_year = 2026;

-- ESET: 優先度を上げるため固有語を強化
UPDATE priority_products
SET match_patterns = ARRAY[
  'ESET', 'イーセット', 'ｲｰｾｯﾄ'
]
WHERE product_name = 'ESET' AND fiscal_year = 2026;

-- Server&NAS: 単体 Server を廃止（ESET Server 誤爆防止）
UPDATE priority_products
SET match_patterns = ARRAY[
  'NAS', 'バックアップ', 'あんしんクラウド', 'Synology', 'QNAP',
  'HPE', 'サーバ', 'サーバー'
]
WHERE product_name = 'Server&NASクラウドバックアップ' AND fiscal_year = 2026;

-- GoogleWS・M365: スペース無し表記対応
UPDATE priority_products
SET match_patterns = ARRAY[
  'Google Workspace', 'Google Apps', 'Microsoft 365', 'Microsoft365',
  'M365', 'Office 365', 'Office365', 'Gmail'
]
WHERE product_name = 'GoogleWS・M365' AND fiscal_year = 2026;

-- AIツール: 単体 AI は残すが match は最長一致側で制御。誤爆しにくい語を追加
UPDATE priority_products
SET match_patterns = ARRAY[
  'ChatGPT', 'Copilot', 'kintone', 'キントーン', 'ｷﾝﾄｰﾝ',
  'Salesforce', 'セールスフォース', '人工知能',
  'AIツール', '生成AI', 'HerozASK', 'HEROZ ASK', 'ASKライセンス'
]
WHERE product_name = 'AIツール100件受注' AND fiscal_year = 2026;

-- 勤怠管理
UPDATE priority_products
SET match_patterns = ARRAY[
  '勤怠', 'タイムレコーダー', 'KING OF TIME', 'ジョブカン',
  'TimeWatcher', 'HRシステム', 'クロノス', 'ｸﾛﾉｽ'
]
WHERE product_name = '勤怠管理拡販' AND fiscal_year = 2026;

-- 電子取引
UPDATE priority_products
SET match_patterns = ARRAY[
  '電子帳簿', '電子請求', 'インボイス', '受発注',
  'BtoBプラットフォーム', '電子取引', 'Sansan',
  'マネーフォワード', '楽楽明細', '明細電子化', '明細配信'
]
WHERE product_name = '電子取引ツール' AND fiscal_year = 2026;
