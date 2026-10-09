# Triển khai Huệ Tây Vinhomes – CRM, căn nổi bật và menu động

## 1. Các thay đổi trong gói này

- CRUD bài viết: thêm, sửa, xoá, nháp/đã đăng.
- Upload ảnh cover bài viết qua Supabase Storage.
- CRUD dự án và upload ảnh cover dự án.
- CRUD căn đang bán, đánh dấu căn nổi bật để hiển thị trên trang chủ.
- CRM: lọc khách hàng, cập nhật trạng thái, ghi chú và ngày hẹn tiếp theo.
- Quản trị thanh menu bằng danh sách tính năng có sẵn.
- Trang public đọc menu và căn nổi bật từ Supabase.

## 2. Chạy migration Supabase trước

Đăng nhập đúng project Supabase của website Huệ Tây, mở **SQL Editor**, dán toàn bộ file:

```text
db/supabase-upgrade.sql
```

Sau đó bấm **Run**. Migration này:

- Thêm `articles.cover`.
- Thêm `units.featured`.
- Tạo Storage bucket public tên `media`.
- Tạo policy upload/update/delete ảnh cho tài khoản authenticated.
- Tạo cấu hình menu mặc định trong `site_settings`.
- Tạo metadata CRM trong `site_settings`.

Nếu project Supabase hiện tại chưa chạy schema CMS gốc, chạy trước:

```text
db/supabase.sql
```

## 3. Push lên đúng GitHub repository

Thay URL bên dưới bằng repository GitHub đang liên kết với Base của bạn:

```bash
# Sửa hai đường dẫn này theo máy của bạn
PACKAGE_DIR=/duong-dan/huetayvinhomes-production
REPO_DIR=/duong-dan/Huetayvinhomes

cd "$REPO_DIR"

# Sao lưu trạng thái hiện tại trước khi thay file
BACKUP_DIR="${REPO_DIR}-backup-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"
cp -a . "$BACKUP_DIR/" 2>/dev/null || true

# Chép các file đã nâng cấp vào repository đúng
cp "$PACKAGE_DIR/admin.html" "$PACKAGE_DIR/admin.js" "$PACKAGE_DIR/admin.css" \
   "$PACKAGE_DIR/app.js" "$PACKAGE_DIR/app.css" "$PACKAGE_DIR/site-content.js" \
   "$PACKAGE_DIR/supabase-config.js" "$PACKAGE_DIR/index.html" "$REPO_DIR/"
cp -a "$PACKAGE_DIR/db" "$REPO_DIR/"
cp "$PACKAGE_DIR/DEPLOY-HUETAYVINHOMES.md" "$REPO_DIR/"

# Kiểm tra file trước khi commit
node --check admin.js
node --check app.js
node --check site-content.js

git status
git diff --stat
git add admin.html admin.js admin.css app.js app.css site-content.js supabase-config.js index.html db/supabase-upgrade.sql DEPLOY-HUETAYVINHOMES.md
git commit -m "feat: add CMS CRM featured units and dynamic menu"
git pull --rebase origin main
git push origin main
```

Nếu thư mục repository của bạn có tên khác, thay `/duong-dan/Huetayvinhomes` bằng đường dẫn thật.

## 4. Nếu chưa clone repository

```bash
git clone https://github.com/USERNAME/REPOSITORY.git Huetayvinhomes
cd Huetayvinhomes
```

Khi GitHub yêu cầu đăng nhập, dùng tài khoản GitHub đang được Base sử dụng. Không gửi Personal Access Token trong tin nhắn hoặc commit vào source.

## 5. Deploy lại trên Base

Sau khi `git push origin main` thành công:

1. Mở Base Dashboard bằng đúng tài khoản Huệ Tây.
2. Vào project website đang chạy.
3. Kiểm tra repository/branch đang trỏ tới đúng GitHub repository và `main`.
4. Chọn **Redeploy / Deploy latest commit**.
5. Chờ build hoàn tất.
6. Mở `/admin.html` và đăng nhập bằng tài khoản Supabase Auth.
7. Kiểm tra các tab:
   - Dự án
   - Căn nổi bật
   - Bài viết
   - CRM khách hàng
   - Thanh menu

## 6. Kiểm tra sau deploy

- Tạo một bài viết nháp, upload ảnh, sửa và xoá thử.
- Tạo một dự án, upload ảnh cover.
- Tạo một căn, đánh dấu “Đưa lên mục Căn nổi bật đang bán”.
- Mở trang chủ và kiểm tra mục `/#can-noi-bat`.
- Thêm/bớt menu trong Admin rồi tải lại website.
- Gửi thử form liên hệ và kiểm tra lead trong CRM.

## 7. Nếu upload ảnh báo lỗi

Kiểm tra các điểm sau:

- Đã chạy `db/supabase-upgrade.sql` trên đúng project chưa.
- Storage bucket có tên chính xác là `media` chưa.
- Admin đã đăng nhập Supabase Auth chưa.
- Policy `authenticated upload cms media` đã tồn tại chưa.
- `supabase-config.js` đang trỏ tới đúng Supabase project của website Huệ Tây chưa.

## 8. Lưu ý quan trọng

Gói này đã được kiểm tra cú pháp JavaScript và HTTP cục bộ. Việc website live dùng dữ liệu nào phụ thuộc vào **GitHub repository, Base project và Supabase project đúng tài khoản Huệ Tây**. Không nên push vào repository khác nếu Base không liên kết với repository đó.
