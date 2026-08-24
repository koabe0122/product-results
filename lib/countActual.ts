export type CountMode = "line" | "unique_contract" | "quantity_sum";

type OrderLike = {
  category_key: string;
  customer_name: string;
  jan_code?: string;
  product_name?: string;
  slip_date?: string;
  person?: string;
  department?: string;
  quantity?: number;
};

/** 施策全体を「初回のみ」で数える月額・契約系 */
const UNIQUE_CONTRACT_PRODUCTS = new Set([
  "ESET",
  "SKYSEA",
  "AppCheck",
  "GoogleWS・M365",
  "Dコンサービス",
  "AIツール100件受注",
  "勤怠管理拡販",
  "ノンコードツール拡販",
  "電子取引ツール",
  "介護ソフト",
]);

/** 台数合算（売上数量を積算）で数える施策 */
const QUANTITY_SUM_PRODUCTS = new Set(["MFP"]);

/** 商品名から毎月計上・契約行かを判定 */
export function isRecurringOrder(productName: string): boolean {
  return /月額|利用料|ﾗｲｾﾝｽ|ライセンス|LICENSE|License|更新|年契約|年払い|追加/i.test(
    productName
  );
}

export function resolveCountMode(
  productName: string,
  countMode?: CountMode | null
): CountMode {
  if (
    countMode === "line" ||
    countMode === "unique_contract" ||
    countMode === "quantity_sum"
  )
    return countMode;
  if (QUANTITY_SUM_PRODUCTS.has(productName)) return "quantity_sum";
  return UNIQUE_CONTRACT_PRODUCTS.has(productName) ? "unique_contract" : "line";
}

/** 【更新】【NCE】等を除き、同一SKUとして比較できるようにする */
function normalizeProductName(name: string): string {
  return name
    .replace(/【[^】]*】/g, "")
    .replace(/[（(][^）)]*[）)]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toUpperCase();
}

/**
 * 初回判定キー
 * - unique_contract: 客先×施策（月額更新が別SKU扱いにならないよう施策単位）
 * - line の毎月行: 客先×JAN（なければ正規化商品名）
 */
function contractKey(o: OrderLike, mode: CountMode): string {
  if (mode === "unique_contract") {
    return `${o.customer_name}||${o.category_key}`;
  }
  const jan = (o.jan_code ?? "").trim();
  const product = normalizeProductName(o.product_name ?? "");
  return `${o.customer_name}||${jan || product}`;
}

/** 初回のみ残す（日付が古い順。同日は先勝ち） */
function firstOccurrences(rows: OrderLike[], mode: CountMode): OrderLike[] {
  const sorted = [...rows].sort((a, b) =>
    (a.slip_date ?? "").localeCompare(b.slip_date ?? "")
  );
  const seen = new Set<string>();
  const out: OrderLike[] = [];
  for (const o of sorted) {
    const key = contractKey(o, mode);
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
      result.push(...firstOccurrences(rows, "unique_contract"));
      continue;
    }
    const oneShot = rows.filter((o) => !isRecurringOrder(o.product_name ?? ""));
    const recurringFirst = firstOccurrences(
      rows.filter((o) => isRecurringOrder(o.product_name ?? "")),
      "line"
    );
    result.push(...oneShot, ...recurringFirst);
  }
  return result;
}

/**
 * 施策ごとの実績カウント
 * - unique_contract: すべて初回のみ（客先×商品）
 * - line: 本体は行数、毎月計上行（ライセンス等）は初回のみ
 * - quantity_sum: 台数合算（MFP複写機等、売上数量を積算）
 */
export function countActual(
  orders: OrderLike[],
  categoryKey: string,
  countMode: CountMode = "line"
): number {
  const target = orders.filter((o) => o.category_key === categoryKey);

  if (countMode === "quantity_sum") {
    // 毎月行は初回のみ（件数ではなく台数を合算）
    const filtered = filterOrdersForCounting(target, () => "line");
    return filtered.reduce((sum, o) => sum + (o.quantity ?? 1), 0);
  }

  const filtered = filterOrdersForCounting(target, () => countMode);
  return filtered.length;
}
