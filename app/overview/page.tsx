import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "重点商材ダッシュボード — 卒業制作概要",
  description: "営業施策の受注実績を自動集計・可視化するWebダッシュボードの制作概要",
};

// ── helpers ────────────────────────────────────────────────────────────────────

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

function SectionTitle({ n, children }: { n: string; children: string }) {
  return (
    <h2 className="text-base font-bold text-slate-800 border-l-4 border-teal-500 pl-3 mb-4">
      {n} {children}
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

// ── AI-Driven Rules — 修正版（Rules 6・9 を具体化）─────────────────────────────

const RULES: { n: number; rule: string; body: string }[] = [
  {
    n: 1,
    rule: "90点→100点の戦いに備えよ",
    body: "「動く」だけでなく「正確に集計できる」ことにこだわった。MFP台数カウント・月額ライセンスの重複排除・パターンマッチ精度向上を繰り返し、精度90点→100点を追求した。",
  },
  {
    n: 2,
    rule: "理解できないものを作るな",
    body: "自社の営業データと集計ルールを熟知した上で設計。理解が曖昧な仕様（台数 vs 件数など）はその都度確認・対話してからコードに落とした。",
  },
  {
    n: 3,
    rule: "自分の武器を自分で作れ",
    body: "市販BI/Excelマクロではなく、自社業務に特化したダッシュボードをゼロから構築。施策分類ロジック・集計モードすべてが自作の「業務専用武器」。",
  },
  {
    n: 4,
    rule: "図解で認知コストを下げろ",
    body: "施策カード・進捗バー・部門タブ・担当者ランキングで複雑な集計結果を直感的に把握できるUIを設計。この概要ページ自体も図解として作成した。",
  },
  {
    n: 5,
    rule: "議論する前にプロトタイプを作れ",
    body: "まずCSV取込スクリプトを作って動くものを見せた。集計ルールの細部（MFP台数、ライセンス重複）は動作確認しながら週次で要件を固めた。",
  },
  {
    n: 6,
    rule: "AIが見る情報を整えろ",
    body: "CSVのAI用フォーマット（列名・エンコード）を整備し、matchCategory() のロジックをコメントで明文化。「AIが読んでも意図がわかるコード」を意識して構造化した。",
  },
  {
    n: 7,
    rule: "スキルを育て続けろ",
    body: "Next.js 16 / Supabase / TypeScript / PostgreSQL / Windows Task Scheduler を実務を通じて習得。Shift-JIS解析・PostgREST制約など想定外の技術課題も都度乗り越えた。",
  },
  {
    n: 8,
    rule: "抽象指示より模範解答を作れ",
    body: "matchCategory() / countActual() / filterOrdersForCounting() など、集計ルールを「模範実装」としてコードに明示。抽象的な要件を動く実装に落とし切った。",
  },
  {
    n: 9,
    rule: "スピードを出すな、対話しろ",
    body: "「MFPは台数か件数か」「月額ライセンスは重複カウントするか」など仕様の細部を毎回確認してから実装。思い込みで作らず確認→実装→確認のサイクルを繰り返した。",
  },
  {
    n: 10,
    rule: "1クリックを減らせ",
    body: "URLを開くだけで最新データが表示される。部門切替・期間フィルターはタブ/ボタン一発で完結。CSVインポートも週次自動実行で手動操作をゼロにした。",
  },
];

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
            {["Next.js 16","Supabase","Vercel","TypeScript","PostgreSQL","Task Scheduler"].map((t) => (
              <span key={t} className="text-[11px] font-semibold px-2 py-0.5 rounded bg-white/10 text-slate-300">
                {t}
              </span>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8 space-y-10">

        {/* ① 作ったもの */}
        <section>
          <SectionTitle n="①">作ったもの</SectionTitle>
          {/* 数値は2026年8月時点 */}
          <p className="text-[11px] text-slate-400 mb-3">※ 数値は 2026年8月時点</p>
          <div className="grid grid-cols-3 gap-4 mb-5">
            {[
              { value: "22", label: "登録施策数" },
              { value: "1,267", label: "取込済み受注件数" },
              { value: "13", label: "対象部門数" },
            ].map((s) => (
              <div key={s.label} className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-center">
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
              <dl className="space-y-2.5">
                {[
                  { dt: "CSV取込", dd: "ネットワーク共有から最新の「YYYYMMDD-重点商材進捗管理.csv」を自動検出・Shift-JIS解析" },
                  { dt: "DB", dd: "Supabase (PostgreSQL) — orders / priority_products / targets テーブル" },
                  { dt: "スケジュール", dd: "Windows タスクスケジューラで毎週月曜 7:00 に自動実行" },
                  { dt: "公開", dd: "Vercel — GitHub push で自動デプロイ" },
                ].map((row) => (
                  <div key={row.dt} className="flex gap-2">
                    <dt className="shrink-0 w-24 font-semibold text-slate-600 text-xs pt-0.5">{row.dt}</dt>
                    <dd className="text-slate-600 text-xs">{row.dd}</dd>
                  </div>
                ))}
              </dl>
            </Card>
          </div>
        </section>

        {/* ② 作りたいと思った理由（UX指摘：動機を先に） */}
        <section>
          <SectionTitle n="②">作りたいと思った理由</SectionTitle>
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

        {/* ③ 解決する面倒・課題（UX指摘：理由の後に） */}
        <section>
          <SectionTitle n="③">解決する面倒・課題</SectionTitle>
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

        {/* ④ 工夫・苦戦 */}
        <section>
          <SectionTitle n="④">工夫したポイントと苦戦したポイント</SectionTitle>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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
                  // 技術レビュー指摘：一時フォルダ経由の記述を現行コードに合わせて修正
                  title: "ネットワーク共有へのアクセス方法の調査",
                  body: "PowerShell では Get-ChildItem でのフォルダ一覧取得が失敗するケースがあった。調査の結果、Node.js の fs.readdirSync で直接アクセスする方式に統一することで安定動作を実現した。",
                },
              ].map((c) => (
                <div key={c.title} className="rounded-xl border border-red-100 bg-red-50 px-4 py-3">
                  <p className="text-xs font-bold text-red-700 mb-1">{c.title}</p>
                  <p className="text-xs text-slate-700 leading-relaxed">{c.body}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50 px-5 py-3">
            <p className="text-xs font-bold text-blue-800 mb-1">全体を通じた学び</p>
            <p className="text-xs text-slate-700 leading-relaxed">
              業務ルールをそのままコードに落とすことの難しさと、「動く」だけでなく「正しく集計できる」ことの重要さを実感した。
              また、スキーマ変更・エンコード・ネットワーク共有など、開発環境の制約が想定外の障壁になることを経験できた。
            </p>
          </div>
        </section>

        {/* ⑤ AI-Driven Rules との対応 */}
        <section>
          <SectionTitle n="⑤">AI-Driven Rules との対応</SectionTitle>
          {/* UX指摘：Rules の前提説明を追加 */}
          <p className="text-xs text-slate-500 mb-4">
            AI活用時代の行動指針10か条（AI-Driven Rules）と、本プロジェクトでの体現内容の対応表。
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {RULES.map(({ n, rule, body }) => (
              <div key={n} className="rounded-xl border border-slate-200 bg-white px-4 py-3">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="shrink-0 w-5 h-5 rounded-full bg-slate-800 text-white text-[10px] font-bold flex items-center justify-center">
                    {n}
                  </span>
                  <p className="text-xs font-bold text-slate-800">{rule}</p>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed pl-7">{body}</p>
              </div>
            ))}
          </div>
        </section>

      </main>
    </div>
  );
}
