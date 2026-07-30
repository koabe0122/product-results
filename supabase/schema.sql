-- ============================================================
-- 重点商材ダッシュボード スキーマ
-- ============================================================

-- ジャンルマスタ
create table if not exists genres (
  id          serial primary key,
  name        text not null unique,
  color       text not null default '#6366f1',
  created_at  timestamptz not null default now()
);

-- 部門マスタ
create table if not exists departments (
  id          serial primary key,
  name        text not null unique,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now()
);

-- 重点商材マスタ（年度ごとに登録）
create table if not exists priority_products (
  id           serial primary key,
  jan_code     text not null,
  product_name text not null,
  genre_id     integer not null references genres(id) on delete restrict,
  fiscal_year  integer not null,
  created_at   timestamptz not null default now(),
  unique (jan_code, fiscal_year)
);

-- 目標値（部門 × 商材 × 年度）
-- department_id が null の場合は全社目標
create table if not exists targets (
  id            serial primary key,
  product_id    integer not null references priority_products(id) on delete cascade,
  department_id integer references departments(id) on delete cascade,
  fiscal_year   integer not null,
  target_count  integer not null default 0,
  created_at    timestamptz not null default now(),
  unique (product_id, department_id, fiscal_year)
);

-- 受注実績（CSV取込データ）
create table if not exists orders (
  id            serial primary key,
  slip_date     date not null,
  jan_code      text not null,
  product_name  text not null,
  customer_name text not null,
  department    text not null,
  person        text not null,
  genre         text not null default '',
  imported_at   timestamptz not null default now(),
  -- 同一受注の重複取込を防止
  unique (slip_date, jan_code, customer_name, person)
);

-- インデックス
create index if not exists idx_orders_slip_date  on orders(slip_date);
create index if not exists idx_orders_jan_code   on orders(jan_code);
create index if not exists idx_orders_department on orders(department);
create index if not exists idx_orders_person     on orders(person);

-- Row Level Security（読み取りはすべて許可、書き込みはサービスロールのみ）
alter table genres           enable row level security;
alter table departments      enable row level security;
alter table priority_products enable row level security;
alter table targets          enable row level security;
alter table orders           enable row level security;

create policy "allow_read_genres"            on genres            for select using (true);
create policy "allow_read_departments"       on departments       for select using (true);
create policy "allow_read_priority_products" on priority_products for select using (true);
create policy "allow_read_targets"           on targets           for select using (true);
create policy "allow_read_orders"            on orders            for select using (true);

-- anon ロールへのアクセス権限付与
grant usage on schema public to anon;
grant select on genres, departments, priority_products, targets, orders to anon;

-- service_role（CSV取込スクリプト）への書き込み権限
grant all on genres, departments, priority_products, targets, orders to service_role;
grant usage, select on all sequences in schema public to service_role;

-- ============================================================
-- サンプルマスタデータ（初期投入用）
-- ============================================================
insert into genres (name, color) values
  ('ドキュメント',   '#3b82f6'),
  ('イン/セキュ',    '#8b5cf6'),
  ('PC・タブレット', '#f59e0b'),
  ('ネットワーク',   '#10b981'),
  ('その他',         '#6b7280')
on conflict (name) do nothing;

insert into departments (name, sort_order) values
  ('全社',       0),
  ('AM第一G',    1),
  ('AM第二G',    2),
  ('AM公共部',   3),
  ('AMオフィス部',4),
  ('本部',       5),
  ('SC部門',     6),
  ('管理部',     7),
  ('村山支店',   8),
  ('新庄営業所', 9),
  ('米沢支店',   10),
  ('酒田支店',   11),
  ('鶴岡支店',   12),
  ('協和マイクロ',13)
on conflict (name) do nothing;
