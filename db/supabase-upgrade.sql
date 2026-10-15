-- Chạy sau db/supabase.sql trong Supabase SQL Editor.
-- Migration an toàn: không xoá dữ liệu cũ.

alter table if exists public.articles
  add column if not exists cover text not null default '';

alter table if exists public.units
  add column if not exists featured boolean not null default false;

insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do update set public = true;

drop policy if exists "public read cms media" on storage.objects;
create policy "public read cms media" on storage.objects
  for select using (bucket_id = 'media');

drop policy if exists "authenticated upload cms media" on storage.objects;
create policy "authenticated upload cms media" on storage.objects
  for insert to authenticated with check (bucket_id = 'media');

drop policy if exists "authenticated update cms media" on storage.objects;
create policy "authenticated update cms media" on storage.objects
  for update to authenticated using (bucket_id = 'media') with check (bucket_id = 'media');

drop policy if exists "authenticated delete cms media" on storage.objects;
create policy "authenticated delete cms media" on storage.objects
  for delete to authenticated using (bucket_id = 'media');

-- Menu và CRM metadata được lưu trong site_settings.value JSONB,
-- không cần thêm bảng và vẫn dùng RLS authenticated hiện có.
insert into public.site_settings(key, value)
values ('menu', '[{"key":"projects","label":"Dự án Vinhomes","href":"/du-an/"},{"key":"articles","label":"Bài viết & phân tích","href":"/bai-viet/"},{"key":"featured-units","label":"Căn nổi bật đang bán","href":"/#can-noi-bat"},{"key":"profile","label":"Về Huệ Tây","href":"/huetay/"},{"key":"method","label":"Phương pháp tư vấn","href":"/#phuong-phap"},{"key":"contact","label":"Liên hệ","href":"/#lien-he"}]'::jsonb)
on conflict (key) do nothing;

insert into public.site_settings(key, value)
values ('crm_meta', '{}'::jsonb)
on conflict (key) do nothing;

-- Tin đăng gian hàng bán và cho thuê.
alter table if exists public.units add column if not exists listing_type text not null default 'Bán';
alter table if exists public.units add column if not exists title text not null default '';
alter table if exists public.units add column if not exists address text not null default '';
alter table if exists public.units add column if not exists bedrooms text not null default '';
alter table if exists public.units add column if not exists bathrooms text not null default '';
alter table if exists public.units add column if not exists direction text not null default '';
alter table if exists public.units add column if not exists furnishing text not null default '';
alter table if exists public.units add column if not exists legal text not null default '';
alter table if exists public.units add column if not exists description text not null default '';
alter table if exists public.units add column if not exists cover text not null default '';
alter table if exists public.units add column if not exists published boolean not null default true;

-- Mỗi tin đăng có URL riêng.
alter table if exists public.units add column if not exists slug text not null default '';
create unique index if not exists units_slug_unique_idx on public.units(slug) where slug <> '';

alter table if exists public.units add column if not exists price_total text not null default '';
alter table if exists public.units add column if not exists price_per_sqm text not null default '';
alter table if exists public.units add column if not exists rent_period text not null default 'tháng';

alter table if exists public.units add column if not exists gallery jsonb not null default '[]'::jsonb;

-- Huetay analytics, public visibility and project gallery
alter table public.projects add column if not exists gallery jsonb not null default '[]'::jsonb;

-- Public site must never read hidden inventory.
drop policy if exists "public can read units" on public.units;
create policy "public can read published units" on public.units for select to anon, authenticated using (published = true or auth.role() = 'authenticated');

create table if not exists public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  event_name text not null check (event_name in ('page_view','article_view','article_click')),
  path text not null default '',
  article_id text,
  session_id text not null,
  device_type text check (device_type in ('desktop','tablet','mobile') or device_type is null),
  referrer text,
  created_at timestamptz not null default now()
);
create index if not exists analytics_events_created_at_idx on public.analytics_events(created_at desc);
create index if not exists analytics_events_event_date_idx on public.analytics_events(event_name, created_at desc);
create index if not exists analytics_events_article_idx on public.analytics_events(article_id, event_name, created_at desc);

alter table public.analytics_events enable row level security;
drop policy if exists "public can create analytics events" on public.analytics_events;
create policy "public can create analytics events" on public.analytics_events for insert to anon, authenticated with check (char_length(session_id) between 10 and 120 and char_length(path) <= 500 and (article_id is null or char_length(article_id) <= 180));
drop policy if exists "authenticated read analytics events" on public.analytics_events;
create policy "authenticated read analytics events" on public.analytics_events for select to authenticated using (true);

create or replace function public.get_analytics_summary(from_date timestamptz, to_date timestamptz)
returns table(today_page_views bigint, unique_visitors bigint, article_views bigint, article_clicks bigint)
language sql stable security definer set search_path = public
as $$
  select
    count(*) filter (where event_name = 'page_view' and created_at >= (now() at time zone 'Asia/Ho_Chi_Minh')::date at time zone 'Asia/Ho_Chi_Minh'),
    count(distinct session_id),
    count(*) filter (where event_name = 'article_view'),
    count(*) filter (where event_name = 'article_click')
  from public.analytics_events
  where created_at >= from_date and created_at < to_date + interval '1 day';
$$;

drop function if exists public.get_analytics_timeseries(timestamptz, timestamptz);
create or replace function public.get_analytics_timeseries(from_date timestamptz, to_date timestamptz)
returns table(day date, page_views bigint, unique_visitors bigint, article_views bigint, article_clicks bigint)
language sql stable security definer set search_path = public
as $$
  select
    (created_at at time zone 'Asia/Ho_Chi_Minh')::date,
    count(*) filter (where event_name = 'page_view'),
    count(distinct session_id),
    count(*) filter (where event_name = 'article_view'),
    count(*) filter (where event_name = 'article_click')
  from public.analytics_events
  where created_at >= from_date and created_at < to_date + interval '1 day'
  group by 1 order by 1 asc limit 366;
$$;

drop function if exists public.get_top_articles(timestamptz, timestamptz, integer);
create or replace function public.get_top_articles(from_date timestamptz, to_date timestamptz, limit_count integer default 10)
returns table(article_id text, title text, views bigint, clicks bigint, ctr numeric)
language sql stable security definer set search_path = public
as $$
  select
    e.article_id,
    coalesce(a.title, e.article_id),
    count(*) filter (where e.event_name = 'article_view'),
    count(*) filter (where e.event_name = 'article_click'),
    case when count(*) filter (where e.event_name = 'article_view') = 0 then 0 else round((count(*) filter (where e.event_name = 'article_click')::numeric / count(*) filter (where e.event_name = 'article_view')) * 100, 1) end
  from public.analytics_events e
  left join public.articles a on a.slug = e.article_id
  where e.article_id is not null and e.created_at >= from_date and e.created_at < to_date + interval '1 day'
  group by e.article_id, a.title
  order by 3 desc, 4 desc
  limit least(greatest(coalesce(limit_count,10),1),50);
$$;

grant execute on function public.get_analytics_summary(timestamptz,timestamptz) to authenticated;
grant execute on function public.get_analytics_timeseries(timestamptz,timestamptz) to authenticated;
grant execute on function public.get_top_articles(timestamptz,timestamptz,integer) to authenticated;
