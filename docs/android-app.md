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
- WebView không chấp nhận third-party cookie. Dữ liệu crawler chỉ được ghi vào tệp tạm trong cache tối đa 4 MB, chuyển về UStudy, sau đó tệp tạm bị xóa.
- Bản phát hành không bỏ qua cảnh báo chứng chỉ TLS. Khi Portal có lỗi chứng chỉ, hãy kiểm tra mạng/ngày giờ hoặc chờ Portal khắc phục lỗi thay vì tiếp tục truy cập.
- Bản APK công khai phải là release APK có ký số riêng. Không phân phối APK debug.

## Build APK trên Windows

Yêu cầu:

- Node.js và dependencies đã được cài bằng `npm install`.
- JDK 21.
- Android SDK có platform 36 và build-tools 36.0.0.
- `ANDROID_SDK_ROOT`/`ANDROID_HOME`, hoặc SDK nằm tại `D:\Android\Sdk` hay `%LOCALAPPDATA%\Android\Sdk`.

Build bản phát hành:

```powershell
npm run build:apk
```

Lệnh cần bốn biến môi trường: `USTUDY_RELEASE_STORE_FILE`, `USTUDY_RELEASE_STORE_PASSWORD`, `USTUDY_RELEASE_KEY_ALIAS`, `USTUDY_RELEASE_KEY_PASSWORD`. Keystore và các mật khẩu này không được lưu trong repository.

Build debug chỉ để kiểm thử nội bộ:

```powershell
npm run build:apk:debug
```

APK được xuất tại:

```text
artifacts/UStudy-release.apk
```

Bản release cũng được cập nhật vào `public/downloads/UStudy-android.apk`. Bản debug chỉ xuất vào `artifacts/UStudy-debug.apk` và không được đưa vào web.

Nếu chỉ thay đổi native Android, có thể build nhanh trong `android` bằng Gradle. Nếu thay đổi React/crawler, luôn chạy lại `npm run build` và `npx cap sync android` trước khi build APK.
