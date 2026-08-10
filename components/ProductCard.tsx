"use client";

import { cn, formatCount, achievementColor, progressBarColor } from "@/lib/utils";
import { resolveCountMode } from "@/lib/countActual";
import type { ProductSummary } from "@/lib/types";

interface ProductCardProps {
  summary: ProductSummary;
  index?: number;
  onCountClick?: (categoryKey: string, productName: string) => void;
}

export function ProductCard({ summary, index = 0, onCountClick }: ProductCardProps) {
  const { product, target, actual, rate } = summary;
  const cappedRate = Math.min(rate, 100);
  const mode = resolveCountMode(product.product_name, product.count_mode);
  const unit = product.product_name === "MFP" && mode === "line" ? "台" : "件";
  const genreColor = product.genre?.color ?? "#0f766e";

  return (
    <button
      type="button"
      onClick={() => onCountClick?.(product.product_name, product.product_name)}
      className={cn(
        "group animate-rise relative flex w-full flex-col gap-4 rounded-2xl bg-white p-4 text-left",
        "ring-1 ring-slate-200/80 shadow-[var(--shadow)]",
        "transition-all duration-300 hover:-translate-y-1 hover:ring-teal-300/70 hover:shadow-xl",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
      )}
      style={{ animationDelay: `${Math.min(index, 8) * 40}ms` }}
    >
      <span
        className="absolute inset-y-3 left-0 w-1 rounded-full"
        style={{ backgroundColor: genreColor }}
        aria-hidden
      />

      <div className="flex items-start justify-between gap-2 pl-2">
        <h3 className="font-display text-[15px] font-bold leading-snug text-slate-900 line-clamp-2">
          {product.product_name}
        </h3>
        <span className="shrink-0 pt-0.5 text-xs font-semibold text-slate-400 transition group-hover:text-teal-600">
          詳細 ›
        </span>
      </div>

      <div className="flex items-end justify-between gap-3 pl-2">
        <div>
          <div className="font-display text-4xl font-extrabold tabular-nums tracking-tight text-slate-900">
            {formatCount(actual)}
            <span className="ml-1 text-sm font-semibold text-slate-500">{unit}</span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-[11px] font-medium text-slate-400">目標</div>
          <div className="text-base font-bold tabular-nums text-slate-700">
            {formatCount(target)}
            <span className="text-xs font-medium text-slate-400">{unit}</span>
          </div>
        </div>
      </div>

      <div className="pl-2">
        <div className="mb-1.5 flex justify-between text-[11px] font-semibold">
          <span className="text-slate-500">達成率</span>
          <span className={achievementColor(rate, target > 0)}>
            {target > 0 ? `${Math.round(rate)}%` : "—"}
          </span>
        </div>
        <div
          className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100"
          role="progressbar"
          aria-valuenow={Math.round(cappedRate)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`達成率 ${Math.round(rate)}%`}
        >
          <div
            className={cn(
              "progress-fill h-full rounded-full transition-[width] duration-500",
              progressBarColor(rate, target > 0)
            )}
            style={{ width: `${target > 0 ? cappedRate : 0}%` }}
          />
        </div>
      </div>
    </button>
  );
}
