# セットアップガイド

## 1. Supabase プロジェクト作成

1. [https://supabase.com](https://supabase.com) でアカウント作成（無料）
2. 「New project」でプロジェクトを作成（リージョン: Northeast Asia）
3. 作成後、**Settings > API** を開き以下をメモ
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - anon public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - service_role key → `SUPABASE_SERVICE_KEY`（インポートスクリプト用）

## 2. データベーススキーマ適用

1. Supabase の **SQL Editor** を開く
2. `supabase/schema.sql` の内容をすべてコピーして実行
3. `genres` と `departments` の初期データが投入される

## 3. 重点商材・目標値の登録

Supabase の Table Editor または SQL Editor で登録：

```sql
-- ジャンルIDを確認
select * from genres;

-- 重点商材登録（例: 2026年度）
insert into priority_products (jan_code, product_name, genre_id, fiscal_year) values
  ('4549292218947', 'キヤノン imageRUNNER ADVANCE DX C3930F', 1, 2026),
  ('4560000000001', 'HP ノートPC EliteBook 840', 3, 2026);

-- 目標値登録（全社目標: department_id = null）
-- まず priority_products と departments の id を確認してから登録
insert into targets (product_id, department_id, fiscal_year, target_count) values
  (1, null, 2026, 50),   -- 全社目標 50件
  (1, 12,   2026, 10);   -- 鶴岡支店目標 10件
```

## 4. ローカル環境の設定

```bash
# .env.local.example をコピー
cp .env.local.example .env.local

# .env.local を編集して Supabase の情報を入力
```

## 5. 開発サーバー起動

```bash
npm run dev
# → http://localhost:3000 でダッシュボードを確認
```

## 6. Vercel デプロイ

1. GitHub にリポジトリを作成して push
2. [https://vercel.com](https://vercel.com) で「New Project」→ GitHubリポジトリを選択
3. **Environment Variables** に以下を設定:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy ボタンをクリック

## 7. Windows タスクスケジューラ登録（毎日CSV取込）

1. Node.js がインストールされていることを確認: `node -v`
2. `.env.local` に `SUPABASE_SERVICE_KEY` と `CSV_FOLDER` を設定
3. PowerShell を **管理者として実行** して以下を実行:

```powershell
$action = New-ScheduledTaskAction `
  -Execute "node" `
  -Argument "scripts\import-orders.mjs" `
  -WorkingDirectory "C:\Users\koabe.MECOM1\src\product-results"

$trigger = New-ScheduledTaskTrigger -Daily -At "07:00AM"

$settings = New-ScheduledTaskSettingsSet -ExecutionTimeLimit (New-TimeSpan -Minutes 10)

Register-ScheduledTask `
  -TaskName "重点商材CSV取込" `
  -Action $action `
  -Trigger $trigger `
  -Settings $settings `
  -RunLevel Highest
```

4. タスクスケジューラで「重点商材CSV取込」が登録されたことを確認
5. 「今すぐ実行」でテスト、`scripts/logs/` にログが出力されることを確認

## ログ確認

```
scripts/logs/import-YYYY-MM-DD.log
```

毎日のインポート結果（挿入件数・スキップ件数・エラー）が記録されます。
