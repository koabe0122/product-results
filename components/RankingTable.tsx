"use client";

import { cn, formatCount, achievementColor } from "@/lib/utils";
import type { PersonSummary } from "@/lib/types";

interface RankingTableProps {
  persons: PersonSummary[];
  onPersonClick?: (person: string, department: string) => void;
}

export function RankingTable({ persons, onPersonClick }: RankingTableProps) {
  if (persons.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400 text-sm">
        データがありません
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 text-gray-500 text-xs">
            <th className="text-left py-2 px-3 w-8">#</th>
            <th className="text-left py-2 px-3">氏名</th>
            <th className="text-left py-2 px-3">部署</th>
            <th className="text-right py-2 px-3">受注件数</th>
          </tr>
        </thead>
        <tbody>
          {persons.map((p, i) => (
            <tr
              key={`${p.person}-${p.department}`}
              role="button"
              tabIndex={0}
              className="border-b border-gray-100 hover:bg-blue-50 cursor-pointer transition-colors focus:outline-none focus:bg-blue-50"
              onClick={() => onPersonClick?.(p.person, p.department)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onPersonClick?.(p.person, p.department);
                }
              }}
            >
              <td className="py-2.5 px-3 text-gray-400 font-mono">{i + 1}</td>
              <td className="py-2.5 px-3 font-medium text-gray-800">{p.person}</td>
              <td className="py-2.5 px-3 text-gray-500">{p.department}</td>
              <td className={cn("py-2.5 px-3 text-right font-bold tabular-nums", achievementColor(p.totalCount > 0 ? 100 : 0))}>
                {formatCount(p.totalCount)}
                <span className="text-gray-400 font-normal ml-0.5 text-xs">件</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
