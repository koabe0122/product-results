"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { PeriodFilter } from "@/components/PeriodFilter";
import { DepartmentTabs } from "@/components/DepartmentTabs";
import { ProductCard } from "@/components/ProductCard";
import { RankingTable } from "@/components/RankingTable";
import { OrderDetailDrawer } from "@/components/OrderDetailDrawer";
import { currentFiscalYear } from "@/lib/utils";
import {
  countActual,
  resolveCountMode,
  filterOrdersForCounting,
} from "@/lib/countActual";
import type { Period } from "@/lib/utils";
import type {
  PriorityProduct,
  Target,
  Order,
  ProductSummary,
  PersonSummary,
  Genre,
} from "@/lib/types";

const COMPANY_DEPT = "全社";

interface DeptRef {
  id: number;
  name: string;
}

interface SummaryResponse {
  products: (PriorityProduct & { genre: Genre })[];
  departments: DeptRef[];
  targets: Target[];
  orders: Pick<
    Order,
    | "category_key"
    | "department"
    | "person"
    | "customer_name"
    | "product_name"
    | "slip_date"
    | "jan_code"
    | "quantity"
  >[];
}

export default function DashboardPage() {
  const [period, setPeriod] = useState<Period>("all");
  const [fiscalYear] = useState(currentFiscalYear);
  const [department, setDepartment] = useState(COMPANY_DEPT);
  const [data, setData] = useState<SummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [drawer, setDrawer] = useState<{
    open: boolean;
    title: string;
    categoryKey?: string;
    person?: string;
    personDepartment?: string;
  }>({ open: false, title: "" });

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams({
      period,
      fiscalYear: String(fiscalYear),
      ...(department !== COMPANY_DEPT ? { department } : {}),
    });
    try {
      const res = await fetch(`/api/summary?${params}`);
      if (!res.ok) throw new Error(`サーバーエラー (HTTP ${res.status})`);
      const json: SummaryResponse = await res.json();
      setData(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : "データ取得に失敗しました");
    } finally {
      setLoading(false);
    }
  }, [period, fiscalYear, department]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 部門リスト（受注データから取得した部門一覧）
  const departments = useMemo(
    () => [
      COMPANY_DEPT,
      ...(data?.departments ?? [])
        .filter((d) => d.name !== COMPANY_DEPT)
        .map((d) => d.name),
    ],
    [data?.departments]
  );

  // 選択中の部門ID（目標値の絞り込みに使用）
  const selectedDeptId = useMemo(() => {
    if (department === COMPANY_DEPT) return null;
    return data?.departments.find((d) => d.name === department)?.id ?? -1;
  }, [department, data?.departments]);

  // 商材サマリー計算（count_mode に応じて台数 or 契約ユニーク）
  const productSummaries: ProductSummary[] = useMemo(
    () =>
      (data?.products ?? []).map((product) => {
        const mode = resolveCountMode(product.product_name, product.count_mode);
        const actual = countActual(
          data?.orders ?? [],
          product.product_name,
          mode
        );

        const target =
          department === COMPANY_DEPT
            ? (data?.targets ?? [])
                .filter(
                  (t) =>
                    t.product_id === product.id && t.department_id === null
                )
                .reduce((s, t) => s + t.target_count, 0)
            : (data?.targets ?? [])
                .filter(
                  (t) =>
                    t.product_id === product.id &&
                    t.department_id === selectedDeptId
                )
                .reduce((s, t) => s + t.target_count, 0);

        const rate = target > 0 ? (actual / target) * 100 : 0;
        return { product, target, actual, rate };
      }),
    [data?.products, data?.orders, data?.targets, department, selectedDeptId]
  );

  // 担当者サマリー（毎月行は初回のみ）
  const persons: PersonSummary[] = useMemo(() => {
    const modeByProduct = new Map(
      (data?.products ?? []).map((p) => [
        p.product_name,
        resolveCountMode(p.product_name, p.count_mode),
      ])
    );
    const counted = filterOrdersForCounting(data?.orders ?? [], (key) =>
      modeByProduct.get(key) ?? resolveCountMode(key)
    );

    const personMap = new Map<string, PersonSummary>();
    for (const o of counted) {
      const person = o.person ?? "";
      const dept = o.department ?? "";
      const key = `${person}__${dept}`;
      if (!personMap.has(key)) {
        personMap.set(key, {
          person,
          department: dept,
          totalCount: 0,
          byProduct: [],
        });
      }
      const ps = personMap.get(key)!;
      ps.totalCount++;
      const existing = ps.byProduct.find((b) => b.categoryKey === o.category_key);
      if (existing) {
        existing.count++;
      } else {
        ps.byProduct.push({
          categoryKey: o.category_key,
          productName: o.product_name ?? "",
          count: 1,
        });
      }
    }
    return Array.from(personMap.values()).sort(
      (a, b) => b.totalCount - a.totalCount
    );
  }, [data?.orders, data?.products]);

  // ジャンルグループ
  const genreGroups = useMemo(
    () =>
      Array.from(
        new Map(
          (data?.products ?? []).map((p) => [
            p.genre?.name ?? "その他",
            p.genre,
          ])
        ).entries()
      ),
    [data?.products]
  );

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[var(--header)] text-[var(--header-ink)] shadow-lg shadow-slate-900/20">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="mb-1 text-[11px] font-semibold tracking-[0.18em] text-teal-300 uppercase">
                Priority Products
              </p>
              <h1 className="font-display text-2xl font-extrabold tracking-tight sm:text-[1.75rem]">
                重点商材ダッシュボード
              </h1>
              <p className="mt-1 text-xs text-slate-400">
                {fiscalYear}年度 · {department}
              </p>
            </div>
            <PeriodFilter value={period} onChange={setPeriod} />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-8 px-4 py-6 sm:px-6">
        <DepartmentTabs
          departments={departments}
          value={department}
          onChange={setDepartment}
        />

        {error && (
          <div
            role="alert"
            className="flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
          >
            <span className="font-semibold">エラー:</span> {error}
            <button
              onClick={fetchData}
              className="ml-auto text-xs font-semibold text-rose-700 underline"
            >
              再試行
            </button>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="h-44 animate-pulse rounded-2xl bg-white/70 ring-1 ring-slate-200/70"
              />
            ))}
          </div>
        ) : (
          <>
            {!error && genreGroups.length > 0 ? (
              genreGroups.map(([genreName, genre]) => {
                const filtered = productSummaries.filter(
                  (s) => (s.product.genre?.name ?? "その他") === genreName
                );
                if (filtered.length === 0) return null;
                return (
                  <section key={genreName} className="space-y-3">
                    <div className="flex items-center gap-2.5">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: genre?.color ?? "#64748b" }}
                        aria-hidden="true"
                      />
                      <h2 className="font-display text-sm font-bold tracking-wide text-slate-700">
                        {genreName}
                      </h2>
                      <span className="text-xs font-medium text-slate-400">
                        {filtered.length}商材
                      </span>
                      <div className="ml-1 h-px flex-1 bg-gradient-to-r from-slate-200 to-transparent" />
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                      {filtered.map((s, idx) => (
                        <ProductCard
                          key={s.product.id}
                          summary={s}
                          index={idx}
                          onCountClick={(categoryKey, productName) =>
                            setDrawer({
                              open: true,
                              title: productName,
                              categoryKey,
                            })
                          }
                        />
                      ))}
                    </div>
                  </section>
                );
              })
            ) : !error ? (
              <div className="rounded-2xl bg-white/80 py-16 text-center text-sm text-slate-500 ring-1 ring-slate-200">
                重点商材が登録されていません。
                <br />
                Supabase の priority_products テーブルにデータを追加してください。
              </div>
            ) : null}

            {!error && persons.length > 0 && (
              <section aria-labelledby="ranking-heading" className="space-y-3">
                <div className="flex items-center gap-2.5">
                  <h2
                    id="ranking-heading"
                    className="font-display text-sm font-bold tracking-wide text-slate-700"
                  >
                    メンバーランキング
                  </h2>
                  <span className="text-xs font-medium text-slate-400">
                    全{persons.length}名
                  </span>
                  <div className="ml-1 h-px flex-1 bg-gradient-to-r from-slate-200 to-transparent" />
                </div>
                <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200/80 shadow-[var(--shadow)]">
                  <RankingTable
                    persons={persons}
                    onPersonClick={(person, dept) =>
                      setDrawer({
                        open: true,
                        title: `${person}（${dept}）`,
                        person,
                        personDepartment: dept,
                      })
                    }
                  />
                </div>
              </section>
            )}
          </>
        )}
      </main>

      <OrderDetailDrawer
        open={drawer.open}
        title={drawer.title}
        categoryKey={drawer.categoryKey}
        person={drawer.person}
        department={drawer.personDepartment ?? department}
        period={period}
        fiscalYear={fiscalYear}
        onClose={() => setDrawer({ open: false, title: "" })}
      />
    </div>
  );
}
