# Deploy GitHub Pages + Supabase

## 1. Tạo database

Trong Supabase Dashboard → **SQL Editor**, chạy lần lượt:

1. `db/supabase.sql`
2. `db/supabase-seed.sql`

## 2. Tạo tài khoản quản trị

Trong Supabase Dashboard → **Authentication → Users → Add user**:

- Email: `admin@huetayvinhomes.com` hoặc email của bạn
- Mật khẩu: tạo mật khẩu mạnh
- Có thể bật **Auto Confirm User** khi tạo thủ công

Sau đó đăng nhập tại `/admin.html`. Không dùng lại `ADMIN_PASSWORD` cũ của Node.js.

## 3. Bảo mật Auth

Vào **Authentication → Providers → Email** và tắt public sign-up nếu chỉ có một người quản trị. RLS trong `db/supabase.sql` chỉ cho phép user đã đăng nhập sửa CMS.

## 4. Deploy GitHub Pages

Repo đã có workflow `.github/workflows/pages.yml`.

Trong GitHub:

1. Mở repo → **Settings → Pages**.
2. Ở **Build and deployment → Source**, chọn **GitHub Actions**.
3. Push lên branch `main` hoặc chạy workflow thủ công trong tab **Actions**.
4. Chờ workflow `Deploy static site to GitHub Pages` hoàn tất.

Website sẽ có dạng:

```text
https://<github-username>.github.io/<repository-name>/
```

Nếu repo là `hieubv6-ai/huetay`, GitHub có thể publish tại:

```text
https://hieubv6-ai.github.io/huetay/
```

## 5. Cập nhật code

```bash
git add .
git commit -m "Cap nhat website"
git push origin main
```

GitHub Actions sẽ tự deploy lại.

## Bảo mật

- `supabase-config.js` chỉ chứa URL và publishable/anon key; hai giá trị này được phép xuất hiện trong frontend.
- Không đưa `service_role`, database password hoặc `DATABASE_URL` vào repo.
- Không cấp quyền `insert/update/delete` cho role `anon`.
- Khi cần thay đổi quyền CMS, sửa policy RLS trong Supabase SQL Editor.
