export interface Genre {
  id: number;
  name: string;
  color: string;
}

export interface PriorityProduct {
  id: number;
  jan_code: string | null;
  product_name: string;
  genre_id: number;
  fiscal_year: number;
  match_patterns: string[];
  genre?: Genre;
}

export interface Department {
  id: number;
  name: string;
  sort_order: number;
}

export interface Target {
  id: number;
  product_id: number;
  department_id: number | null;
  fiscal_year: number;
  target_count: number;
  priority_product?: PriorityProduct;
  department?: Department;
}

export interface Order {
  id: number;
  slip_date: string;
  jan_code: string;
  product_name: string;
  customer_name: string;
  department: string;
  person: string;
  genre: string;
  category_key: string;
  imported_at: string;
}

export interface ProductSummary {
  product: PriorityProduct;
  target: number;
  actual: number;
  rate: number;
}

export interface DepartmentSummary {
  department: string;
  products: ProductSummary[];
  totalTarget: number;
  totalActual: number;
}

export interface PersonSummary {
  person: string;
  department: string;
  totalCount: number;
  byProduct: { categoryKey: string; productName: string; count: number }[];
}

export interface OrderDetail {
  slip_date: string;
  person: string;
  department: string;
  customer_name: string;
  product_name: string;
  jan_code: string;
  category_key: string;
}
