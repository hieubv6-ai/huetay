# Huệ Tây Vinhomes CMS

Website tư vấn bất động sản với public site và khu vực quản trị dự án, căn đang bán/cho thuê và bài viết.

## Thành phần

- Public website responsive, SEO metadata và dữ liệu dự án lấy từ `/api/site`.
- Admin tại `/admin.html`.
- API Node.js trong `server.js`.
- Firebase Admin SDK + Cloud Firestore là database production được khuyến nghị.
- PostgreSQL/Supabase vẫn được hỗ trợ làm phương án thay thế.
- Logo monogram HT và bảng màu xanh lavi/xanh biển trong `assets/brand-mark.svg`.

## Chạy local offline

```bash
cp .env.example .env
ADMIN_PASSWORD='local-password' PORT=4173 node server.js
```

Mở `http://localhost:4173/` và `http://localhost:4173/admin.html`.

## Kết nối Firebase Firestore

1. Tạo Firebase project và bật **Cloud Firestore**.
2. Vào **Project settings → Service accounts → Generate new private key**.
3. Đặt toàn bộ JSON service account vào `FIREBASE_SERVICE_ACCOUNT_JSON` trong Render/VPS.
4. Seed dữ liệu mẫu:

```bash
FIREBASE_SERVICE_ACCOUNT_JSON='...' npm run db:seed
```

Chi tiết: [docs/firebase.md](docs/firebase.md).

Thứ tự backend:

```text
Firebase Firestore → PostgreSQL → JSON offline fallback
```

Không commit service account JSON, private key hoặc `.env`.

## Deploy GitHub Pages + Supabase

- GitHub Pages chạy giao diện tĩnh; Supabase chạy database, Auth và RLS.
- Chạy `db/supabase.sql`, sau đó `db/supabase-seed.sql` trong Supabase SQL Editor.
- Tạo tài khoản quản trị trong Supabase Authentication → Users.
- Vào GitHub → Settings → Pages, chọn **GitHub Actions** làm Source.
- Workflow `.github/workflows/pages.yml` sẽ tự deploy sau mỗi lần push lên `main`.
- Hướng dẫn đầy đủ: [docs/github-pages-supabase.md](docs/github-pages-supabase.md).

`server.js` vẫn được giữ để chạy local/offline, nhưng không được GitHub Pages sử dụng.

## Nội dung

Công thức biên tập: **Hook → Bối cảnh → Khác biệt → Phù hợp với ai → Điều cần cân nhắc → CTA**. Xem [docs/content-formula.md](docs/content-formula.md).

## Liên hệ mặc định

- Hotline: 0825 684 139
- Zalo: https://zalo.me/0825684139
- Facebook: https://www.facebook.com/haihau.le.7
