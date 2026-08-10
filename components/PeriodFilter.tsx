"use client";

import { cn, PERIOD_LABELS } from "@/lib/utils";
import type { Period } from "@/lib/utils";

const PERIODS: Period[] = ["all", "h1", "h2", "q1", "q2", "q3", "q4", "month"];

interface PeriodFilterProps {
  value: Period;
  onChange: (period: Period) => void;
}

export function PeriodFilter({ value, onChange }: PeriodFilterProps) {
  return (
    <div className="-mx-1 max-w-full overflow-x-auto pb-0.5">
      <div
        className="inline-flex min-w-max gap-1 rounded-2xl bg-white/10 p-1 ring-1 ring-white/15 backdrop-blur"
        role="group"
        aria-label="期間選択"
      >
        {PERIODS.map((p) => (
          <button
            key={p}
            type="button"
            aria-pressed={value === p}
            onClick={() => onChange(p)}
            className={cn(
              "rounded-xl px-3 py-1.5 text-xs font-semibold tracking-wide transition-all duration-200 sm:text-sm",
              value === p
                ? "bg-teal-400 text-slate-950 shadow-[0_6px_16px_-8px_rgba(45,212,191,0.9)]"
                : "text-slate-300 hover:bg-white/10 hover:text-white"
            )}
          >
            {PERIOD_LABELS[p]}
          </button>
        ))}
      </div>
    </div>
  );
}
