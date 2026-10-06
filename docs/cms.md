# CMS Huệ Tây Vinhomes

## Chạy local

```bash
ADMIN_PASSWORD='mat-khau-cua-ban' PORT=4173 node server.js
```

Mở `/admin.html` để đăng nhập quản trị. Nếu không đặt `ADMIN_PASSWORD`, server dùng giá trị mặc định không an toàn `change-me-now`; phải đổi trước khi triển khai.

## Dữ liệu quản lý

- Dự án: tên, slug, vị trí, trạng thái, ảnh cover, mô tả, nổi bật.
- Căn: mã căn, loại sản phẩm, diện tích, giá, trạng thái và ghi chú.
- Bài viết: tiêu đề, chuyên mục, mô tả ngắn, nội dung, ngày đăng và trạng thái nháp/đã đăng.
- Cài đặt liên hệ: thương hiệu, hotline, Zalo, Facebook.

Dữ liệu được lưu trong `data/content.json`, phù hợp chạy trên máy chủ Node có ổ đĩa bền vững. Khi deploy lên nền tảng serverless cần đổi sang PostgreSQL/Supabase hoặc database managed.

## Giới hạn hiện tại

- Mật khẩu admin là biến môi trường, chưa có tài khoản nhiều nhân viên.
- Ảnh cover dùng asset có sẵn hoặc đường dẫn tương đối; chưa có upload media.
- Lead form hiện mở Zalo và lưu bản nháp trong trình duyệt; chưa ghi lead vào CMS.
- Cần HTTPS, reverse proxy và database bền vững trước khi dùng production.
