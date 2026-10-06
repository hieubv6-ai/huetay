create extension if not exists pgcrypto;

create table if not exists projects (
  id text primary key,
  name text not null,
  slug text not null unique,
  location text not null default '',
  status text not null default 'Đang cập nhật',
  cover text not null default '',
  summary text not null default '',
  description text not null default '',
  featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists units (
  id text primary key,
  project_id text not null references projects(id) on delete cascade,
  code text not null,
  type text not null default 'Căn hộ',
  area text not null default '',
  price text not null default 'Liên hệ',
  status text not null default 'Đang bán',
  note text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists articles (
  id text primary key,
  title text not null,
  slug text not null unique,
  category text not null default 'Kinh nghiệm',
  excerpt text not null default '',
  content text not null default '',
  published_at date not null default current_date,
  status text not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists site_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create index if not exists units_project_id_idx on units(project_id);
create index if not exists articles_status_date_idx on articles(status, published_at desc);

insert into site_settings(key,value) values ('public', '{"brand":"Huệ Tây Vinhomes","hotline":"0825684139","zalo":"https://zalo.me/0825684139","facebook":"https://www.facebook.com/haihau.le.7"}') on conflict (key) do nothing;
