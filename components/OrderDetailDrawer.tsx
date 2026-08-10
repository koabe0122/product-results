"use client";

import { useEffect, useState, useCallback, useRef } from "react";
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
  const panelRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  const fetchOrders = useCallback(async () => {
    if (!open) return;
    setLoading(true);
    setFetchError(null);
    try {
      const params = new URLSearchParams({
        period,
        fiscalYear: String(fiscalYear),
      });
      if (categoryKey) params.set("categoryKey", categoryKey);
      if (department && department !== "全社") params.set("department", department);
      if (person) params.set("person", person);

      const res = await fetch(`/api/orders?${params}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setOrders(json.orders ?? []);
    } catch (e) {
      setFetchError(
        e instanceof Error ? e.message : "データ取得に失敗しました"
      );
    } finally {
      setLoading(false);
    }
  }, [open, categoryKey, person, department, period, fiscalYear]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    if (!open) return;

    previouslyFocused.current = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusTimer = window.setTimeout(() => {
      closeBtnRef.current?.focus();
    }, 0);

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab" || !panelRef.current) return;

      const focusable = panelRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => {
      window.clearTimeout(focusTimer);
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", handleKey);
      previouslyFocused.current?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-slate-950/45 backdrop-blur-[2px] transition-opacity"
        onClick={onClose}
        aria-hidden
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
        className="fixed right-0 top-0 z-50 flex h-full w-full max-w-lg animate-rise flex-col bg-white shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-950 px-5 py-4 text-white">
          <div className="min-w-0">
            <div className="mb-0.5 flex items-center gap-1 text-[11px] text-teal-300">
              <ChevronRight size={12} />
              <span>詳細</span>
            </div>
            <h2
              id="drawer-title"
              className="font-display text-base font-bold line-clamp-1"
            >
              {title}
            </h2>
          </div>
          <button
            ref={closeBtnRef}
            type="button"
            onClick={onClose}
            aria-label="閉じる"
            className="rounded-lg p-2 text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        <div className="border-b border-slate-100 bg-teal-50/60 px-5 py-3">
          <span className="text-sm text-slate-600">
            合計{" "}
            <span className="font-display text-2xl font-extrabold tabular-nums text-teal-700">
              {orders.length}
            </span>{" "}
            件
          </span>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-sm text-slate-400">
              読み込み中...
            </div>
          ) : fetchError ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16">
              <p className="text-sm text-rose-600">{fetchError}</p>
              <button
                onClick={fetchOrders}
                className="text-xs font-semibold text-teal-700 underline"
              >
                再試行
              </button>
            </div>
          ) : orders.length === 0 ? (
            <div className="flex items-center justify-center py-16 text-sm text-slate-400">
              データがありません
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {orders.map((o, i) => (
                <li
                  key={`${o.slip_date}-${o.customer_name}-${o.product_name}-${i}`}
                  className="px-5 py-3.5 transition-colors hover:bg-slate-50"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-800">
                        {o.customer_name}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-slate-500">
                        {o.product_name}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-400">
                        {o.person}（{o.department}）
                      </p>
                    </div>
                    <div className="whitespace-nowrap pt-0.5 text-xs font-medium tabular-nums text-slate-400">
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
