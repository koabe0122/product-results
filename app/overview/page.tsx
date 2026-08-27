import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "重点商材ダッシュボード — 卒業制作概要",
  description: "営業施策の受注実績を自動集計・可視化するWebダッシュボードの制作概要",
};

// ── small helpers ──────────────────────────────────────────────────────────────

function Tag({ children }: { children: string }) {
  return (
    <span className="inline-block text-[11px] font-semibold tracking-wide px-2 py-0.5 rounded bg-slate-100 text-slate-600">
      {children}
    </span>
  );
}

function Check({ children }: { children: string }) {
  return (
    <li className="flex gap-2 items-start text-sm text-slate-700">
      <span className="mt-0.5 text-teal-600 font-bold shrink-0">✓</span>
      {children}
    </li>
  );
}

function Cross({ children }: { children: string }) {
  return (
    <li className="flex gap-2 items-start text-sm text-slate-700">
      <span className="mt-0.5 text-red-500 font-bold shrink-0">✕</span>
      {children}
    </li>
  );
}

function Num({ n, children }: { n: number; children: string }) {
  return (
    <li className="flex gap-3 items-start text-sm text-slate-700">
      <span className="shrink-0 w-5 h-5 rounded-full bg-teal-600 text-white text-[11px] font-bold flex items-center justify-center mt-0.5">
        {n}
      </span>
      {children}
    </li>
  );
}

function SectionTitle({ children }: { children: string }) {
  return (
    <h2 className="text-base font-bold text-slate-800 border-l-4 border-teal-500 pl-3 mb-4">
      {children}
    </h2>
  );
}

function Card({
  title,
  badge,
  badgeActive,
  children,
}: {
  title: string;
  badge?: string;
  badgeActive?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100">
        <span className="text-xs font-semibold text-slate-500">{title}</span>
        {badge && (
          <span
            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
              badgeActive
                ? "bg-teal-100 text-teal-700"
                : "bg-slate-100 text-slate-500"
            }`}
          >
            {badge}
          </span>
        )}
      </div>
      <div className="px-4 py-3">{children}</div>
    </div>
  );
}

// ── page ───────────────────────────────────────────────────────────────────────

export default function OverviewPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* header */}
      <header className="bg-[#0b1220] text-white px-6 py-5">
        <div className="max-w-3xl mx-auto">
          <p className="text-[11px] font-semibold tracking-widest text-teal-400 uppercase mb-1">
            Graduation Project
          </p>
          <h1 className="text-2xl font-extrabold tracking-tight">
            重点商材ダッシュボード
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            営業施策の受注実績を自動集計・可視化するWebダッシュボード
          </p>
          <div className="flex flex-wrap gap-2 mt-3">
            {[
              "Next.js 16",
              "Supabase",
              "Vercel",
              "TypeScript",
              "PostgreSQL",
              "Task Scheduler",
            ].map((t) => (
              <span
                key={t}
                className="text-[11px] font-semibold px-2 py-0.5 rounded bg-white/10 text-slate-300"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8 space-y-10">

        {/* ① 作ったもの */}
        <section>
          <SectionTitle>① 作ったもの</SectionTitle>

          {/* stats */}
          <div className="grid grid-cols-3 gap-4 mb-5">
            {[
              { value: "22", label: "登録施策数" },
              { value: "1,267", label: "取込済み受注件数" },
              { value: "13", label: "対象部門数" },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-center"
              >
                <p className="text-2xl font-extrabold text-teal-600">{s.value}</p>
                <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card title="画面構成">
              <ul className="space-y-2">
                <Num n={1}>施策カード — 施策ごとに実績件数・目標数・達成率をビジュアル表示</Num>
                <Num n={2}>部門タブ — 全社 / AM第一G / AM第二G / 公共部 などで絞り込み</Num>
                <Num n={3}>期間フィルター — 今月・今四半期・今年度・全期間を切替</Num>
                <Num n={4}>担当者ランキング — 施策別カウントを担当者軸でランク表示</Num>
              </ul>
            </Card>
            <Card title="システム構成">
              <dl className="space-y-2.5 text-sm">
                {[
                  {
                    dt: "CSV取込",
                    dd: "ネットワーク共有から最新の「YYYYMMDD-重点商材進捗管理.csv」を自動検出・Shift-JIS解析",
                  },
                  {
                    dt: "DB",
                    dd: "Supabase (PostgreSQL) — orders / priority_products / targets テーブル",
                  },
                  {
                    dt: "スケジュール",
                    dd: "Windows タスクスケジューラで毎週月曜 7:00 に自動実行",
                  },
                  {
                    dt: "公開",
                    dd: "Vercel — GitHub push で自動デプロイ",
                  },
                ].map((row) => (
                  <div key={row.dt} className="flex gap-2">
                    <dt className="shrink-0 w-24 font-semibold text-slate-600 text-xs pt-0.5">
                      {row.dt}
                    </dt>
                    <dd className="text-slate-600 text-xs">{row.dd}</dd>
                  </div>
                ))}
              </dl>
            </Card>
          </div>
        </section>

        {/* ② 解決する面倒・課題 */}
        <section>
          <SectionTitle>② 解決する面倒・課題</SectionTitle>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card title="取り込み前の状況" badge="Before">
              <ul className="space-y-2">
                <Cross>毎週CSVをExcelで手動集計 → 営業会議で時間を消費</Cross>
                <Cross>複写機（台数）とソフト（件数）で集計ルールが違い混乱しやすい</Cross>
                <Cross>月額ライセンスが毎月の受注として重複カウントされる</Cross>
                <Cross>部門別・担当者別の進捗を都度フィルタして確認する手間</Cross>
                <Cross>フォルダに溜まり続け、どれが最新ファイルか分からない</Cross>
              </ul>
            </Card>
            <Card title="ダッシュボード化で解消" badge="After" badgeActive>
              <ul className="space-y-2">
                <Check>URLを開くだけで最新集計を確認 — 集計作業ゼロ</Check>
                <Check>MFPは売上台数、他施策は件数と自動で使い分けて集計</Check>
                <Check>初回のみカウントルール（unique_contract）で重複排除</Check>
                <Check>部門タブと期間フィルターで瞬時にドリルダウン</Check>
                <Check>最新ファイルを日付で自動検出し常に最新データを取込</Check>
              </ul>
            </Card>
          </div>
        </section>

        {/* ③ 作りたいと思った理由 */}
        <section>
          <SectionTitle>③ 作りたいと思った理由</SectionTitle>
          <div className="rounded-xl border border-slate-200 bg-white px-5 py-4 space-y-3 text-sm text-slate-700 leading-relaxed">
            <p>
              営業会議のたびに「今月のMFPは何台？」「ESETは何件？」を確認するため、毎回Excelを開いてCSVを集計していた。集計自体に時間がかかるうえ、担当者によって計算ロジックがブレることもあり、
              <strong className="text-slate-900">「誰が見ても同じ数字を見られる仕組み」</strong>
              を作ることが目標になった。
            </p>
            <p>
              また、重点施策ごとに集計ルール（台数・件数・初回のみ）が異なるという業務の複雑さをそのままシステムに落とし込むことで、
              <strong className="text-slate-900">業務知識をコードとして残す</strong>
              という意義も感じた。
            </p>
            <p>
              WebアプリとしてVercelに公開することで、PCのExcelインストール環境に依存せず、スマートフォンやタブレットからも確認できる状態を目指した。
            </p>
          </div>
        </section>

        {/* ④ 工夫・苦戦 */}
        <section>
          <SectionTitle>④ 工夫したポイントと苦戦したポイント</SectionTitle>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* 工夫 */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-teal-700">工夫したポイント</h3>
              {[
                {
                  title: "施策マッチングロジック",
                  body: "商品名のパターンマッチで施策を自動判定。最長マッチ優先＋施策別優先度スコア（PRIORITY マップ）を組み合わせ、曖昧な商品名でも正確に分類できる仕組みを設計した。",
                },
                {
                  title: "3種類の集計モード",
                  body: "line（行数カウント）/ unique_contract（客先×施策の初回のみ）/ quantity_sum（売上数量積算）の3モードをコードで管理し、施策ごとに自動切り替え。",
                },
                {
                  title: "MFPバイパス判定",
                  body: "大分類「複写機」でも EPSON LM-C / Canon imageFORCE C7 は別施策扱いにする例外ロジック（isMfpBypassProduct）を追加。ハード例外をコードで明示した。",
                },
              ].map((c) => (
                <div key={c.title} className="rounded-xl border border-teal-100 bg-teal-50 px-4 py-3">
                  <p className="text-xs font-bold text-teal-800 mb-1">{c.title}</p>
                  <p className="text-xs text-slate-700 leading-relaxed">{c.body}</p>
                </div>
              ))}
            </div>

            {/* 苦戦 */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-red-600">苦戦したポイント</h3>
              {[
                {
                  title: "DBスキーマ変更の壁",
                  body: "PostgreSQL の ALTER TABLE は Supabase REST API 経由では実行不可。quantity 列追加のためだけに SQL Editor での手動実行が必要で、インポートスクリプトにフォールバック処理を追加して対応した。",
                },
                {
                  title: "Shift-JIS CSVのエンコード",
                  body: "ネットワーク共有のCSVが Shift-JIS エンコードで PowerShell での文字化けが続いた。iconv-lite（Node.js）を使いプロジェクトディレクトリから実行することで解決した。",
                },
                {
                  title: "フォルダ一覧が取れない共有アクセス",
                  body: "\\\\192.168.0.2 の共有フォルダは Get-ChildItem ではリスト取得できないが直接パスは成功する挙動。一時フォルダへのコピー経由で動作させることで回避した。",
                },
              ].map((c) => (
                <div key={c.title} className="rounded-xl border border-red-100 bg-red-50 px-4 py-3">
                  <p className="text-xs font-bold text-red-700 mb-1">{c.title}</p>
                  <p className="text-xs text-slate-700 leading-relaxed">{c.body}</p>
                </div>
              ))}
            </div>
          </div>

          {/* まとめ */}
          <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50 px-5 py-3">
            <p className="text-xs font-bold text-blue-800 mb-1">全体を通じた学び</p>
            <p className="text-xs text-slate-700 leading-relaxed">
              業務ルールをそのままコードに落とすことの難しさと、「動く」だけでなく「正しく集計できる」ことの重要さを実感した。
              また、スキーマ変更・エンコード・ネットワーク共有など、開発環境の制約が想定外の障壁になることを経験できた。
            </p>
          </div>
        </section>

        {/* footer */}
        <footer className="border-t border-slate-200 pt-4 text-center">
          <a
            href="https://product-results.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-teal-600 font-semibold hover:underline"
          >
            ダッシュボードを開く →
          </a>
        </footer>
      </main>
    </div>
  );
}
