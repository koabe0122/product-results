import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type Period =
  | "all"
  | "h1"
  | "h2"
  | "q1"
  | "q2"
  | "q3"
  | "q4"
  | "month";

export const PERIOD_LABELS: Record<Period, string> = {
  all: "通期",
  h1: "上半期",
  h2: "下半期",
  q1: "Q1",
  q2: "Q2",
  q3: "Q3",
  q4: "Q4",
  month: "当月",
};

/** 会計年度は4月始まり */
export function getDateRangeForPeriod(
  period: Period,
  fiscalYear: number
): { from: string; to: string } {
  const y = fiscalYear;
  switch (period) {
    case "all":
      return { from: `${y}-04-01`, to: `${y + 1}-03-31` };
    case "h1":
      return { from: `${y}-04-01`, to: `${y}-09-30` };
    case "h2":
      return { from: `${y}-10-01`, to: `${y + 1}-03-31` };
    case "q1":
      return { from: `${y}-04-01`, to: `${y}-06-30` };
    case "q2":
      return { from: `${y}-07-01`, to: `${y}-09-30` };
    case "q3":
      return { from: `${y}-10-01`, to: `${y}-12-31` };
    case "q4":
      return { from: `${y + 1}-01-01`, to: `${y + 1}-03-31` };
    case "month": {
      const now = new Date();
      const mm = String(now.getMonth() + 1).padStart(2, "0");
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
      return {
        from: `${now.getFullYear()}-${mm}-01`,
        to: `${now.getFullYear()}-${mm}-${String(lastDay).padStart(2, "0")}`,
      };
    }
  }
}

/** 今日の日付から現在の会計年度を返す (4月始まり) */
export function currentFiscalYear(): number {
  const now = new Date();
  return now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
}

export function formatCount(n: number): string {
  return n.toLocaleString("ja-JP");
}

export function achievementColor(rate: number): string {
  if (rate >= 100) return "text-emerald-600";
  if (rate >= 80) return "text-amber-500";
  return "text-red-500";
}

export function progressBarColor(rate: number): string {
  if (rate >= 100) return "bg-emerald-500";
  if (rate >= 80) return "bg-amber-400";
  return "bg-red-400";
}
