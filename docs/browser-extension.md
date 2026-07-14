# UStudy Portal Sync Extension

Extension và Bookmarklet sử dụng chung bộ thu thập tại `src/logic/Bookmarklet.js`. Extension chỉ thay đổi cách khởi chạy và chuyển gói dữ liệu sang UStudy.

## Build extension

```powershell
npm run build:extension
```

Lệnh tạo:

- `dist-extension/`: thư mục dùng với **Load unpacked**.
- `public/downloads/ustudy-portal-sync.zip`: gói tải từ trang Cài đặt của UStudy.

`npm run build` tự build extension trước khi build web để file ZIP luôn được đưa vào bản deploy.

## Cài trên Chrome hoặc Edge

1. Chạy `npm run build:extension`.
2. Mở `chrome://extensions` hoặc `edge://extensions`.
3. Bật chế độ dành cho nhà phát triển.
4. Chọn **Load unpacked** và trỏ tới thư mục `dist-extension`.
5. Mở lại trang Cài đặt của UStudy để kiểm tra trạng thái **Đã kết nối**.

## Luồng đồng bộ

1. Content script nhận diện các host dạng `new-portal{n}.hcmus.edu.vn`.
2. Người dùng chọn nguồn dữ liệu và chế độ đồng bộ.
3. Background service worker chạy `portal-runner.js` trong MAIN world của tab Portal.
4. Runner dùng session Portal hiện tại để đọc các trang điểm, đăng ký học phần, lịch thi, học phí và lớp mở.
5. Gói kết quả được giữ trong `chrome.storage.local`.
6. UStudy chủ động yêu cầu gói đang chờ bằng request ID riêng.
7. UStudy mở màn hình xem trước; chỉ những bản ghi được chọn mới được áp dụng.

Extension không đọc mật khẩu, không sao chép cookie và không gửi dữ liệu sinh viên lên máy chủ.

## Chế độ hoạt động

- `manual`: chỉ chạy khi người dùng bấm đồng bộ.
- `ask`: hiện lời nhắc trên Portal trước mỗi lần chạy. Đây là mặc định.
- `auto`: tự chạy một lần cho mỗi tab Portal sau khi đăng nhập. Khi quét chỉ hiện một thanh tiến trình nhỏ.

Sau hai lần thành công ở chế độ `ask`, extension mới đề xuất bật `auto`. Thu thập có thể tự động nhưng UStudy luôn yêu cầu xác nhận trước khi ghi dữ liệu.

Trên mọi host dạng `new-portal{n}.hcmus.edu.vn`, extension coi pathname `/Login.aspx` là trang chưa đăng nhập. Query như `?ReturnUrl=%2f` và phần pathname nối sau `Login.aspx` không làm thay đổi kết quả này. Khi URL đã rời trang đăng nhập, tab được phép đồng bộ. Cấu hình chế độ, nguồn dữ liệu và học kỳ chỉ nằm trong popup Extension; trang web UStudy chỉ hiển thị trạng thái kết nối.

Bridge gắn phiên bản extension vào thuộc tính `data-ustudy-extension-version` trên thẻ `<html>`. Nhờ đó UStudy vẫn nhận diện được extension khi service worker đang khởi động, đồng thời extension tự chèn bridge vào các tab UStudy đã mở sau khi cài đặt hoặc cập nhật.

## Cập nhật phiên bản

Các phiên bản và URL nằm trong `src/portal-sync/config.json`:

- `protocolVersion`: giao thức giữa UStudy và extension.
- `scraperVersion`: phiên bản parser Portal dùng chung với Bookmarklet.
- `extensionVersion`: phiên bản trong manifest.

Sau khi sửa parser hoặc cấu hình, chạy lại `npm run build:extension` và bấm **Reload** tại trang quản lý extension.

## Kiểm tra nhanh

```powershell
npm run typecheck
npm run build:extension
node --check dist-extension/background.js
node --check dist-extension/portal-content.js
node --check dist-extension/app-bridge.js
node --check dist-extension/popup.js
npm run build
```

Để kiểm tra crawler thực tế, cần đăng nhập Portal bằng tài khoản sinh viên. Xác nhận lần lượt trạng thái tiến trình trên Portal, gói chờ trong popup extension và màn hình xem trước thay đổi tại UStudy.
