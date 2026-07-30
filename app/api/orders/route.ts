import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getDateRangeForPeriod, currentFiscalYear } from "@/lib/utils";
import type { Period } from "@/lib/utils";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const period = (searchParams.get("period") ?? "all") as Period;
  const fiscalYear = parseInt(
    searchParams.get("fiscalYear") ?? String(currentFiscalYear())
  );
  const janCode = searchParams.get("janCode");
  const department = searchParams.get("department") ?? null;

  const { from, to } = getDateRangeForPeriod(period, fiscalYear);

  let query = supabase
    .from("orders")
    .select("slip_date, jan_code, product_name, customer_name, department, person")
    .gte("slip_date", from)
    .lte("slip_date", to)
    .order("slip_date", { ascending: false });

  if (janCode) query = query.eq("jan_code", janCode);
  if (department && department !== "全社") query = query.eq("department", department);

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ orders: data });
}
