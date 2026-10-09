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
