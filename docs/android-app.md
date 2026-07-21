# UStudy Android

## Luồng đồng bộ Portal

1. Mở **Cài đặt > Công cụ đồng bộ dữ liệu** trong ứng dụng Android.
2. Chọn **Mở Portal và đồng bộ**.
3. Đăng nhập trên trang HCMUS Portal. Phiên đăng nhập được WebView giữ lại cho các lần sau.
4. Sau khi đăng nhập, bấm nút **Đồng bộ với UStudy** ở góc dưới bên phải.
5. Chờ crawler thu thập bảng điểm, đăng ký học phần, lịch thi, học phí và danh sách lớp mở.
6. UStudy tự quay lại màn hình xem trước. Chọn từng nhóm hoặc từng bản ghi cần nhận, sau đó xác nhận import.

Năm học và học kỳ của đăng ký học phần/danh sách lớp mở lấy theo cấu hình học kỳ đang chọn trong UStudy.

## Giới hạn và an toàn

- WebView chỉ cho phép điều hướng trong các host `new-portal<so>.hcmus.edu.vn` qua HTTPS.
- Trang đăng nhập không hiện nút đồng bộ. Nút chỉ xuất hiện sau khi URL không còn là `Login.aspx`.
- Cầu nối JavaScript yêu cầu token riêng cho mỗi phiên và chỉ xử lý khi trang chính đang ở đúng Portal.
- Dữ liệu crawler được ghi vào tệp tạm trong cache, chuyển về UStudy, sau đó tệp tạm bị xóa.
- Bản debug APK chưa phải bản phát hành Play Store và được ký bằng debug key của Android.

## Build APK trên Windows

Yêu cầu:

- Node.js và dependencies đã được cài bằng `npm install`.
- JDK 21.
- Android SDK có platform 36 và build-tools 36.0.0.
- `ANDROID_SDK_ROOT`/`ANDROID_HOME`, hoặc SDK nằm tại `D:\Android\Sdk` hay `%LOCALAPPDATA%\Android\Sdk`.

Chạy:

```powershell
npm run build:apk
```

APK được xuất tại:

```text
artifacts/UStudy-debug.apk
```

Nếu chỉ thay đổi native Android, có thể build nhanh trong `android` bằng Gradle. Nếu thay đổi React/crawler, luôn chạy lại `npm run build` và `npx cap sync android` trước khi build APK.
