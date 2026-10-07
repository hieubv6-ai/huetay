
## AI Writer Studio và chuẩn nội dung chuyên gia

CMS có thêm tab **✍️ AI Writer Studio**. Người biên tập chọn mẫu hoặc nhập bốn nhóm dữ liệu bắt buộc: thông tin cơ bản, điểm mạnh thực tế, hạn chế khảo sát và chân dung khách hàng. Có thể bổ sung dữ liệu di chuyển theo km/phút, pháp lý, đối thủ, giá thuê, vốn tự có, khoản vay và thu nhập hộ gia đình.

Nút **Xem Chuẩn Lệnh AI** hiển thị directive thống nhất: vai trò chuyên gia Hiếu Bùi BĐS với 10 năm kinh nghiệm, loại bỏ ngôn ngữ quảng cáo sáo rỗng, không tự bịa số liệu và phải ghi rõ khi dữ liệu chưa xác minh. Nút **Viết Bài Chuẩn Chuyên Gia 10 Năm** tạo bản xem trước theo 8 phần: sapo, vị trí/hạ tầng, so sánh đối thủ, ưu điểm thực địa, hạn chế, chân dung khách hàng, tài chính, kết luận/CTA.

Bản xem trước dùng Markdown gồm H2, H3, bullet và `**chữ đậm**`. Khi xuất bản, nội dung được lưu trong `articles.content` và frontend hiển thị đúng cấu trúc SEO. Giá tiền, diện tích, phần trăm, số km/phút và thông tin pháp lý cần được nhập trong dữ liệu nguồn để hệ thống in đậm khi viết.

CMS cũng bổ sung cho `projects` các trường `developer`, `scale`, `price`, `travel`, `strengths`, `limitations`, `buyer_profile`, `not_for` và `finance`. Hãy chạy lại file `db/supabase.sql` sau khi cập nhật schema, rồi nhập dữ liệu xác minh cho từng dự án. Không dùng nội dung mẫu làm bằng chứng pháp lý hoặc cam kết giá.
