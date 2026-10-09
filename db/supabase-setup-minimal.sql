-- Dán toàn bộ file này vào Supabase SQL Editor rồi bấm Run.
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

create table if not exists site_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

insert into site_settings(key, value) values
('profile', '{"name":"Huệ Tây","title":"Cố vấn bất động sản","bio":"Đã hỗ trợ tư vấn và đồng hành cùng nhiều nhà đầu tư trên thị trường.","experience":"10 năm kinh nghiệm tư vấn bất động sản","certifications":"","achievements":"","phone":"0825 684 139","zalo":"https://zalo.me/0825684139"}'::jsonb)
on conflict (key) do nothing;

alter table projects enable row level security;
alter table units enable row level security;
alter table articles enable row level security;
alter table leads enable row level security;
alter table site_settings enable row level security;

drop policy if exists "public read projects" on projects;
create policy "public read projects" on projects for select using (true);
drop policy if exists "public read units" on units;
create policy "public read units" on units for select using (true);
drop policy if exists "public read published articles" on articles;
create policy "public read published articles" on articles for select using (status = 'published' or auth.role() = 'authenticated');
drop policy if exists "public create leads" on leads;
create policy "public create leads" on leads for insert to anon, authenticated with check (true);
drop policy if exists "authenticated read leads" on leads;
create policy "authenticated read leads" on leads for select to authenticated using (true);
drop policy if exists "authenticated manage leads" on leads;
create policy "authenticated manage leads" on leads for update, delete to authenticated using (true) with check (true);
drop policy if exists "public read settings" on site_settings;
create policy "public read settings" on site_settings for select using (true);
drop policy if exists "authenticated manage projects" on projects;
create policy "authenticated manage projects" on projects for all to authenticated using (true) with check (true);
drop policy if exists "authenticated manage units" on units;
create policy "authenticated manage units" on units for all to authenticated using (true) with check (true);
drop policy if exists "authenticated manage articles" on articles;
create policy "authenticated manage articles" on articles for all to authenticated using (true) with check (true);
drop policy if exists "authenticated manage settings" on site_settings;
create policy "authenticated manage settings" on site_settings for all to authenticated using (true) with check (true);

select 'CMS schema ready' as result;
