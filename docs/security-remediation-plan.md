# Kế hoạch khắc phục và nâng cấp bảo mật UStudy

> Tài liệu triển khai dựa trên đợt rà soát ngày 2026-08-06. Đây là kế hoạch kỹ thuật để sửa, kiểm thử, migration và phát hành; không thay thế chính sách quyền riêng tư dành cho người dùng.

## 1. Thông tin tài liệu

| Thuộc tính | Giá trị |
| --- | --- |
| Trạng thái | Đề xuất, chưa bắt đầu triển khai |
| Ngày lập | 2026-08-06 |
| Phạm vi | Web UStudy, API chat, Chrome Extension, Bookmarklet, Android app, import/export và truyền dữ liệu quang học |
| Người phụ trách | Chưa phân công |
| Tài liệu liên quan | `docs/security_architecture.md`, `docs/security_scan_report.md`, `docs/local-storage-schema.md` |

## 2. Mục tiêu

1. Không phát hành APK debug hoặc APK có cơ chế bỏ qua lỗi TLS.
2. Không để trang web không được tin cậy đọc dữ liệu Portal do extension thu thập.
3. Không để API AI công khai trở thành điểm tiêu thụ quota, rò dữ liệu hoặc prompt injection ngoài kiểm soát.
4. Làm cho tuyên bố quyền riêng tư khớp với luồng dữ liệu thực tế.
5. Chuẩn hóa lưu trữ, import, export, migration và khôi phục để không gây mất dữ liệu.
6. Bảo vệ dữ liệu khi truyền qua file, QR, extension và Android WebView.
7. Thiết lập quy trình phát hành có ký số, kiểm tra dependency, secret và artifact.
8. Có tiêu chí nghiệm thu và rollback rõ ràng cho từng thay đổi.

### Không nằm trong phạm vi

- Thay đổi logic nghiệp vụ tính GPA, học phí, lịch học hoặc xếp lịch.
- Xây backend tài khoản và đồng bộ cloud hoàn chỉnh.
- Cam kết chống được thiết bị đã root, trình duyệt bị chiếm quyền hoặc máy người dùng đã nhiễm mã độc.
- Chứng nhận theo một tiêu chuẩn pháp lý cụ thể. Việc tuân thủ pháp luật cần được rà soát riêng khi sản phẩm có người dùng thật.

## 3. Phạm vi dữ liệu và ranh giới tin cậy

### 3.1 Dữ liệu cần bảo vệ

| Mức | Ví dụ | Chính sách mặc định |
| --- | --- | --- |
| Rất nhạy cảm | Cookie/phiên Portal, khóa mã hóa, API key, mã ghép nối một lần | Không log, không export mặc định, không lưu plaintext lâu dài |
| Nhạy cảm | Họ tên, MSSV, điểm, GPA, học phí, đăng ký học phần, lịch thi, phòng học | Mã hóa khi lưu nếu có khóa; chỉ truyền khi có đồng ý rõ ràng |
| Cá nhân hóa | Kế hoạch học tập, mục tiêu điểm, lịch đã lưu, tùy chọn solver, lịch sử chat | Có schema, retention và quyền xóa/export rõ ràng |
| Công khai | Chương trình đào tạo, học phí công bố, sơ đồ tòa nhà | Có thể lưu plaintext; vẫn cần kiểm tra tính toàn vẹn khi import |
| Nội bộ runtime | Cờ UI, phiên bản migration, cache tạm | Không đưa vào backup người dùng nếu không cần thiết |

### 3.2 Ranh giới tin cậy

1. HCMUS Portal và phiên đăng nhập của người dùng.
2. Extension background, content script và script chạy trong main world.
3. Origin UStudy production, preview deployment, localhost và các trang web khác.
4. Trình duyệt, `localStorage`, IndexedDB và khóa mã hóa trong RAM.
5. Vercel Function `/api/chat` và nhà cung cấp AI bên ngoài.
6. Android WebView, CookieManager, FileProvider và bộ nhớ thiết bị.
7. File JSON backup và chuỗi QR truyền dữ liệu.

Mọi dữ liệu đi qua một ranh giới phải có ít nhất: xác thực nguồn, kiểm tra schema, giới hạn kích thước, xử lý lỗi và quy tắc lưu/xóa.

## 4. Danh mục công việc ưu tiên

| ID | Hạng mục | Mức độ | Giai đoạn | Trạng thái |
| --- | --- | --- | --- | --- |
| SEC-01 | Loại bỏ bỏ qua TLS trong Android Portal | Critical | P0 | Hoàn thành |
| SEC-02 | Phát hành APK release có ký số, không public debug APK | Critical | P0 | Đang chờ keystore release |
| SEC-03 | Thu hẹp quyền và xác thực sender của extension | Critical | P0 | Hoàn thành, cần test trình duyệt thủ công |
| SEC-04 | Bảo vệ API chat và loại bỏ API key phía client | High | P0-P1 | Tạm hoãn theo yêu cầu |
| SEC-05 | Sửa thông báo quyền riêng tư, consent và log nhạy cảm | High | P0 | Hoàn thành một phần, phần chatbot tạm hoãn |
| SEC-06 | Chuẩn hóa registry và repository lưu trữ | High | P1 | Chưa làm |
| SEC-07 | Làm lại đổi mật khẩu/PIN và xử lý lỗi mã hóa | High | P1-P2 | Tạm hoãn phần mật khẩu; rekey chưa làm |
| SEC-08 | Hợp nhất import/export và restore theo transaction | High | P1 | Hoàn thành một phần |
| SEC-09 | Mã hóa backup và truyền dữ liệu quang học | Medium-High | P2 | Chưa làm |
| SEC-10 | Cập nhật dependency và bảo vệ chuỗi cung ứng | High | P0-P1 | Hoàn thành một phần, còn residual React Router |
| SEC-11 | Thêm CSP và security headers cho web | High | P1 | Đã cấu hình, cần kiểm tra sau deploy |
| SEC-12 | Hardening CSV, ICS và dữ liệu nén từ URL | Medium | P1 | Hoàn thành |
| SEC-13 | Bảo vệ dữ liệu và phiên Portal trên Android | High | P1-P2 | Hoàn thành một phần |
| SEC-14 | Quản lý vòng đời pending import của extension | High | P1 | Hoàn thành |
| SEC-15 | CI bảo mật, giám sát và quy trình sự cố | Medium-High | P2-P3 | Chưa làm |

## 5. Lộ trình phát hành

### Cập nhật thực hiện, 2026-08-06

- Đã loại bỏ đường bỏ qua TLS, tắt backup Android, tắt third-party cookie và giới hạn tệp kết quả Portal 4 MB.
- `npm run build:apk` hiện chỉ build release có ký; `npm run build:apk:debug` là lệnh nội bộ và không phát hành APK qua web. APK debug cũ đã được gỡ khỏi `public/downloads/`.
- Extension production chỉ chạy trên Portal và `https://ustudy.hakhoi.io.vn`; localhost/preview nằm trong profile development riêng. Sender được kiểm tra theo action, pending packet có TTL 30 phút và chỉ ACK sau import thành công.
- Đã bỏ log packet Portal và dữ liệu input/result của solver; phần log và quyền riêng tư chatbot được tạm hoãn theo yêu cầu.
- Đã bỏ `xlsx`, dependency Git `analytics` và package `tsc` thừa; thêm override bản vá cho `tar` và `brace-expansion`. `npm audit --omit=dev` còn cảnh báo React Router RSC/server-action, không áp dụng với SPA hiện tại nhưng vẫn cần theo dõi khi có phiên bản vá.
- Đã thêm CSP/security headers, harden CSV/ICS/link nhóm và giới hạn JSON backup hiện tại. Chưa có transaction/migration storage đầy đủ.

### P0: Chặn rủi ro khẩn cấp, 0-2 ngày

- [ ] SEC-01: không cho WebView tiếp tục khi chứng chỉ TLS lỗi.
- [ ] SEC-02: gỡ APK debug khỏi `public/` và ngừng dùng `assembleDebug` cho bản phân phối.
- [ ] SEC-03: bỏ localhost/preview khỏi manifest production; chặn action extension không đúng sender.
- [ ] SEC-04: tắt hoặc giới hạn `/api/chat` cho đến khi có validation và rate limit.
- [ ] SEC-05: xóa log chứa dữ liệu học tập; sửa nội dung quyền riêng tư sai.
- [ ] SEC-10: cập nhật các dependency có bản vá trực tiếp và loại package thừa.
- [ ] Gắn nhãn release hiện tại là không phù hợp để phân phối nếu còn APK debug/TLS bypass.

### P1: Chuẩn hóa luồng dữ liệu, 3-7 ngày

- [ ] SEC-04: hoàn thiện API proxy AI an toàn.
- [ ] SEC-06: thêm storage registry, typed repository và migration bước đầu.
- [ ] SEC-08: chỉ còn một dịch vụ import/export, có preview và transaction.
- [ ] SEC-11: triển khai CSP Report-Only, sau đó chuyển sang enforce.
- [ ] SEC-12: hardening CSV, ICS và dữ liệu nhóm trong URL.
- [ ] SEC-13: thu hẹp FileProvider, cookie và file tạm Android.
- [ ] SEC-14: TTL, ACK đúng thời điểm và dọn pending packet.

### P2: Nâng cấp mật mã và quyền riêng tư, 2-4 tuần

- [ ] SEC-07: rekey hai pha, mật khẩu mạnh hơn, hỗ trợ Argon2id sau benchmark.
- [ ] SEC-09: backup mã hóa và optical sync có chế độ bảo mật.
- [ ] SEC-13: dùng Android Keystore, tùy chọn sinh trắc học và notification privacy.
- [ ] Đưa extension lên Chrome Web Store hoặc thiết lập bản ZIP có ký/checksum.
- [ ] Hoàn thiện consent AI, analytics và màn hình xóa dữ liệu/phiên Portal.

### P3: Duy trì liên tục

- [ ] SEC-15: CI security, SBOM, dependency review và secret scanning.
- [ ] Rà soát threat model trước mỗi tính năng truyền dữ liệu mới.
- [ ] Kiểm tra dependency hàng tuần; kiểm thử phục hồi backup mỗi release.
- [ ] Diễn tập thu hồi extension/APK và xoay secret tối thiểu mỗi quý.

## 6. Kế hoạch chi tiết

### SEC-01: Loại bỏ cơ chế bỏ qua TLS trên Android

**Vấn đề**

`PortalSyncActivity.java` hiện cho phép người dùng tiếp tục sau lỗi `SSL_UNTRUSTED` nếu CN của chứng chỉ giống `*.hcmus.edu.vn`. CN không chứng minh chứng chỉ được CA đáng tin cậy ký; chứng chỉ tự ký giả mạo vẫn có thể đáp ứng điều kiện này.

**Thiết kế đích**

- Gọi `handler.cancel()` cho mọi `SslError`.
- Hiển thị màn hình lỗi có hostname, loại lỗi và hướng dẫn kiểm tra ngày giờ/mạng.
- Chỉ dùng system trust store. Nếu Portal thực sự cần pinning, dùng public-key pin chính thức với ít nhất một backup pin và kế hoạch xoay pin.
- Không có nút "Tiếp tục" và không cache fingerprint của chứng chỉ lỗi.

**File chính**

- `android/app/src/main/java/com/ustudy/app/PortalSyncActivity.java`

**Các bước**

1. Xóa nhánh `handler.proceed()` và cache fingerprint.
2. Tách UI lỗi TLS thành hàm chỉ đọc, không nhận callback tiếp tục.
3. Ghi log kỹ thuật dạng mã lỗi, không ghi cookie, URL query hoặc nội dung Portal.
4. Kiểm thử với chứng chỉ hợp lệ, hết hạn, sai hostname và tự ký.

**Nghiệm thu**

- Không còn `handler.proceed()` trong source và APK decompile.
- MITM bằng chứng chỉ tự ký luôn thất bại.
- Portal hợp lệ vẫn mở được trên Android 8+ theo minSdk thực tế.

**Rollback**

Không rollback về bỏ qua TLS. Nếu Portal có sự cố chứng chỉ, tạm dừng đồng bộ và thông báo cho người dùng.

### SEC-02: Quy trình phát hành Android release

**Vấn đề**

Script hiện tạo `assembleDebug`, APK public dùng Android Debug certificate, manifest build có `debuggable=true` và backup ứng dụng đang bật.

**Thiết kế đích**

- Bản tải công khai phải là release có ký số riêng hoặc Android App Bundle qua Play App Signing.
- Keystore và mật khẩu chỉ nằm trong secret store của máy build/CI.
- Release bật R8 và resource shrinking sau khi kiểm thử tương thích Capacitor.
- Không đóng APK cũ vào web bundle trước khi tạo APK mới.

**File chính**

- `scripts/build-android.ps1`
- `android/app/build.gradle`
- `android/app/src/main/AndroidManifest.xml`
- `android/app/src/main/res/xml/file_paths.xml`
- `.github/workflows/` nếu dùng CI release

**Các bước**

1. Gỡ `public/downloads/UStudy-android.apk` debug khỏi kênh phân phối.
2. Tạo keystore release ngoài repository; sao lưu khóa theo quy trình hai người/phương án recovery.
3. Đọc cấu hình signing từ biến môi trường hoặc `keystore.properties` bị gitignore.
4. Đổi script phân phối sang `bundleRelease` cho Play hoặc `assembleRelease` cho tải trực tiếp.
5. Đặt `debuggable=false`, bật `minifyEnabled` và `shrinkResources` sau vòng test.
6. Tắt backup hoặc khai báo `dataExtractionRules` chỉ cho dữ liệu được phép.
7. Thu hẹp FileProvider, không dùng `<external-path path=".">`.
8. Xuất SHA-256, version code, version name và signer fingerprint cùng release note.

**Migration**

Người đang cài APK debug có thể không nâng cấp trực tiếp sang APK release do khác signer. Cần thông báo xuất backup, gỡ bản debug, cài bản release và nhập lại dữ liệu. Không xóa bản debug công khai trước khi có hướng dẫn migration rõ ràng nếu đã có người dùng thật.

**Nghiệm thu**

- `apksigner verify --print-certs` không còn Android Debug certificate.
- Manifest release có `debuggable=false`; backup và FileProvider đúng chính sách.
- CI không log mật khẩu keystore.
- Cài mới, nâng version và Portal sync đều qua smoke test.

### SEC-03: Thu hẹp trust boundary của extension

**Vấn đề**

Manifest production cho phép `*.vercel.app`, localhost và `127.0.0.1`; app bridge có fallback theo hostname. Một trang local không đáng tin có thể gọi action lấy pending packet. Một số action trong background chưa kiểm tra sender và cấu hình học kỳ chưa được validate chặt.

**Thiết kế đích**

- Tách manifest/config development và production.
- Production chỉ chấp nhận origin UStudy chính thức, liệt kê chính xác.
- Mỗi action có ma trận quyền: Portal content, UStudy app bridge, popup hoặc internal background.
- Background xác thực `sender.id`, `sender.url`/`sender.origin`, loại context và payload schema trước khi xử lý.
- Mọi nội dung chèn vào UI dùng DOM API và `textContent`/`value`, không nội suy dữ liệu vào `innerHTML`.

**File chính**

- `extension/manifest.json`
- `extension/background.js`
- `extension/app-bridge.js`
- `extension/portal-content.js`
- `src/portal-sync/config.json`

**Các bước**

1. Tạo `manifest.production.json` và `manifest.development.json` hoặc script sinh manifest.
2. Loại `*.vercel.app`, localhost và `127.0.0.1` khỏi production artifact.
3. Tạo helper `assertAuthorizedSender(action, sender)` và gọi trước mọi switch action.
4. Chỉ cho UStudy production lấy/ACK pending import; chỉ Portal content được gửi crawl result.
5. Validate settings bằng schema; `academicYear` phải đúng định dạng được hỗ trợ, học kỳ thuộc enum.
6. Thay `innerHTML` có dữ liệu động bằng `createElement`, `textContent` và thuộc tính an toàn.
7. Thêm automated tests cho action x sender matrix và origin giả mạo.

**Nghiệm thu**

- Trang localhost và preview domain không thể gọi GET/ACK pending import từ extension production.
- Message sai schema hoặc sender bị từ chối với lỗi chung, không rò nội dung packet.
- Không còn dynamic `innerHTML` chứa settings hoặc dữ liệu Portal.

### SEC-04: Bảo vệ API chat và khóa nhà cung cấp AI

**Vấn đề**

`/api/chat` chưa có xác thực, rate limit, giới hạn body, timeout và origin policy. Client có thể điều khiển system instruction/history. Code còn hỗ trợ gọi Groq trực tiếp bằng biến `VITE_*`, có nguy cơ nhúng API key vào bundle.

**Thiết kế đích**

- Chỉ server giữ Gemini/Groq key; không có `VITE_*_API_KEY`.
- Server tự xây system prompt từ template cố định.
- Client gửi DTO tối thiểu, có version và schema rõ ràng.
- Rate limit theo IP và installation token không định danh; cân nhắc Turnstile khi bị lạm dụng.
- Timeout/AbortController, kích thước body tối đa, giới hạn số message và độ dài từng message.
- Response dùng `Cache-Control: no-store`; lỗi trả về mã chung, log có request ID nhưng không chứa PII/nội dung chat.

**File chính**

- `api/chat.ts`
- `src/logic/ai/aiService.ts`
- `src/logic/ai/geminiService.ts`
- `src/logic/ai/groqService.ts`
- `.env.example`

**Các bước**

1. Tạm đặt feature flag tắt AI nếu API chưa được harden.
2. Xóa fallback đọc `VITE_GEMINI_API_KEY`/`VITE_GROQ_API_KEY` và direct provider client.
3. Thêm schema validator cho request; giới hạn ví dụ 32-64 KB sau khi đo payload thực tế.
4. Chỉ nhận dữ liệu học tập theo field allowlist; không nhận system prompt từ client.
5. Thêm rate limiter có storage phù hợp với Vercel serverless.
6. Thêm timeout, retry có giới hạn và circuit breaker/budget kill switch.
7. Thiết lập cảnh báo quota và dashboard lỗi không chứa dữ liệu cá nhân.

**Nghiệm thu**

- Quét production JS/APK không tìm thấy API key pattern.
- Request quá lớn, quá nhanh, sai origin hoặc sai schema bị từ chối.
- Người dùng không thể thay system instruction qua request.
- Provider timeout không giữ function chạy vô hạn và không trả stack trace.

### SEC-05: Quyền riêng tư, consent và logging

**Vấn đề**

UI hiện tuyên bố không gửi dữ liệu lên server, nhưng chatbot gửi bối cảnh học tập tới AI và app dùng Vercel Analytics. Một số console log chứa bối cảnh sinh viên, prompt/reply, packet Portal và dữ liệu xếp lịch.

**Thiết kế đích**

- Chính sách quyền riêng tư phản ánh đúng dữ liệu, mục đích, bên nhận và retention.
- AI là opt-in. Trước lần gửi đầu tiên, hiển thị nhóm trường dữ liệu sẽ gửi và nhà cung cấp.
- Dữ liệu được tối thiểu hóa; không gửi tên/MSSV nếu câu hỏi không cần.
- Analytics có disclosure và opt-out, hoặc gỡ hoàn toàn.
- Font được self-host để tránh request không cần thiết tới Google.
- Production logger tự động redact khóa nhạy cảm và tắt debug log.

**File chính**

- `src/features/settings/components/PrivacySecurity.tsx`
- `src/features/chatbot/components/ChatbotWidget.tsx`
- `src/logic/ai/geminiService.ts`
- `src/logic/ai/groqService.ts`
- `src/logic/Bookmarklet.js`
- `src/logic/Scheduler.ts`
- `src/App.tsx`
- `src/components/security/SecurityLock.tsx`

**Nghiệm thu**

- Không còn log chứa tên, MSSV, điểm, lịch, prompt, reply hoặc packet đầy đủ trong production.
- Consent AI có thể thu hồi; sau khi thu hồi không còn gửi request.
- Nội dung Privacy khớp với Network panel và source code.
- Người dùng có thể tắt analytics nếu vẫn giữ analytics.

### SEC-06: Storage registry và repository thống nhất

**Vấn đề**

Danh sách key nhạy cảm và cách lưu thực tế không đồng nhất. `saveToStorage` vẫn là alias plaintext; nhiều tính năng tự gọi `localStorage` nên khó migration, export và xóa dữ liệu đúng cách.

**Thiết kế đích**

Mỗi key phải được khai báo một lần trong storage registry:

```ts
interface StorageDefinition<T> {
  key: string;
  schemaVersion: number;
  sensitivity: 'public' | 'personal' | 'sensitive' | 'runtime';
  codec: StorageCodec<T>;
  defaultValue: () => T;
  exportable: boolean;
  syncable: boolean;
  retention?: { maxAgeDays?: number; maxEntries?: number };
  migrate?: Record<number, (value: unknown) => unknown>;
}
```

Tính năng chỉ truy cập qua repository bất đồng bộ: `get`, `set`, `remove`, `listExportable`, `migrateAll`. Dữ liệu lớn hoặc cần transaction chuyển sang IndexedDB; không đổi chỉ vì muốn đổi công nghệ.

**File chính**

- `src/helpers/localStorage/save.tsx`
- `src/context/CryptoContext.tsx`
- các hook/component đang gọi trực tiếp `localStorage`
- `docs/local-storage-schema.md`

**Các bước**

1. Lập inventory key và gắn owner cho từng key.
2. Tạo registry và adapter đọc tương thích dữ liệu cũ.
3. Di chuyển từng feature theo nhóm, không đổi tất cả trong một commit.
4. Với key nhạy cảm: đọc plaintext cũ, validate, mã hóa và chỉ xóa bản cũ sau khi đọc lại thành công.
5. Ghi migration version và journal để resume sau crash.
6. Bỏ khóa khỏi `window[Symbol.for(...)]` ở production; nếu cần HMR chỉ bật trong DEV.
7. Cập nhật tài liệu schema từ registry hoặc có test bảo đảm tài liệu không lệch.

**Nghiệm thu**

- Không có direct `localStorage.setItem` ngoài storage layer và các ngoại lệ được ghi chú.
- Mỗi key có schema, sensitivity, exportability và migration version.
- Migration chạy lại nhiều lần không làm mất/nhân đôi dữ liệu.
- Quota/corruption được báo rõ, không giả vờ lưu thành công.

### SEC-07: Mật khẩu, khóa mã hóa và đổi PIN an toàn

**Vấn đề**

Mật khẩu tối thiểu bốn ký tự quá yếu; lockout ở `sessionStorage` có thể reset. `changePin` ghi salt mới trước khi toàn bộ ciphertext mới được kiểm chứng, có thể khiến dữ liệu cũ không giải mã được khi thao tác lỗi giữa chừng. Hàm lưu/đọc còn nuốt lỗi.

**Thiết kế đích**

- Passphrase tối thiểu 10-12 ký tự hoặc strength meter có quy tắc tương đương; không gọi là PIN nếu cho phép chuỗi dài.
- Ưu tiên Argon2id WASM sau benchmark trên điện thoại yếu; giữ PBKDF2 làm đường migration/fallback.
- Android có thể giữ data-encryption key ngẫu nhiên trong Keystore, mở bằng sinh trắc học tùy chọn.
- Rekey hai pha có journal và commit marker.

**Quy trình rekey**

1. Xác thực mật khẩu cũ.
2. Đọc, giải mã và validate toàn bộ selected secure keys. Có một key lỗi thì dừng.
3. Sinh salt/key mới; mã hóa vào namespace tạm.
4. Đọc lại và verify toàn bộ ciphertext tạm.
5. Ghi marker `prepared`.
6. Commit ciphertext mới.
7. Ghi salt và verify token mới sau cùng.
8. Ghi marker `committed`, rồi mới dọn dữ liệu cũ.
9. Khi app khởi động, nếu thấy journal dang dở thì rollback hoặc resume theo trạng thái.

**Nghiệm thu**

- Mô phỏng quota exceeded/crash tại từng bước không làm mất khả năng mở dữ liệu cũ.
- Sai mật khẩu, ciphertext hỏng và key thiếu là ba lỗi phân biệt được ở storage layer.
- Không có hàm lưu secure nào nuốt exception rồi trả thành công.

### SEC-08: Import, export và restore theo transaction

**Vấn đề**

Repo có nhiều luồng importer. Một luồng ghi key trực tiếp trước khi xác thực đầy đủ; validator chấp nhận envelope quá rộng; restore gọi `localStorage.clear()` rồi ghi tuần tự. File lớn hoặc lỗi quota có thể gây treo hoặc mất dữ liệu một phần.

**Thiết kế đích**

- Một `BackupService` duy nhất cho JSON import/export, optical sync và extension import.
- Envelope có `magic`, `formatVersion`, `createdAt`, `source`, `appVersion`, manifest key và checksum.
- Chỉ key trong registry với `exportable=true` mới được xử lý.
- Mỗi key có schema và migration riêng.
- Preview vẫn cho chọn từng mục/nhóm, nhưng apply phải theo journal/transaction.
- Internal keys, crypto key, session, cache và pending packet không được export.

**File chính**

- `src/features/settings/components/SettingUserProfile.tsx`
- `src/features/settings/components/importData.tsx`
- `src/features/settings/services/system-backup.ts`
- `src/helpers/localStorage/save.tsx`

**Các bước**

1. Chọn importer chính và xóa/redirect importer cũ.
2. Đặt giới hạn file, số key, số phần tử, độ sâu JSON và độ dài chuỗi.
3. Parse một lần, validate envelope, allowlist key, schema và migration trước khi tạo preview.
4. Lập change set `add/update/delete/skip/conflict` với stable record ID.
5. Chụp snapshot rollback chỉ cho các key bị ảnh hưởng, không nhân đôi toàn bộ storage.
6. Ghi staging, verify, commit theo journal; thất bại phải phục hồi được.
7. ACK extension chỉ sau khi người dùng xác nhận và import thành công.
8. Với backup mã hóa, một selected secure key giải mã lỗi phải làm cả transaction thất bại.

**Nghiệm thu**

- File có key lạ, sai version, quá lớn, schema sai hoặc checksum sai bị từ chối trước khi ghi.
- Reload giữa lúc import không để storage ở trạng thái nửa cũ nửa mới.
- Preview và kết quả sau import có cùng số lượng bản ghi.
- Restore lỗi vẫn mở được dữ liệu trước restore.

### SEC-09: Backup mã hóa và optical sync bảo mật

**Vấn đề**

Dữ liệu secure được giải mã trong RAM rồi đóng vào JSON/QR plaintext. Checksum/SHA chỉ kiểm tra lỗi truyền, không cung cấp bí mật hoặc xác thực người gửi.

**Thiết kế đích**

- Backup file có tùy chọn mã hóa mặc định cho dữ liệu nhạy cảm.
- Optical sync có secure session bằng mã ghép nối/passphrase một lần.
- Toàn payload được AES-GCM với nonce ngẫu nhiên; AAD chứa format version, session ID và expiry.
- Receiver kiểm tra expiry, session ID, checksum khung và auth tag trước preview.
- Chế độ plaintext nếu còn giữ phải được ghi rõ là không bảo mật và không bật mặc định.

**Các bước**

1. Định nghĩa format version mới, không thay đổi âm thầm format cũ.
2. Dùng KDF có salt và tham số nằm trong envelope; không nhúng khóa.
3. Thêm TTL ngắn và chặn replay session đã dùng.
4. Giữ giới hạn giải nén 16 MB; bổ sung giới hạn compressed input và số chunk.
5. Tạo test vector để web và Android giải mã chéo.

**Nghiệm thu**

- Camera/người đứng cạnh không thể đọc nội dung QR nếu không có pairing code.
- Sửa một byte làm AES-GCM verify thất bại trước khi preview.
- Payload hết hạn hoặc session đã dùng bị từ chối.

### SEC-10: Dependency và chuỗi cung ứng

**Vấn đề**

Đợt audit ghi nhận dependency critical/high, package Git không cần thiết, package export XLSX không có bản vá qua npm audit và một số version range quá rộng.

**Kế hoạch**

1. Cập nhật `react-router-dom`, Vite, PostCSS, `tar`, `brace-expansion` đến bản đã vá tương thích.
2. Gỡ dependency Git `analytics` nếu không được import; dùng package chính thức đang cần.
3. Xác minh và gỡ `tsc@2.0.4` nếu không dùng.
4. Pin version `clsx`, `tailwind-merge` và các package wildcard.
5. Thay `xlsx@0.18.5` bằng thư viện writer được duy trì hoặc bản đã audit. Trong thời gian chờ, tuyệt đối không parse workbook không tin cậy bằng package này.
6. Chạy `npm ci`, typecheck, unit test, build web, extension smoke test và APK smoke test sau từng nhóm update.
7. Sinh SBOM CycloneDX và SHA-256 cho artifact phát hành.

**Nghiệm thu**

- `npm audit --omit=dev` không còn critical/high, hoặc mỗi ngoại lệ có owner, lý do và hạn xử lý.
- Lockfile được commit; CI dùng `npm ci`.
- Không có Git dependency không cần thiết hoặc dependency wildcard.

### SEC-11: Security headers và CSP

**Vấn đề**

Production có HSTS nhưng thiếu CSP, bảo vệ frame, `nosniff`, Referrer-Policy và Permissions-Policy.

**CSP khởi điểm**

```text
default-src 'self';
script-src 'self';
style-src 'self' 'unsafe-inline';
font-src 'self';
img-src 'self' data: blob:;
connect-src 'self' https://vitals.vercel-insights.com;
worker-src 'self' blob:;
media-src 'self' blob:;
object-src 'none';
base-uri 'self';
frame-ancestors 'none';
form-action 'self';
upgrade-insecure-requests
```

Danh sách phải được điều chỉnh theo Network log thực tế. Nếu bỏ Vercel Analytics thì bỏ luôn origin tương ứng khỏi `connect-src`.

**Các bước**

1. Self-host font trước khi siết `font-src`.
2. Thêm CSP ở chế độ `Content-Security-Policy-Report-Only` trên preview.
3. Kiểm tra chatbot, camera QR, worker, tải file, Capacitor và bookmarklet.
4. Sửa violation hợp lệ, sau đó enforce trên production.
5. Thêm `X-Content-Type-Options: nosniff`.
6. Thêm `Referrer-Policy: no-referrer` hoặc `strict-origin-when-cross-origin` sau test Portal flow.
7. Thêm `Permissions-Policy: camera=(self), microphone=(), geolocation=()`.
8. Dùng `Cache-Control: no-store` cho API chat/phản hồi nhạy cảm; hashed assets dùng immutable cache.

**Ràng buộc tương thích**

Chưa bật `Cross-Origin-Opener-Policy: same-origin` vì bookmarklet hiện cần giao tiếp qua `window.opener` giữa Portal và UStudy. Chỉ bật khi luồng này được thay bằng extension/message channel không phụ thuộc opener.

**Nghiệm thu**

- Security headers xuất hiện trên domain production, không chỉ localhost.
- CSP enforce không phá QR camera, worker, Portal import hoặc tải file.
- Trang không thể bị nhúng trong iframe ngoài origin.

### SEC-12: Hardening các định dạng xuất và dữ liệu nén

**Công việc**

- CSV: escape quote chưa đủ. Prefix ô bắt đầu bằng `=`, `+`, `-`, `@`, tab hoặc CR để chống formula injection khi mở bằng Excel.
- ICS: loại `\r`, escape đúng RFC 5545 và fold dòng dài.
- Group schedule URL/hash: giới hạn kích thước chuỗi nén, output giải nén, số member, số course, số class và độ dài từng string trước khi dựng state.
- Tên file export: loại path separator/control character và giới hạn độ dài.

**File chính**

- `src/features/study-plan/StudyPlanSemesterPanel.tsx`
- `src/features/visual-schedule/services/schedule-export.ts`
- `src/features/group-schedule/services/group-scheduler.ts`

**Nghiệm thu**

- CSV chứa tên môn `=1+1` hiển thị như text, không chạy công thức.
- ICS có CR/LF lạ vẫn import đúng và không tạo property mới ngoài ý muốn.
- Hash nén vượt giới hạn bị từ chối nhanh, không làm treo tab.

### SEC-13: Dữ liệu và phiên Portal trên Android

**Vấn đề**

WebView cho third-party cookies, FileProvider quá rộng, kết quả crawl đi qua file tạm plaintext và notification có thể lộ môn/phòng trên lock screen.

**Thiết kế đích**

- Tắt third-party cookies nếu Portal không thực sự cần.
- Có nút "Xóa phiên Portal" riêng và tích hợp vào "Xóa dữ liệu ứng dụng".
- Xóa cookies, WebStorage, cache và file tạm theo lựa chọn người dùng.
- Handoff kết quả bằng vùng app-private, giới hạn kích thước và cleanup khi app khởi động sau crash; ưu tiên stream/in-memory nếu plugin hỗ trợ.
- Notification có chế độ riêng tư: nội dung chung trên lock screen, nội dung chi tiết sau khi mở khóa.

**Nghiệm thu**

- Xóa phiên Portal khiến lần mở tiếp theo yêu cầu đăng nhập lại.
- Không có file crawl tồn tại sau import thành công, cancel hoặc app khởi động lại sau crash.
- App không đọc/chia sẻ được file tùy ý ngoài thư mục đã khai báo.
- Notification privacy mode không hiện tên môn/phòng trên lock screen.

### SEC-14: Vòng đời pending import của extension

**Vấn đề**

Pending packet được lưu plaintext trong `chrome.storage.local`, chưa có TTL. Web hiện ACK ngay sau khi mở preview nên reload/cancel có thể làm mất packet trước khi import thành công.

**Thiết kế đích**

Trạng thái packet: `collected -> offered -> previewed -> applied -> acknowledged`, kèm `packetId`, `createdAt`, `expiresAt`, checksum và source summary.

**Các bước**

1. Ưu tiên `chrome.storage.session` nếu packet chỉ cần sống trong phiên trình duyệt.
2. Nếu cần bền qua restart, đặt TTL ngắn, cleanup khi background khởi động và không lưu lâu hơn cần thiết.
3. GET chỉ trả metadata trước; chỉ origin UStudy hợp lệ mới lấy payload.
4. ACK chỉ gửi sau commit import thành công hoặc người dùng chọn bỏ packet vĩnh viễn.
5. Reload preview phải lấy lại đúng packet chưa ACK.
6. Packet trùng được nhận diện bằng ID/checksum, không nhân đôi dữ liệu.

**Nghiệm thu**

- Reload/cancel preview không làm mất dữ liệu chưa nhập.
- Packet hết hạn tự bị xóa.
- Origin không hợp lệ không đọc được metadata hoặc payload.

### SEC-15: CI bảo mật và ứng phó sự cố

**Pipeline tối thiểu cho pull request**

1. `npm ci`.
2. Typecheck, lint, unit test và build.
3. `npm audit` theo policy; chặn critical/high production dependency.
4. Gitleaks hoặc công cụ secret scanning tương đương.
5. CodeQL/Semgrep cho JavaScript, TypeScript và Java.
6. Android lint cho release variant.
7. Kiểm tra manifest production không chứa localhost/preview origin.
8. Kiểm tra APK/AAB signer, `debuggable`, backup và exported components.
9. Sinh SBOM, checksum và lưu provenance của artifact.

**Quy trình sự cố**

- Có đầu mối nhận báo cáo bảo mật và thời gian phản hồi mục tiêu.
- Khi nghi rò API key: tắt feature, rotate key, kiểm tra quota/log, phát hành bản sửa và ghi timeline.
- Khi extension bị lạm dụng: thu hồi release, xóa pending packet, khóa origin/action bị ảnh hưởng và phát hành version bắt buộc.
- Khi APK signer/keystore bị lộ: dùng Play App Signing recovery nếu có; với sideload cần phát hành app ID hoặc quy trình migration mới.
- Khi import làm hỏng dữ liệu: dừng rollout, giữ journal/snapshot, cung cấp recovery tool và không ghi đè backup gốc.

## 7. Kế hoạch migration dữ liệu

### 7.1 Nguyên tắc

- Migration phải idempotent: chạy lại không thay đổi kết quả.
- Không xóa dữ liệu cũ trước khi dữ liệu mới được validate và đọc lại thành công.
- Mỗi migration có version, thời điểm, số key thành công/thất bại và lỗi đã redact.
- Không chạy migration nặng trong render; dùng màn hình tiến trình có thể resume.
- Trước migration lớn, tạo snapshot chỉ chứa key liên quan.

### 7.2 Thứ tự đề xuất

1. Thêm registry và adapter đọc format cũ, chưa đổi dữ liệu.
2. Chuyển key runtime/public trước để kiểm chứng repository.
3. Chuyển nhóm điểm, kế hoạch, lịch, thông báo và solver sang schema mới.
4. Mã hóa các key nhạy cảm plaintext bằng transaction.
5. Chuyển import/export sang registry.
6. Sau tối thiểu hai phiên bản ổn định mới xóa code đọc legacy.

### 7.3 Trường hợp lỗi

| Lỗi | Xử lý |
| --- | --- |
| Schema cũ không nhận diện | Giữ nguyên bản cũ, báo key bị lỗi, không commit migration |
| Sai mật khẩu/không giải mã được | Dừng toàn bộ nhóm secure, không bỏ qua key |
| Quota exceeded | Rollback staging, giữ snapshot và cho phép export recovery |
| App đóng giữa chừng | Đọc journal khi mở lại và resume/rollback |
| Version mới hơn app hiện tại | Chỉ cho xem metadata; không tự hạ cấp dữ liệu |

## 8. Ma trận kiểm thử

### Web

- [ ] Refresh trực tiếp mọi route trên Vercel không 404.
- [ ] CSP enforce không tạo violation không mong muốn.
- [ ] Import file hợp lệ, sai schema, quá lớn, key lạ, checksum sai và version mới hơn.
- [ ] Storage quota/corruption có thông báo và rollback.
- [ ] AI consent, revoke, rate limit, timeout và redaction.
- [ ] CSV/ICS malicious fixture không tạo formula/property injection.

### Extension

- [ ] Portal hostname hợp lệ và trang Login được nhận diện đúng.
- [ ] UStudy production nhận packet; localhost/preview/website lạ bị từ chối trong build production.
- [ ] Chuyển trang Portal giữa lúc crawl có thể resume đúng nguồn còn thiếu.
- [ ] Packet có TTL, reload preview không mất packet, ACK sau import thành công.
- [ ] Cấu hình học kỳ sai schema không được render hoặc lưu.
- [ ] Auto mode không hiện popup khi không có thay đổi.

### Android

- [ ] APK/AAB release signer và manifest tự động được kiểm tra.
- [ ] Chứng chỉ self-signed, hết hạn, sai hostname đều bị chặn.
- [ ] Portal login, crawl, mở UStudy và import hoạt động trên thiết bị thật.
- [ ] Xóa phiên Portal xóa cookie/WebStorage/file tạm.
- [ ] Notification privacy mode đúng trên lock screen.
- [ ] Migration từ dữ liệu cũ và quy trình debug-to-release được thử trên thiết bị sạch.

### Dữ liệu chéo nền tảng

- [ ] Web export -> Android import.
- [ ] Android export -> Web import.
- [ ] Optical secure transfer với payload nhỏ, gần giới hạn và bị sửa một byte.
- [ ] Backup trước version hiện tại được migrate; backup version mới hơn bị từ chối an toàn.
- [ ] Unicode tiếng Việt, tên dài, ký tự CSV đặc biệt và dữ liệu trùng không bị hỏng.

## 9. Trình tự triển khai và rollback

1. Phát hành bản web sửa Privacy/log trước vì không cần migration dữ liệu.
2. Hardening extension background và origin, sau đó mới đổi pending packet protocol.
3. Web phải hiểu cả protocol extension cũ và mới trong một cửa sổ chuyển tiếp ngắn.
4. Phát hành web hỗ trợ storage registry trước khi bật migration.
5. Bật migration theo feature flag cho nhóm nhỏ; theo dõi tỷ lệ lỗi/rollback.
6. Phát hành Android release sau khi web và format backup mới ổn định.
7. Enforce CSP sau giai đoạn Report-Only không còn violation hợp lệ.
8. Xóa compatibility code và legacy format sau tối thiểu hai phiên bản ổn định.

Mỗi release thay đổi format phải có:

- Feature flag hoặc version gate.
- Cách đọc dữ liệu cũ.
- Snapshot/journal trước commit.
- Hướng dẫn rollback không yêu cầu `localStorage.clear()`.
- Test fixture từ phiên bản đang được người dùng sử dụng.

## 10. Chỉ số theo dõi

| Chỉ số | Mục tiêu |
| --- | --- |
| APK public ký bằng debug certificate | 0 |
| APK release có `debuggable=true` | 0 |
| TLS error có thể bypass | 0 |
| Critical/high production dependency không có ngoại lệ được duyệt | 0 |
| API key xuất hiện trong web/APK/extension artifact | 0 |
| Log production chứa dữ liệu học tập hoặc nội dung chat | 0 |
| Import key ngoài registry | 0 |
| Import lỗi gây mất dữ liệu cũ | 0 |
| Pending packet quá TTL | 0 |
| CSP violation hợp lệ trước khi enforce | 0 |
| Storage migration có thể resume/rollback | 100% test case |

## 11. Quyết định cần chốt trước P2

1. Giữ Vercel Analytics với opt-out hay gỡ hoàn toàn?
2. Chatbot dùng nhà cung cấp nào, retention của provider ra sao và AI có bắt buộc opt-in mỗi thiết bị không?
3. Optical secure mode là bắt buộc hay vẫn cho plaintext với cảnh báo?
4. Extension phát hành qua Chrome Web Store hay ZIP có chữ ký/checksum?
5. Android ưu tiên Google Play hay tải APK trực tiếp?
6. Chuyển ngay sang Argon2id hay giữ PBKDF2 trong một phiên bản migration?
7. Dữ liệu nào thật sự cần mã hóa khi lưu và dữ liệu nào chỉ cần integrity/schema?
8. Có cần tài khoản/backend cloud sync trong tương lai hay tiếp tục local-first hoàn toàn?

## 12. Definition of Done

Một hạng mục `SEC-*` chỉ được đánh dấu hoàn thành khi:

- [ ] Code và tài liệu đã cập nhật.
- [ ] Có test tự động hoặc kịch bản test thủ công có bằng chứng.
- [ ] Không làm hỏng migration/compatibility đã công bố.
- [ ] Không thêm log chứa secret hoặc dữ liệu cá nhân.
- [ ] Typecheck, build và test liên quan đều đạt.
- [ ] Artifact production đã được kiểm tra, không chỉ source code.
- [ ] Có rollback/recovery đã thử tối thiểu một lần nếu thay đổi dữ liệu.
- [ ] Finding tương ứng được kiểm tra lại bằng cách khai thác cũ và không còn tái hiện.

## 13. Checklist trước mỗi release

- [ ] Kiểm tra diff manifest extension và Android.
- [ ] Quét secret trong source, history mới và artifact.
- [ ] Chạy dependency audit và xem dependency mới.
- [ ] Build web production, extension production và Android release từ clean checkout.
- [ ] Kiểm tra signer, checksum và SBOM.
- [ ] Kiểm tra Network panel: origin, request AI, analytics và font.
- [ ] Chạy fixture import/export và migration từ phiên bản trước.
- [ ] Kiểm tra CSP/security headers trên URL production sau deploy.
- [ ] Cập nhật privacy/changelog nếu luồng dữ liệu thay đổi.
- [ ] Xác nhận có đường rollback và người chịu trách nhiệm theo dõi release.
