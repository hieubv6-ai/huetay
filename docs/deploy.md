# Deploy Node.js + PostgreSQL

## Render

1. Push repo lên GitHub.
2. Render → New → Web Service → chọn repo.
3. Build command: `npm ci`.
4. Start command: `npm start`.
5. Environment:
   - `NODE_VERSION=20`
   - `PORT=10000` (Render cung cấp; server phải đọc `process.env.PORT`)
   - `ADMIN_PASSWORD=<mật khẩu mạnh>`
   - `DATABASE_URL=<Supabase pooler hoặc Render PostgreSQL URL>`
6. Chạy SQL trong `db/schema.sql` tại Supabase SQL Editor.
7. Seed một lần từ máy có quyền database: `DATABASE_URL='...' npm run db:seed`.
8. Kiểm tra `/api/site`, `/admin.html`, login admin.
9. Gắn domain trong Render → Custom Domains; cập nhật DNS theo hướng dẫn Render.
10. Bật auto-deploy sau khi pipeline ổn định.

Không dùng file JSON làm nguồn production trên Render nếu service không có persistent disk. Không commit `.env`.

## VPS Ubuntu 22.04/24.04

```bash
sudo apt update && sudo apt install -y nginx git curl
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g pm2
sudo mkdir -p /var/www/huetayvinhomes
sudo chown -R $USER:$USER /var/www/huetayvinhomes
git clone <REPO_URL> /var/www/huetayvinhomes
cd /var/www/huetayvinhomes
npm ci
```

Tạo `/var/www/huetayvinhomes/.env` (chmod 600):

```env
PORT=3000
ADMIN_PASSWORD=thay-bang-mat-khau-rat-manh
DATABASE_URL=postgresql://...
```

Chạy:

```bash
set -a; . ./.env; set +a
npm run db:seed
pm2 start server.js --name huetay-cms --update-env
pm2 save
pm2 startup
```

Nginx `/etc/nginx/sites-available/huetayvinhomes`:

```nginx
server {
  listen 80;
  server_name huetayvinhomes.com www.huetayvinhomes.com;
  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/huetayvinhomes /etc/nginx/sites-enabled/huetayvinhomes
sudo nginx -t && sudo systemctl reload nginx
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d huetayvinhomes.com -d www.huetayvinhomes.com
```

## Vận hành bắt buộc

- Sao lưu database hằng ngày.
- Không dùng mật khẩu mặc định.
- Cập nhật Node/OS/PM2.
- Chỉ mở cổng 22, 80, 443; dùng SSH key.
- Kiểm tra log `pm2 logs huetay-cms`.
- Sau mỗi deploy kiểm tra public API, admin login và form.
