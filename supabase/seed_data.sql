-- ============================================================
-- Seed Data: 2026年度 重点商材 + 部門別目標値
-- Supabase SQL Editor で実行してください
-- migrate_001 実行後に行ってください
-- ============================================================

-- ---- priority_products 投入 ----------------------------------------
INSERT INTO priority_products (jan_code, product_name, genre_id, fiscal_year, match_patterns)
VALUES
  -- DX
  (NULL, 'AIツール100件受注',
   (SELECT id FROM genres WHERE name='DX'), 2026,
   ARRAY['AI', 'ChatGPT', 'Copilot', 'kintone', 'キントーン', 'Salesforce', 'セールスフォース', '人工知能']),

  (NULL, '勤怠管理拡販',
   (SELECT id FROM genres WHERE name='DX'), 2026,
   ARRAY['勤怠', 'タイムレコーダー', 'KING OF TIME', 'ジョブカン', 'TimeWatcher', 'HRシステム']),

  (NULL, 'ノンコードツール拡販',
   (SELECT id FROM genres WHERE name='DX'), 2026,
   ARRAY['kintone', 'キントーン', 'ノーコード', 'PowerApps', 'Notion', 'AppSheet']),

  (NULL, 'GoogleWS・M365',
   (SELECT id FROM genres WHERE name='DX'), 2026,
   ARRAY['Google Workspace', 'Google Apps', 'Microsoft 365', 'M365', 'Office 365', 'Gmail']),

  (NULL, '電子取引ツール',
   (SELECT id FROM genres WHERE name='DX'), 2026,
   ARRAY['電子帳簿', '電子請求', 'インボイス', '受発注', 'BtoBプラットフォーム', '電子取引', 'Sansan', 'マネーフォワード']),

  -- ドキュメント
  -- ※ Canon MFP CtoC と OEA は同キーワードのため初期は CtoC に統合
  -- 　 将来的にCSVへ「施策名」列を追加して分離予定
  (NULL, 'Canon MFP',
   (SELECT id FROM genres WHERE name='ドキュメント'), 2026,
   ARRAY['Canon', 'キヤノン', 'imageRUNNER', 'iR-ADV', 'iR ADV', 'MF7', 'MF8', 'MF6', 'MF5']),

  (NULL, 'Canon プロダクト機',
   (SELECT id FROM genres WHERE name='ドキュメント'), 2026,
   ARRAY['imagePRESS', 'Image PRESS', 'varioPRINT', 'PRO', 'LBP']),

  (NULL, 'RISO ORP',
   (SELECT id FROM genres WHERE name='ドキュメント'), 2026,
   ARRAY['ComColor', 'ComColorFW', 'ORP', 'RISO ORP']),

  (NULL, 'RISO RPS',
   (SELECT id FROM genres WHERE name='ドキュメント'), 2026,
   ARRAY['RISO', '理想科学', 'RPS', 'SF', 'HC', 'MF9']),

  (NULL, 'EPSON LX/LM',
   (SELECT id FROM genres WHERE name='ドキュメント'), 2026,
   ARRAY['EPSON', 'エプソン', 'LX-', 'LM-', 'PX-', 'LP-']),

  -- インフラ・セキュリティ（HW）
  (NULL, 'HOME-UNIT',
   (SELECT id FROM genres WHERE name='イン/セキュ'), 2026,
   ARRAY['HOME-UNIT', 'ホームユニット', 'home unit']),

  (NULL, 'Fortigate',
   (SELECT id FROM genres WHERE name='イン/セキュ'), 2026,
   ARRAY['Fortigate', 'FortiGate', 'フォーティゲート', 'FortiWifi', 'FortiAP']),

  (NULL, 'Barracuda',
   (SELECT id FROM genres WHERE name='イン/セキュ'), 2026,
   ARRAY['Barracuda', 'バラクーダ']),

  (NULL, 'SubGate',
   (SELECT id FROM genres WHERE name='イン/セキュ'), 2026,
   ARRAY['SubGate', 'サブゲート', 'SUBGATE']),

  (NULL, 'Server&NASクラウドバックアップ',
   (SELECT id FROM genres WHERE name='イン/セキュ'), 2026,
   ARRAY['Server', 'サーバ', 'NAS', 'バックアップ', 'あんしんクラウド', 'Synology', 'QNAP', 'HPE', 'Dell']),

  (NULL, 'Network＆カメラ',
   (SELECT id FROM genres WHERE name='イン/セキュ'), 2026,
   ARRAY['スイッチ', 'ルーター', 'ネットワークカメラ', 'HUB', 'L2SW', 'L3SW', 'Cisco', 'Yamaha', 'Axis', 'i-PRO']),

  -- インフラ・セキュリティ（SW）
  (NULL, 'ESET',
   (SELECT id FROM genres WHERE name='イン/セキュ'), 2026,
   ARRAY['ESET', 'イーセット']),

  (NULL, 'SKYSEA',
   (SELECT id FROM genres WHERE name='イン/セキュ'), 2026,
   ARRAY['SKYSEA', 'スカイシー', 'Sky Sea']),

  (NULL, 'AppCheck',
   (SELECT id FROM genres WHERE name='イン/セキュ'), 2026,
   ARRAY['AppCheck', 'アップチェック', 'App Check'])

ON CONFLICT (product_name, fiscal_year) DO NOTHING;

-- ---- targets 投入（通期=全社目標, 部門別） ---------------------------
-- 部門ID を name で参照するサブクエリ方式

DO $$
DECLARE
  dept_am1    int := (SELECT id FROM departments WHERE name='AM第一G');
  dept_am2    int := (SELECT id FROM departments WHERE name='AM第二G');
  dept_pub    int := (SELECT id FROM departments WHERE name='AM公共部');
  dept_off    int := (SELECT id FROM departments WHERE name='AMオフィス部');
  dept_mur    int := (SELECT id FROM departments WHERE name='村山支店');
  dept_yonz   int := (SELECT id FROM departments WHERE name='米沢支店');
  dept_shin   int := (SELECT id FROM departments WHERE name='新庄営業所');
  dept_sake   int := (SELECT id FROM departments WHERE name='酒田支店');
  dept_tsuru  int := (SELECT id FROM departments WHERE name='鶴岡支店');
  dept_sc     int := (SELECT id FROM departments WHERE name='SC部門');

  pid int;
BEGIN
  -- helper: insert target helper
  -- INSERT OR IGNORE pattern

  -- ===== DX =====
  -- AIツール100件受注
  SELECT id INTO pid FROM priority_products WHERE product_name='AIツール100件受注' AND fiscal_year=2026;
  INSERT INTO targets (product_id,department_id,fiscal_year,target_count) VALUES
    (pid,NULL,2026,100),(pid,dept_am1,2026,15),(pid,dept_am2,2026,20),
    (pid,dept_pub,2026,20),(pid,dept_off,2026,12),(pid,dept_mur,2026,20),
    (pid,dept_yonz,2026,25),(pid,dept_shin,2026,5),(pid,dept_sake,2026,20),
    (pid,dept_tsuru,2026,20),(pid,dept_sc,2026,12)
  ON CONFLICT DO NOTHING;

  -- 勤怠管理拡販
  SELECT id INTO pid FROM priority_products WHERE product_name='勤怠管理拡販' AND fiscal_year=2026;
  INSERT INTO targets (product_id,department_id,fiscal_year,target_count) VALUES
    (pid,NULL,2026,16),(pid,dept_am1,2026,2),(pid,dept_am2,2026,2),
    (pid,dept_pub,2026,2),(pid,dept_off,2026,1),(pid,dept_mur,2026,2),
    (pid,dept_yonz,2026,2),(pid,dept_shin,2026,1),(pid,dept_sake,2026,2),
    (pid,dept_tsuru,2026,2),(pid,dept_sc,2026,0)
  ON CONFLICT DO NOTHING;

  -- ノンコードツール拡販
  SELECT id INTO pid FROM priority_products WHERE product_name='ノンコードツール拡販' AND fiscal_year=2026;
  INSERT INTO targets (product_id,department_id,fiscal_year,target_count) VALUES
    (pid,NULL,2026,10),(pid,dept_am1,2026,1),(pid,dept_am2,2026,1),
    (pid,dept_pub,2026,2),(pid,dept_off,2026,1),(pid,dept_mur,2026,1),
    (pid,dept_yonz,2026,2),(pid,dept_shin,2026,0),(pid,dept_sake,2026,1),
    (pid,dept_tsuru,2026,1),(pid,dept_sc,2026,0)
  ON CONFLICT DO NOTHING;

  -- GoogleWS・M365
  SELECT id INTO pid FROM priority_products WHERE product_name='GoogleWS・M365' AND fiscal_year=2026;
  INSERT INTO targets (product_id,department_id,fiscal_year,target_count) VALUES
    (pid,NULL,2026,10),(pid,dept_am1,2026,1),(pid,dept_am2,2026,1),
    (pid,dept_pub,2026,1),(pid,dept_off,2026,1),(pid,dept_mur,2026,1),
    (pid,dept_yonz,2026,2),(pid,dept_shin,2026,1),(pid,dept_sake,2026,1),
    (pid,dept_tsuru,2026,1),(pid,dept_sc,2026,0)
  ON CONFLICT DO NOTHING;

  -- 電子取引ツール
  SELECT id INTO pid FROM priority_products WHERE product_name='電子取引ツール' AND fiscal_year=2026;
  INSERT INTO targets (product_id,department_id,fiscal_year,target_count) VALUES
    (pid,NULL,2026,20),(pid,dept_am1,2026,2),(pid,dept_am2,2026,3),
    (pid,dept_pub,2026,2),(pid,dept_off,2026,1),(pid,dept_mur,2026,2),
    (pid,dept_yonz,2026,3),(pid,dept_shin,2026,1),(pid,dept_sake,2026,3),
    (pid,dept_tsuru,2026,3),(pid,dept_sc,2026,0)
  ON CONFLICT DO NOTHING;

  -- ===== ドキュメント =====
  -- Canon MFP (CtoC + OEA統合 = 350)
  SELECT id INTO pid FROM priority_products WHERE product_name='Canon MFP' AND fiscal_year=2026;
  INSERT INTO targets (product_id,department_id,fiscal_year,target_count) VALUES
    (pid,NULL,2026,350),(pid,dept_am1,2026,36),(pid,dept_am2,2026,46),
    (pid,dept_pub,2026,24),(pid,dept_off,2026,6),(pid,dept_mur,2026,46),
    (pid,dept_yonz,2026,51),(pid,dept_shin,2026,12),(pid,dept_sake,2026,40),
    (pid,dept_tsuru,2026,40),(pid,dept_sc,2026,24)
  ON CONFLICT DO NOTHING;

  -- Canon プロダクト機
  SELECT id INTO pid FROM priority_products WHERE product_name='Canon プロダクト機' AND fiscal_year=2026;
  INSERT INTO targets (product_id,department_id,fiscal_year,target_count) VALUES
    (pid,NULL,2026,20),(pid,dept_am1,2026,3),(pid,dept_am2,2026,4),
    (pid,dept_pub,2026,2),(pid,dept_off,2026,1),(pid,dept_mur,2026,4),
    (pid,dept_yonz,2026,5),(pid,dept_shin,2026,1),(pid,dept_sake,2026,4),
    (pid,dept_tsuru,2026,4)
  ON CONFLICT DO NOTHING;

  -- RISO ORP
  SELECT id INTO pid FROM priority_products WHERE product_name='RISO ORP' AND fiscal_year=2026;
  INSERT INTO targets (product_id,department_id,fiscal_year,target_count) VALUES
    (pid,NULL,2026,25),(pid,dept_am1,2026,3),(pid,dept_am2,2026,4),
    (pid,dept_pub,2026,4),(pid,dept_off,2026,1),(pid,dept_mur,2026,5),
    (pid,dept_yonz,2026,4),(pid,dept_shin,2026,1),(pid,dept_sake,2026,1),
    (pid,dept_tsuru,2026,1),(pid,dept_sc,2026,1)
  ON CONFLICT DO NOTHING;

  -- RISO RPS
  SELECT id INTO pid FROM priority_products WHERE product_name='RISO RPS' AND fiscal_year=2026;
  INSERT INTO targets (product_id,department_id,fiscal_year,target_count) VALUES
    (pid,NULL,2026,98),(pid,dept_am1,2026,2),(pid,dept_am2,2026,2),
    (pid,dept_pub,2026,12),(pid,dept_off,2026,1),(pid,dept_mur,2026,8),
    (pid,dept_yonz,2026,17),(pid,dept_shin,2026,14),(pid,dept_sake,2026,22),
    (pid,dept_tsuru,2026,19),(pid,dept_sc,2026,1)
  ON CONFLICT DO NOTHING;

  -- EPSON LX/LM
  SELECT id INTO pid FROM priority_products WHERE product_name='EPSON LX/LM' AND fiscal_year=2026;
  INSERT INTO targets (product_id,department_id,fiscal_year,target_count) VALUES
    (pid,NULL,2026,25),(pid,dept_am1,2026,1),(pid,dept_am2,2026,1),
    (pid,dept_pub,2026,1),(pid,dept_off,2026,1),(pid,dept_mur,2026,10),
    (pid,dept_yonz,2026,1),(pid,dept_shin,2026,1),(pid,dept_sake,2026,5),
    (pid,dept_tsuru,2026,4)
  ON CONFLICT DO NOTHING;

  -- ===== インフラ・セキュリティ（HW） =====
  -- HOME-UNIT
  SELECT id INTO pid FROM priority_products WHERE product_name='HOME-UNIT' AND fiscal_year=2026;
  INSERT INTO targets (product_id,department_id,fiscal_year,target_count) VALUES
    (pid,NULL,2026,60),(pid,dept_am1,2026,6),(pid,dept_am2,2026,8),
    (pid,dept_pub,2026,8),(pid,dept_off,2026,3),(pid,dept_mur,2026,8),
    (pid,dept_yonz,2026,9),(pid,dept_shin,2026,2),(pid,dept_sake,2026,8),
    (pid,dept_tsuru,2026,8),(pid,dept_sc,2026,6)
  ON CONFLICT DO NOTHING;

  -- Fortigate
  SELECT id INTO pid FROM priority_products WHERE product_name='Fortigate' AND fiscal_year=2026;
  INSERT INTO targets (product_id,department_id,fiscal_year,target_count) VALUES
    (pid,NULL,2026,20),(pid,dept_am1,2026,2),(pid,dept_am2,2026,3),
    (pid,dept_pub,2026,2),(pid,dept_off,2026,2),(pid,dept_mur,2026,3),
    (pid,dept_yonz,2026,3),(pid,dept_shin,2026,1),(pid,dept_sake,2026,3),
    (pid,dept_tsuru,2026,3)
  ON CONFLICT DO NOTHING;

  -- Barracuda
  SELECT id INTO pid FROM priority_products WHERE product_name='Barracuda' AND fiscal_year=2026;
  INSERT INTO targets (product_id,department_id,fiscal_year,target_count) VALUES
    (pid,NULL,2026,15),(pid,dept_am1,2026,2),(pid,dept_am2,2026,2),
    (pid,dept_pub,2026,1),(pid,dept_off,2026,1),(pid,dept_mur,2026,2),
    (pid,dept_yonz,2026,3),(pid,dept_shin,2026,1),(pid,dept_sake,2026,2),
    (pid,dept_tsuru,2026,2)
  ON CONFLICT DO NOTHING;

  -- SubGate
  SELECT id INTO pid FROM priority_products WHERE product_name='SubGate' AND fiscal_year=2026;
  INSERT INTO targets (product_id,department_id,fiscal_year,target_count) VALUES
    (pid,NULL,2026,30),(pid,dept_am1,2026,3),(pid,dept_am2,2026,4),
    (pid,dept_pub,2026,4),(pid,dept_off,2026,1),(pid,dept_mur,2026,4),
    (pid,dept_yonz,2026,5),(pid,dept_shin,2026,1),(pid,dept_sake,2026,4),
    (pid,dept_tsuru,2026,4)
  ON CONFLICT DO NOTHING;

  -- Server&NASクラウドバックアップ
  SELECT id INTO pid FROM priority_products WHERE product_name='Server&NASクラウドバックアップ' AND fiscal_year=2026;
  INSERT INTO targets (product_id,department_id,fiscal_year,target_count) VALUES
    (pid,NULL,2026,30),(pid,dept_am1,2026,3),(pid,dept_am2,2026,4),
    (pid,dept_pub,2026,4),(pid,dept_off,2026,1),(pid,dept_mur,2026,4),
    (pid,dept_yonz,2026,5),(pid,dept_shin,2026,1),(pid,dept_sake,2026,4),
    (pid,dept_tsuru,2026,4)
  ON CONFLICT DO NOTHING;

  -- Network＆カメラ
  SELECT id INTO pid FROM priority_products WHERE product_name='Network＆カメラ' AND fiscal_year=2026;
  INSERT INTO targets (product_id,department_id,fiscal_year,target_count) VALUES
    (pid,NULL,2026,30),(pid,dept_am1,2026,3),(pid,dept_am2,2026,4),
    (pid,dept_pub,2026,4),(pid,dept_off,2026,1),(pid,dept_mur,2026,4),
    (pid,dept_yonz,2026,5),(pid,dept_shin,2026,1),(pid,dept_sake,2026,4),
    (pid,dept_tsuru,2026,4)
  ON CONFLICT DO NOTHING;

  -- ===== インフラ・セキュリティ（SW） =====
  -- ESET
  SELECT id INTO pid FROM priority_products WHERE product_name='ESET' AND fiscal_year=2026;
  INSERT INTO targets (product_id,department_id,fiscal_year,target_count) VALUES
    (pid,NULL,2026,100),(pid,dept_am1,2026,10),(pid,dept_am2,2026,13),
    (pid,dept_pub,2026,13),(pid,dept_off,2026,5),(pid,dept_mur,2026,13),
    (pid,dept_yonz,2026,16),(pid,dept_shin,2026,4),(pid,dept_sake,2026,13),
    (pid,dept_tsuru,2026,13)
  ON CONFLICT DO NOTHING;

  -- SKYSEA
  SELECT id INTO pid FROM priority_products WHERE product_name='SKYSEA' AND fiscal_year=2026;
  INSERT INTO targets (product_id,department_id,fiscal_year,target_count) VALUES
    (pid,NULL,2026,200),(pid,dept_am1,2026,20),(pid,dept_am2,2026,26),
    (pid,dept_pub,2026,26),(pid,dept_off,2026,10),(pid,dept_mur,2026,26),
    (pid,dept_yonz,2026,32),(pid,dept_shin,2026,8),(pid,dept_sake,2026,26),
    (pid,dept_tsuru,2026,26)
  ON CONFLICT DO NOTHING;

  -- AppCheck
  SELECT id INTO pid FROM priority_products WHERE product_name='AppCheck' AND fiscal_year=2026;
  INSERT INTO targets (product_id,department_id,fiscal_year,target_count) VALUES
    (pid,NULL,2026,100),(pid,dept_am1,2026,10),(pid,dept_am2,2026,13),
    (pid,dept_pub,2026,13),(pid,dept_off,2026,5),(pid,dept_mur,2026,13),
    (pid,dept_yonz,2026,16),(pid,dept_shin,2026,4),(pid,dept_sake,2026,13),
    (pid,dept_tsuru,2026,13)
  ON CONFLICT DO NOTHING;

END $$;
