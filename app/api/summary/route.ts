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
  const department = searchParams.get("department") ?? null;

  const { from, to } = getDateRangeForPeriod(period, fiscalYear);

  // 重点商材マスタ取得
  const { data: products, error: productsError } = await supabase
    .from("priority_products")
    .select("*, genre:genres(id, name, color)")
    .eq("fiscal_year", fiscalYear);

  if (productsError) {
    return NextResponse.json({ error: productsError.message }, { status: 500 });
  }

  // 部門マスタ取得（目標値の名前→ID解決に使用）
  const { data: departments, error: depsError } = await supabase
    .from("departments")
    .select("id, name")
    .order("sort_order");

  if (depsError) {
    return NextResponse.json({ error: depsError.message }, { status: 500 });
  }

  // 目標値取得
  const { data: targets, error: targetsError } = await supabase
    .from("targets")
    .select("*")
    .eq("fiscal_year", fiscalYear);

  if (targetsError) {
    return NextResponse.json({ error: targetsError.message }, { status: 500 });
  }

  // 受注実績取得（期間・部門フィルタ）
  let query = supabase
    .from("orders")
    .select("jan_code, department, person, customer_name, product_name, slip_date")
    .gte("slip_date", from)
    .lte("slip_date", to);

  if (department && department !== "全社") {
    query = query.eq("department", department);
  }

  // 重点商材のJANコードのみに絞る
  const janCodes = (products ?? []).map((p) => p.jan_code);
  if (janCodes.length > 0) {
    query = query.in("jan_code", janCodes);
  }

  const { data: orders, error: ordersError } = await query;

  if (ordersError) {
    return NextResponse.json({ error: ordersError.message }, { status: 500 });
  }

  return NextResponse.json({ products, departments, targets, orders });
}
