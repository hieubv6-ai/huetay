# PostgreSQL / Supabase

1. Tạo project Supabase hoặc PostgreSQL.
2. Mở SQL Editor và chạy toàn bộ `schema.sql`.
3. Đặt `DATABASE_URL` trong môi trường server. Với Supabase, dùng connection string dạng `postgresql://postgres.<project-ref>:<password>@aws-0-<region>.pooler.supabase.com:6543/postgres`.
4. Chạy `npm run db:seed` để đưa dữ liệu mẫu từ `data/content.json` vào database.
5. Khi `DATABASE_URL` tồn tại, server ưu tiên PostgreSQL; file JSON chỉ là fallback offline cho local development.

Không commit connection string, password hoặc service-role key vào GitHub.
