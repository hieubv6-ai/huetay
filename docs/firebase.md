# Kết nối Firebase Firestore

CMS dùng **Cloud Firestore** (không dùng Realtime Database) vì dữ liệu dự án, căn và bài viết phù hợp với document/collection.

## Tạo Firebase project

1. Mở https://console.firebase.google.com/.
2. Tạo project mới, ví dụ `huetay-vinhomes-cms`.
3. Vào **Build → Firestore Database → Create database**.
4. Chọn production mode và region gần Việt Nam.
5. Vào **Project settings → Service accounts → Generate new private key**.
6. File JSON tải xuống là secret; không commit lên GitHub và không gửi qua chat.

## Cấu hình backend

Khuyến nghị dùng một biến Render/VPS:

```env
FIREBASE_SERVICE_ACCOUNT_JSON={...toàn bộ nội dung JSON service account...}
ADMIN_PASSWORD=mật-khẩu-admin-mạnh
```

Backend cũng hỗ trợ ba biến riêng:

```env
FIREBASE_PROJECT_ID=...
FIREBASE_CLIENT_EMAIL=...
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\\n...\\n-----END PRIVATE KEY-----\\n
```

Khi có Firebase credentials, thứ tự ưu tiên là:

```text
Firebase Firestore → PostgreSQL → JSON offline fallback
```

## Cấu trúc Firestore

```text
projects/{projectId}
  └── units/{unitId}
articles/{articleId}
site_settings/public
```

## Seed dữ liệu mẫu

```bash
FIREBASE_SERVICE_ACCOUNT_JSON='...' npm run db:seed
```

## Kiểm tra

Sau khi chạy backend, kiểm tra:

- `GET /api/site` trả danh sách dự án/bài viết.
- `/admin.html` đăng nhập được.
- Thêm dự án, thêm căn và viết bài từ admin.
- Tải lại trang chủ thấy dữ liệu mới.

## Bảo mật

- Không đưa service-account JSON vào GitHub.
- Không dùng Firebase client config để thay cho Admin SDK ở backend.
- Dùng Render Environment Secret hoặc file `.env` chmod 600 trên VPS.
- Sao lưu Firestore định kỳ trước khi chỉnh sửa hàng loạt.
- Rules Firestore nên khóa client trực tiếp nếu chỉ backend Node được phép truy cập.
