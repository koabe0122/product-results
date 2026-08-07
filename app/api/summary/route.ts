import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getDateRangeForPeriod, currentFiscalYear } from "@/lib/utils";
import { fetchAllRows } from "@/lib/fetchAll";
import type { Period } from "@/lib/utils";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const period = (searchParams.get("period") ?? "all") as Period;
  const fiscalYear = parseInt(
    searchParams.get("fiscalYear") ?? String(currentFiscalYear())
  );
  const department = searchParams.get("department") ?? null;

  const { from, to } = getDateRangeForPeriod(period, fiscalYear);

  const { data: products, error: productsError } = await supabase
    .from("priority_products")
    .select("*, genre:genres(id, name, color)")
    .eq("fiscal_year", fiscalYear);

  if (productsError) {
    return NextResponse.json({ error: productsError.message }, { status: 500 });
  }

  const { data: departments, error: depsError } = await supabase
    .from("departments")
    .select("id, name")
    .order("sort_order");

  if (depsError) {
    return NextResponse.json({ error: depsError.message }, { status: 500 });
  }

  const { data: targets, error: targetsError } = await supabase
    .from("targets")
    .select("*")
    .eq("fiscal_year", fiscalYear);

  if (targetsError) {
    return NextResponse.json({ error: targetsError.message }, { status: 500 });
  }

  const categoryKeys = (products ?? []).map((p) => p.product_name);

  type OrderRow = {
    category_key: string;
    department: string;
    person: string;
    customer_name: string;
    product_name: string;
    slip_date: string;
  };

  const { data: orders, error: ordersError } = await fetchAllRows<OrderRow>(() => {
    let query = supabase
      .from("orders")
      .select("category_key, department, person, customer_name, product_name, slip_date")
      .gte("slip_date", from)
      .lte("slip_date", to)
      .neq("category_key", "");

    if (department && department !== "全社") {
      query = query.eq("department", department);
    }
    if (categoryKeys.length > 0) {
      query = query.in("category_key", categoryKeys);
    }
    return query;
  });

  if (ordersError) {
    return NextResponse.json({ error: ordersError.message }, { status: 500 });
  }

  return NextResponse.json({ products, departments, targets, orders });
}
