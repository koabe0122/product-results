"use client";

import { useEffect, useState, useCallback } from "react";
import { X, ChevronRight } from "lucide-react";
import type { OrderDetail } from "@/lib/types";
import type { Period } from "@/lib/utils";

interface OrderDetailDrawerProps {
  open: boolean;
  title: string;
  categoryKey?: string;
  person?: string;
  department?: string;
  period: Period;
  fiscalYear: number;
  onClose: () => void;
}

export function OrderDetailDrawer({
  open,
  title,
  categoryKey,
  person,
  department,
  period,
  fiscalYear,
  onClose,
}: OrderDetailDrawerProps) {
  const [orders, setOrders] = useState<OrderDetail[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    if (!open) return;
    setLoading(true);
    setFetchError(null);
    try {
      const params = new URLSearchParams({ period, fiscalYear: String(fiscalYear) });
      if (categoryKey) params.set("categoryKey", categoryKey);
      if (department && department !== "全社") params.set("department", department);
      if (person) params.set("person", person);

      const res = await fetch(`/api/orders?${params}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setOrders(json.orders ?? []);
    } catch (e) {
      setFetchError(e instanceof Error ? e.message : "データ取得に失敗しました");
    } finally {
      setLoading(false);
    }
  }, [open, categoryKey, person, department, period, fiscalYear]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // ESCキーで閉じる + 背景スクロールロック
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", handleKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      {/* オーバーレイ */}
      <div
        className="fixed inset-0 bg-black/30 z-40"
        onClick={onClose}
      />
      {/* ドロワー */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
        className="fixed right-0 top-0 h-full w-full max-w-lg bg-white z-50 shadow-2xl flex flex-col"
      >
        {/* ヘッダー */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <div>
            <div className="flex items-center gap-1 text-xs text-gray-400 mb-0.5">
              <ChevronRight size={12} />
              <span>詳細</span>
            </div>
            <h2 id="drawer-title" className="text-base font-bold text-gray-800 line-clamp-1">{title}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="閉じる"
            className="p-2 rounded-md hover:bg-gray-100 transition-colors text-gray-500"
          >
            <X size={18} />
          </button>
        </div>

        {/* 件数バッジ */}
        <div className="px-5 py-3 bg-gray-50 border-b border-gray-100">
          <span className="text-sm text-gray-500">
            合計 <span className="text-xl font-bold text-blue-600">{orders.length}</span> 件
          </span>
        </div>

        {/* 一覧 */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-gray-400 text-sm">
              読み込み中...
            </div>
          ) : fetchError ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <p className="text-red-500 text-sm">{fetchError}</p>
              <button
                onClick={fetchOrders}
                className="text-blue-600 underline text-xs"
              >
                再試行
              </button>
            </div>
          ) : orders.length === 0 ? (
            <div className="flex items-center justify-center py-16 text-gray-400 text-sm">
              データがありません
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {orders.map((o, i) => (
                <li key={i} className="px-5 py-3 hover:bg-gray-50">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">
                        {o.customer_name}
                      </p>
                      <p className="text-xs text-gray-500 truncate mt-0.5">
                        {o.product_name}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {o.person}（{o.department}）
                      </p>
                    </div>
                    <div className="text-xs text-gray-400 whitespace-nowrap pt-0.5">
                      {o.slip_date}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}
