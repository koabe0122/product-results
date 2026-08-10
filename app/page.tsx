"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { PeriodFilter } from "@/components/PeriodFilter";
import { DepartmentTabs } from "@/components/DepartmentTabs";
import { ProductCard } from "@/components/ProductCard";
import { RankingTable } from "@/components/RankingTable";
import { OrderDetailDrawer } from "@/components/OrderDetailDrawer";
import { currentFiscalYear } from "@/lib/utils";
import { countActual, resolveCountMode } from "@/lib/countActual";
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

  // 担当者サマリー計算
  const persons: PersonSummary[] = useMemo(() => {
    const personMap = new Map<string, PersonSummary>();
    for (const o of data?.orders ?? []) {
      const key = `${o.person}__${o.department}`;
      if (!personMap.has(key)) {
        personMap.set(key, {
          person: o.person,
          department: o.department,
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
          productName: o.product_name,
          count: 1,
        });
      }
    }
    return Array.from(personMap.values()).sort(
      (a, b) => b.totalCount - a.totalCount
    );
  }, [data?.orders]);

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
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-lg font-bold text-gray-800">
                重点商材 受注状況
              </h1>
              <p className="text-xs text-gray-500">{fiscalYear}年度</p>
            </div>
            <PeriodFilter value={period} onChange={setPeriod} />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* 部門タブ */}
        <DepartmentTabs
          departments={departments}
          value={department}
          onChange={setDepartment}
        />

        {/* エラー */}
        {error && (
          <div
            role="alert"
            className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm flex items-center gap-2"
          >
            <span className="font-semibold">エラー:</span> {error}
            <button
              onClick={fetchData}
              className="ml-auto text-red-600 underline text-xs"
            >
              再試行
            </button>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-lg border border-gray-200 h-40 animate-pulse"
              />
            ))}
          </div>
        ) : (
          <>
            {/* 商材カード — ジャンルごとにセクション分け */}
            {!error && genreGroups.length > 0 ? (
              genreGroups.map(([genreName, genre]) => {
                const filtered = productSummaries.filter(
                  (s) => (s.product.genre?.name ?? "その他") === genreName
                );
                if (filtered.length === 0) return null;
                return (
                  <section key={genreName}>
                    <div className="flex items-center gap-2 mb-3">
                      <span
                        className="w-3 h-3 rounded-full inline-block"
                        style={{ backgroundColor: genre?.color ?? "#6b7280" }}
                        aria-hidden="true"
                      />
                      <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                        {genreName}
                      </h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {filtered.map((s) => (
                        <ProductCard
                          key={s.product.id}
                          summary={s}
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
              <div className="text-center py-16 text-gray-500 text-sm">
                重点商材が登録されていません。
                <br />
                Supabase の priority_products テーブルにデータを追加してください。
              </div>
            ) : null}

            {/* 担当者ランキング */}
            {!error && persons.length > 0 && (
              <section aria-labelledby="ranking-heading">
                <h2
                  id="ranking-heading"
                  className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-3"
                >
                  メンバーランキング — 全{persons.length}名
                </h2>
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
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

      {/* ドリルダウン ドロワー */}
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
