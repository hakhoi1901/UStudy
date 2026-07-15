# Nhật ký cập nhật UStudy Portal Sync

Tài liệu này ghi lại các thay đổi ảnh hưởng đến người dùng và luồng kết nối giữa Extension, HCMUS Portal và UStudy.

## 0.1.7

- Sau lần thiết lập đầu tiên, chế độ thủ công và hỏi trước không tự mở modal lớn khi tải Portal.
- Thay modal bằng thanh điều khiển nhỏ bên phải với hai hành động **Đồng bộ ngay** và **Cài đặt**.
- Tiến trình, kết quả hoặc lỗi đồng bộ được hiển thị ngay trên thanh gọn.
- Modal cấu hình đầy đủ chỉ mở khi người dùng bấm **Cài đặt**; khi đóng, modal thu về thanh gọn.

## 0.1.6

- Chế độ tự động không mở hộp xem trước trên UStudy khi toàn bộ dữ liệu vừa quét đều trùng với dữ liệu đang lưu.
- Gói dữ liệu ghi lại nguồn kích hoạt là `manual` hoặc `auto` để UStudy xử lý đúng theo chế độ.
- Màn hình xem trước thay đổi được tóm tắt theo từng nhóm thông tin: bảng điểm, kết quả đăng ký, danh sách lớp mở, lịch thi và học phí.
- Một môn có thể xuất hiện ở nhiều nhóm nếu nhiều nguồn cùng thay đổi; môn chỉ được khử trùng bên trong cùng một nhóm.

## 0.1.5

- Đồng bộ font của popup Extension và giao diện chèn trên Portal với font hệ thống của UStudy.
- Sử dụng cùng font stack `ui-sans-serif`, `system-ui` và `Segoe UI` để tránh chênh lệch trên Windows.

## 0.1.4

- Thiết kế lại panel trên Portal theo cấu trúc `AppDialog` của UStudy.
- Thêm header xanh, vùng nội dung cuộn độc lập và footer hành động cố định.
- Chế độ tự động chỉ hiện trạng thái quét nhỏ ở góc màn hình, không che nội dung Portal.

## 0.1.3

- Hỗ trợ các Portal có hostname dạng `new-portal{n}.hcmus.edu.vn`.
- Nhận diện trang đăng nhập theo `/Login.aspx`, bao gồm URL có `ReturnUrl` và phần mở rộng phía sau pathname.
- Bổ sung bridge để UStudy nhận diện Extension ổn định hơn, kể cả khi service worker vừa khởi động lại.

## 0.1.2

- Bổ sung ba chế độ đồng bộ: thủ công, hỏi trước và tự động.
- Cho phép chọn các nguồn bảng điểm, đăng ký học phần, lịch thi, danh sách lớp mở và học phí.
- Cho phép chọn năm học, học kỳ và tùy chọn mở UStudy sau khi quét.
- Lưu thiết lập trên thiết bị bằng `chrome.storage.local`.

## 0.1.0 - 0.1.1

- Tạo Extension Manifest V3 và luồng đồng bộ dữ liệu Portal sang UStudy.
- Dùng chung bộ thu thập dữ liệu với Bookmarklet để hai công cụ trả về cùng cấu trúc dữ liệu.
- Dữ liệu chỉ được lưu cục bộ và phải qua màn hình xem trước trước khi nhập vào UStudy.

## Quy tắc tăng phiên bản

- Tăng `extensionVersion` khi thay đổi giao diện, hành vi hoặc file của Extension.
- Tăng `scraperVersion` khi thay đổi cách đọc hoặc chuẩn hóa dữ liệu Portal.
- Tăng `protocolVersion` khi thay đổi không tương thích trong giao tiếp giữa Extension và UStudy.
- Sau khi đổi phiên bản, chạy `npm run build:extension` để cập nhật `dist-extension` và gói ZIP tải xuống.
