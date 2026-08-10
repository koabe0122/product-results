export type CountMode = "line" | "unique_contract";

type OrderLike = {
  category_key: string;
  customer_name: string;
  jan_code?: string;
  product_name?: string;
  slip_date?: string;
};

/** 月額系（客先×商品ユニークで数える） */
const UNIQUE_CONTRACT_PRODUCTS = new Set([
  "ESET",
  "SKYSEA",
  "AppCheck",
  "GoogleWS・M365",
  "AIツール100件受注",
  "勤怠管理拡販",
  "ノンコードツール拡販",
  "電子取引ツール",
]);

export function resolveCountMode(
  productName: string,
  countMode?: CountMode | null
): CountMode {
  if (countMode === "line" || countMode === "unique_contract") return countMode;
  return UNIQUE_CONTRACT_PRODUCTS.has(productName) ? "unique_contract" : "line";
}

/**
 * 施策ごとの実績カウント
 * - line: 受注行数（物販・台数）
 * - unique_contract: 客先×商品コードのユニーク（月額契約）
 */
export function countActual(
  orders: OrderLike[],
  categoryKey: string,
  countMode: CountMode = "line"
): number {
  const rows = orders.filter((o) => o.category_key === categoryKey);
  if (countMode !== "unique_contract") return rows.length;

  const uniq = new Set<string>();
  for (const o of rows) {
    const jan = (o.jan_code ?? "").trim();
    const product = (o.product_name ?? "").trim();
    uniq.add(`${o.customer_name}||${jan || product}`);
  }
  return uniq.size;
}
