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
    <div className="flex flex-wrap gap-1 border-b border-gray-200 pb-2">
      {departments.map((dept) => (
        <button
          key={dept}
          onClick={() => onChange(dept)}
          className={cn(
            "px-3 py-1.5 rounded-t-md text-sm font-medium transition-colors whitespace-nowrap",
            value === dept
              ? "bg-blue-600 text-white"
              : "text-gray-600 hover:bg-gray-100"
          )}
        >
          {dept}
        </button>
      ))}
    </div>
  );
}
