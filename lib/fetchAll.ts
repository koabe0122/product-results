const PAGE_SIZE = 1000;

type QueryResult<T> = {
  data: T[] | null;
  error: { message: string } | null;
};

type RangeQuery<T> = {
  range: (from: number, to: number) => PromiseLike<QueryResult<T>>;
};

/**
 * Supabase の既定上限（1000行）を超えて全件取得する。
 */
export async function fetchAllRows<T>(
  buildQuery: () => RangeQuery<T>
): Promise<QueryResult<T>> {
  const all: T[] = [];
  let from = 0;

  for (;;) {
    const { data, error } = await buildQuery().range(from, from + PAGE_SIZE - 1);
    if (error) return { data: null, error };
    const page = data ?? [];
    all.push(...page);
    if (page.length < PAGE_SIZE) break;
    from += PAGE_SIZE;
  }

  return { data: all, error: null };
}
