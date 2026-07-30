"use client";

import { cn, formatCount, achievementColor, progressBarColor } from "@/lib/utils";
import type { ProductSummary } from "@/lib/types";

interface ProductCardProps {
  summary: ProductSummary;
  onCountClick?: (janCode: string, productName: string) => void;
}

export function ProductCard({ summary, onCountClick }: ProductCardProps) {
  const { product, target, actual, rate } = summary;
  const cappedRate = Math.min(rate, 100);

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 flex flex-col gap-3 hover:shadow-md transition-shadow">
      {/* ジャンルバッジ + 商品名 */}
      <div className="flex items-start gap-2">
        <span
          className="inline-block rounded-full px-2 py-0.5 text-xs font-medium text-white shrink-0 mt-0.5"
          style={{ backgroundColor: product.genre?.color ?? "#6366f1" }}
        >
          {product.genre?.name ?? "その他"}
        </span>
        <span className="text-sm font-semibold text-gray-800 leading-snug line-clamp-2">
          {product.product_name}
        </span>
      </div>

      {/* 実績 / 目標 */}
      <div className="flex items-end justify-between">
        <div>
          <button
            onClick={() => onCountClick?.(product.jan_code, product.product_name)}
            className={cn(
              "text-3xl font-bold tabular-nums cursor-pointer hover:underline",
              achievementColor(rate)
            )}
            title="クリックで詳細表示"
          >
            {formatCount(actual)}
          </button>
          <span className="text-gray-400 text-sm ml-1">件</span>
        </div>
        <div className="text-right">
          <div className="text-xs text-gray-400">目標</div>
          <div className="text-base font-semibold text-gray-600">
            {formatCount(target)}件
          </div>
        </div>
      </div>

      {/* プログレスバー */}
      <div>
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>達成率</span>
          <span className={cn("font-bold", achievementColor(rate))}>
            {target > 0 ? `${Math.round(rate)}%` : "—"}
          </span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2">
          <div
            className={cn("h-2 rounded-full transition-all duration-500", progressBarColor(rate))}
            style={{ width: `${cappedRate}%` }}
          />
        </div>
      </div>
    </div>
  );
}
