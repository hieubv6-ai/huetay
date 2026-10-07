# Kích hoạt CMS Huệ Tây

Nếu đăng nhập admin đúng nhưng bị quay lại form, nguyên nhân là Supabase chưa có các bảng CMS.

1. Mở Supabase Dashboard của project.
2. Vào **SQL Editor** → **New query**.
3. Mở file [`db/supabase.sql`](../db/supabase.sql).
4. Sao chép toàn bộ nội dung vào SQL Editor.
5. Bấm **Run**.
6. Tải lại `https://huetayvinhomes.com/admin.html` rồi đăng nhập lại.

File SQL tạo các bảng `projects`, `units`, `articles` và `site_settings`, đồng thời bật RLS để người đã đăng nhập có quyền quản trị.
