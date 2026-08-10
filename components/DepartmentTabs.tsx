"use client";

import { cn } from "@/lib/utils";

interface DepartmentTabsProps {
  departments: string[];
  value: string;
  onChange: (dept: string) => void;
}

export function DepartmentTabs({
  departments,
  value,
  onChange,
}: DepartmentTabsProps) {
  return (
    <div className="-mx-1 overflow-x-auto pb-1">
      <div
        className="flex min-w-max gap-2 px-1"
        role="tablist"
        aria-label="部門選択"
      >
        {departments.map((dept) => {
          const selected = value === dept;
          return (
            <button
              key={dept}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => onChange(dept)}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-semibold whitespace-nowrap transition-all duration-200",
                selected
                  ? "bg-slate-900 text-white shadow-md shadow-slate-900/20"
                  : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              {dept}
            </button>
          );
        })}
      </div>
    </div>
  );
}
