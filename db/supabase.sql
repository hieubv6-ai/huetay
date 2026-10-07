-- Chạy toàn bộ file này trong Supabase Dashboard → SQL Editor.
-- Schema cho website động nhiều trang Huệ Tây Vinhomes.
create extension if not exists pgcrypto;

create table if not exists projects (
  id text primary key,
  name text not null,
  slug text not null unique,
  location text not null default '',
  developer text not null default '',
  scale text not null default '',
  price text not null default '',
  travel jsonb not null default '[]'::jsonb,
  strengths jsonb not null default '[]'::jsonb,
  limitations jsonb not null default '[]'::jsonb,
  buyer_profile text not null default '',
  not_for text not null default '',
  finance text not null default '',
  status text not null default 'Đang cập nhật',
  cover text not null default '',
  summary text not null default '',
  description text not null default '',
  hook text not null default '',
  context text not null default '',
  differences jsonb not null default '[]'::jsonb,
  fit_for text not null default '',
  considerations text not null default '',
  cta text not null default '',
  sources jsonb not null default '[]'::jsonb,
  updated_note text not null default '',
  featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Nếu bảng projects đã tồn tại từ bản cũ, các dòng này bổ sung trường mới an toàn.
alter table projects add column if not exists developer text not null default '';
alter table projects add column if not exists scale text not null default '';
alter table projects add column if not exists price text not null default '';
alter table projects add column if not exists travel jsonb not null default '[]'::jsonb;
alter table projects add column if not exists strengths jsonb not null default '[]'::jsonb;
alter table projects add column if not exists limitations jsonb not null default '[]'::jsonb;
alter table projects add column if not exists buyer_profile text not null default '';
alter table projects add column if not exists not_for text not null default '';
alter table projects add column if not exists finance text not null default '';
alter table projects add column if not exists hook text not null default '';
alter table projects add column if not exists context text not null default '';
alter table projects add column if not exists differences jsonb not null default '[]'::jsonb;
alter table projects add column if not exists fit_for text not null default '';
alter table projects add column if not exists considerations text not null default '';
alter table projects add column if not exists cta text not null default '';
alter table projects add column if not exists sources jsonb not null default '[]'::jsonb;
alter table projects add column if not exists updated_note text not null default '';

create table if not exists units (
  id text primary key, project_id text not null references projects(id) on delete cascade,
  code text not null, type text not null default 'Căn hộ', area text not null default '',
  price text not null default 'Liên hệ', status text not null default 'Đang bán', note text not null default '',
  created_at timestamptz not null default now()
);
create table if not exists articles (
  id text primary key, title text not null, slug text not null unique,
  category text not null default 'Kinh nghiệm', excerpt text not null default '', content text not null default '',
  published_at date not null default current_date, status text not null default 'draft',
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  name text not null default '',
  phone text not null default '',
  interest text not null default '',
  message text not null default '',
  page text not null default '',
  status text not null default 'Mới',
  created_at timestamptz not null default now()
);
create index if not exists leads_created_at_idx on leads(created_at desc);

create table if not exists site_settings (key text primary key, value jsonb not null default '{}'::jsonb, updated_at timestamptz not null default now());
create index if not exists units_project_id_idx on units(project_id);
create index if not exists articles_status_date_idx on articles(status, published_at desc);
insert into site_settings(key,value) values ('public','{"brand":"Huệ Tây Vinhomes","hotline":"0825684139","zalo":"https://zalo.me/0825684139","facebook":"https://www.facebook.com/haihau.le.7"}') on conflict (key) do nothing;

alter table projects enable row level security; alter table units enable row level security; alter table articles enable row level security; alter table site_settings enable row level security; alter table leads enable row level security;
drop policy if exists "public can read projects" on projects; create policy "public can read projects" on projects for select using (true);
drop policy if exists "public can read units" on units; create policy "public can read units" on units for select using (true);
drop policy if exists "public can read published articles" on articles; create policy "public can read published articles" on articles for select using (status = 'published' or auth.role() = 'authenticated');
drop policy if exists "public can read settings" on site_settings; create policy "public can read settings" on site_settings for select using (true);
drop policy if exists "public can create leads" on leads; create policy "public can create leads" on leads for insert to anon, authenticated with check (true);
drop policy if exists "authenticated read leads" on leads; create policy "authenticated read leads" on leads for select to authenticated using (true);
drop policy if exists "authenticated manage leads" on leads; create policy "authenticated manage leads" on leads for update, delete to authenticated using (true) with check (true);
drop policy if exists "authenticated manage projects" on projects; create policy "authenticated manage projects" on projects for all to authenticated using (true) with check (true);
drop policy if exists "authenticated manage units" on units; create policy "authenticated manage units" on units for all to authenticated using (true) with check (true);
drop policy if exists "authenticated manage articles" on articles; create policy "authenticated manage articles" on articles for all to authenticated using (true) with check (true);
drop policy if exists "authenticated manage settings" on site_settings; create policy "authenticated manage settings" on site_settings for all to authenticated using (true) with check (true);
