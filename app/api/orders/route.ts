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
  const categoryKey = searchParams.get("categoryKey");
  const department = searchParams.get("department") ?? null;
  const person = searchParams.get("person") ?? null;

  const { from, to } = getDateRangeForPeriod(period, fiscalYear);

  type OrderRow = {
    slip_date: string;
    jan_code: string;
    product_name: string;
    customer_name: string;
    department: string;
    person: string;
    category_key: string;
  };

  const { data, error } = await fetchAllRows<OrderRow>(() => {
    let query = supabase
      .from("orders")
      .select(
        "slip_date, jan_code, product_name, customer_name, department, person, category_key"
      )
      .gte("slip_date", from)
      .lte("slip_date", to)
      .order("slip_date", { ascending: false });

    if (categoryKey) query = query.eq("category_key", categoryKey);
    if (department && department !== "全社") query = query.eq("department", department);
    if (person) query = query.eq("person", person);
    return query;
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ orders: data });
}
