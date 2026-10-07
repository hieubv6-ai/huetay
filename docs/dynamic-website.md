# Website động nhiều trang

Website hiện dùng GitHub Pages cho frontend và Supabase cho dữ liệu.

## Các trang

- `/` — Trang chủ
- `/du-an/` — Danh mục tất cả dự án trong bảng `projects`
- `/du-an/{slug}/` — Trang chi tiết dự án
- `/bai-viet/` — Danh mục bài viết trong bảng `articles`
- `/bai-viet/{slug}/` — Trang chi tiết bài viết
- `/admin.html` — CMS đăng nhập bằng Supabase Auth

GitHub Pages không có server-side routing, vì vậy `404.html` chứa cùng app shell để URL con vẫn tải được khi người dùng refresh.

## Dữ liệu động

Frontend đọc `projects` và `articles` từ Supabase. Bộ nội dung trong `site-content.js` chỉ là fallback an toàn khi database chưa có dữ liệu hoặc Supabase tạm thời không truy cập được.

Để lưu toàn bộ nội dung chi tiết của dự án, chạy `db/supabase.sql` trong Supabase SQL Editor. Các trường nội dung gồm:

- `hook`
- `context`
- `differences` — JSON array
- `fit_for`
- `considerations`
- `cta`
- `sources` — JSON array
- `updated_note`

Sau đó đăng nhập `/admin.html` để sửa dự án và bài viết. Mọi thay đổi lưu trong Supabase sẽ hiển thị trên frontend ở lần tải kế tiếp, không cần sửa code.

## Lưu ý

- `SUPABASE_ANON_KEY`/publishable key được phép xuất hiện ở frontend; không đưa service-role key vào GitHub.
- Giá, chính sách, pháp lý, tiến độ và điều kiện giao dịch phải cập nhật riêng theo từng sản phẩm.
- Khi thêm dự án mới trong CMS, cần chọn ảnh đã có trong repository hoặc bổ sung ảnh vào repository.
