# Hướng dẫn Build APK cho UStudy

Tài liệu này hướng dẫn cách build file APK từ source code React/Vite sử dụng Capacitor.

## 1. Yêu cầu hệ thống
- **Node.js**: Để chạy lệnh npm.
- **JDK 21**: Bắt buộc (Capacitor 8+ yêu cầu Java 21). 
  - Đường dẫn trên máy hiện tại: `C:\Program Files\Microsoft\jdk-21.0.11.10-hotspot`
- **Android SDK**: Đã được cài đặt thông qua Android Studio.

## 2. Các bước Build APK (Rút gọn)

Để build một bản APK sạch và mới nhất, hãy mở Terminal tại **thư mục gốc** của dự án (`UStudy`) và chạy dòng lệnh sau:

```powershell
# Bước 1: Build source code React sang thư mục dist
npm run build

# Bước 2: Đồng bộ code đã build vào thư mục Android
npx cap sync android

# Bước 3: Di chuyển vào thư mục android và build APK bằng Gradle (Dùng Java 21)
$env:JAVA_HOME="C:\Program Files\Microsoft\jdk-21.0.11.10-hotspot"
cd android
.\gradlew clean assembleDebug --no-build-cache
cd ..
```

## 3. Vị trí file APK sau khi build
Sau khi lệnh trên chạy thành công, file APK sẽ nằm tại:
`android\app\build\outputs\apk\debug\UStudy-debug.apk`

---

## 4. Giải thích các lệnh quan trọng
- `npm run build`: Chuyển đổi code TSX/Vite thành HTML/JS/CSS thuần trong thư mục `dist`.
- `npx cap sync android`: Copy nội dung từ `dist` vào các assets của Android Studio.
- `.\gradlew clean`: Xóa bỏ các file build cũ để đảm bảo không bị dính cache.
- `--no-build-cache`: Ép buộc Gradle build mới hoàn toàn, không sử dụng lại các thành phần đã lưu trong cache.

## 5. Lưu ý về lỗi thường gặp
- **Lỗi "invalid source release: 21"**: Do bạn đang dùng Java phiên bản thấp hơn 21 (như Java 17 hoặc 8). Hãy đảm bảo chạy lệnh `$env:JAVA_HOME=...` trước khi build.
- **Build thành công nhưng App không đổi**: Do bạn quên chạy `npm run build` hoặc `npx cap sync android` trước khi chạy lệnh Gradle, khiến Android đóng gói code cũ.
