"use client";

import { cn, formatCount } from "@/lib/utils";
import type { PersonSummary } from "@/lib/types";

interface RankingTableProps {
  persons: PersonSummary[];
  onPersonClick?: (person: string, department: string) => void;
}

export function RankingTable({ persons, onPersonClick }: RankingTableProps) {
  if (persons.length === 0) {
    return (
      <div className="py-12 text-center text-sm text-slate-400">
        データがありません
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            <th className="w-10 px-4 py-3 text-left">#</th>
            <th className="px-4 py-3 text-left">氏名</th>
            <th className="px-4 py-3 text-left">部署</th>
            <th className="px-4 py-3 text-right">受注件数</th>
          </tr>
        </thead>
        <tbody>
          {persons.map((p, i) => {
            const rank = i + 1;
            const medal =
              rank === 1
                ? "bg-amber-400 text-amber-950"
                : rank === 2
                  ? "bg-slate-300 text-slate-800"
                  : rank === 3
                    ? "bg-orange-300 text-orange-950"
                    : "bg-slate-100 text-slate-500";

            return (
              <tr
                key={`${p.person}-${p.department}`}
                role="button"
                tabIndex={0}
                className="cursor-pointer border-b border-slate-100 transition-colors hover:bg-teal-50/70 focus:bg-teal-50 focus:outline-none"
                onClick={() => onPersonClick?.(p.person, p.department)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onPersonClick?.(p.person, p.department);
                  }
                }}
              >
                <td className="px-4 py-3">
                  <span
                    className={cn(
                      "inline-flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold",
                      medal
                    )}
                  >
                    {rank}
                  </span>
                </td>
                <td className="px-4 py-3 font-semibold text-slate-800">
                  {p.person}
                </td>
                <td className="px-4 py-3 text-slate-500">{p.department}</td>
                <td className="px-4 py-3 text-right font-display text-base font-bold tabular-nums text-teal-700">
                  {formatCount(p.totalCount)}
                  <span className="ml-0.5 text-xs font-medium text-slate-400">
                    件
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
