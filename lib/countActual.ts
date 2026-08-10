export type CountMode = "line" | "unique_contract";

type OrderLike = {
  category_key: string;
  customer_name: string;
  jan_code?: string;
  product_name?: string;
  slip_date?: string;
  person?: string;
  department?: string;
};

/** 施策全体を「初回のみ」で数える月額・契約系 */
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

/** 商品名から毎月計上・契約行かを判定 */
export function isRecurringOrder(productName: string): boolean {
  return /月額|利用料|ﾗｲｾﾝｽ|ライセンス|LICENSE|License|更新|年契約|年払い/i.test(
    productName
  );
}

export function resolveCountMode(
  productName: string,
  countMode?: CountMode | null
): CountMode {
  if (countMode === "line" || countMode === "unique_contract") return countMode;
  return UNIQUE_CONTRACT_PRODUCTS.has(productName) ? "unique_contract" : "line";
}

function contractKey(o: OrderLike): string {
  const jan = (o.jan_code ?? "").trim();
  const product = (o.product_name ?? "").trim();
  return `${o.customer_name}||${jan || product}`;
}

/** 初回のみ残す（日付が古い順。同日は先勝ち） */
function firstOccurrences(rows: OrderLike[]): OrderLike[] {
  const sorted = [...rows].sort((a, b) =>
    (a.slip_date ?? "").localeCompare(b.slip_date ?? "")
  );
  const seen = new Set<string>();
  const out: OrderLike[] = [];
  for (const o of sorted) {
    const key = contractKey(o);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(o);
  }
  return out;
}

/**
 * 集計用に行を間引く（毎月行は客先×商品の初回のみ残す）
 * unique_contract 施策は全行を初回のみにする
 */
export function filterOrdersForCounting(
  orders: OrderLike[],
  getMode: (categoryKey: string) => CountMode = () => "line"
): OrderLike[] {
  const byCategory = new Map<string, OrderLike[]>();
  for (const o of orders) {
    if (!o.category_key) continue;
    if (!byCategory.has(o.category_key)) byCategory.set(o.category_key, []);
    byCategory.get(o.category_key)!.push(o);
  }

  const result: OrderLike[] = [];
  for (const [categoryKey, rows] of byCategory) {
    const mode = getMode(categoryKey);
    if (mode === "unique_contract") {
      result.push(...firstOccurrences(rows));
      continue;
    }
    const oneShot = rows.filter((o) => !isRecurringOrder(o.product_name ?? ""));
    const recurringFirst = firstOccurrences(
      rows.filter((o) => isRecurringOrder(o.product_name ?? ""))
    );
    result.push(...oneShot, ...recurringFirst);
  }
  return result;
}

/**
 * 施策ごとの実績カウント
 * - unique_contract: すべて初回のみ（客先×商品）
 * - line: 本体は行数、毎月計上行（ライセンス等）は初回のみ
 */
export function countActual(
  orders: OrderLike[],
  categoryKey: string,
  countMode: CountMode = "line"
): number {
  const filtered = filterOrdersForCounting(
    orders.filter((o) => o.category_key === categoryKey),
    () => countMode
  );
  return filtered.length;
}
