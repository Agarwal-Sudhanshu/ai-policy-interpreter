create table organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text,
  created_at timestamp default now()
);

create table products (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id),
  name text not null,
  created_at timestamp default now()
);

create table policies (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references products(id),
  name text not null,
  status text default 'active',
  created_at timestamp default now()
);

create table documents (
  id uuid primary key default gen_random_uuid(),
  policy_id uuid references policies(id),
  file_path text,
  text_content text,
  uploaded_at timestamp default now()
);

create table policy_rules (
  id uuid primary key default gen_random_uuid(),
  policy_id uuid references policies(id),
  rule_type text,
  rule_value text,
  rule_condition text,
  source_text text
);