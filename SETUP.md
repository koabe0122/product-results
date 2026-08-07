# セットアップガイド

## 1. Supabase プロジェクト作成

1. [https://supabase.com](https://supabase.com) でアカウント作成（無料）
2. 「New project」でプロジェクトを作成（リージョン: Northeast Asia）
3. 作成後、**Settings > API** を開き以下をメモ
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - anon public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - service_role key → `SUPABASE_SERVICE_KEY`（インポートスクリプト用）

## 2. データベーススキーマ適用

### 初回セットアップ（新規プロジェクト）

1. Supabase の **SQL Editor** を開く
2. `supabase/schema.sql` の内容をすべてコピーして実行

### 既存DBへのカテゴリキー対応（必須）

すでに `schema.sql` を適用済みの場合は、次を **順番に** SQL Editor で実行します。

1. `supabase/migrate_001_category_key.sql`（カラム追加・制約変更）
2. `supabase/seed_data.sql`（2026年度 重点商材19件 + 部門別目標）

これがないとダッシュボードに施策・目標が表示されません。

## 3. ローカル環境の設定

```bash
# .env.local.example をコピー
cp .env.local.example .env.local

# .env.local を編集して Supabase の情報を入力
```

## 4. 開発サーバー起動

```bash
npm run dev
# → http://localhost:3000 でダッシュボードを確認
```

## 5. Vercel デプロイ

1. GitHub にリポジトリを作成して push
2. [https://vercel.com](https://vercel.com) で「New Project」→ GitHubリポジトリを選択
3. **Environment Variables** に以下を設定:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy ボタンをクリック

公開URL例: https://product-results.vercel.app

## 6. Windows 起動時のCSV取込

### 方法A: スタートアップフォルダ（管理者権限不要・推奨）

1. `Win + R` → `shell:startup` でスタートアップフォルダを開く
2. `scripts/run-import.vbs` のショートカットをそこに置く
3. PC再起動後、`scripts/logs/` にログが出ることを確認

### 方法B: タスクスケジューラ

PowerShell を **管理者として実行** し、`scripts/register-task.ps1` を実行。

ネットワーク共有が利用可能になるまで最大60秒リトライします。

### CSVフォルダパス

`.env.local` の `CSV_FOLDER` を編集:

```
CSV_FOLDER=\\192.168.0.2\工具用pcデータ交換\koabe
```

## ログ確認

```
scripts/logs/import-YYYY-MM-DD.log
```

毎日のインポート結果（挿入件数・スキップ件数・エラー）が記録されます。
