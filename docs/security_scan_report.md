# Báo cáo rà soát bảo mật UStudy

Ngày rà soát: 2026-05-20

Phạm vi rà soát:

- Source React/Vite trong `src/`
- Cấu hình build/dev server: `package.json`, `vite.config.ts`
- Lịch sử git liên quan `.env`
- Dependency audit bằng `npm audit`
- AgentShield scan cho cấu hình Claude/agent trong repo

## Tóm tắt nhanh

Không phát hiện secret thật theo các mẫu phổ biến trong source hiện tại. File `.env` hiện tại cũng đang được ignore và không nằm trong git index. Hai commit từng chứa `.env` chỉ nên xem là rủi ro lịch sử nếu giá trị trong đó là test/rác.

Các rủi ro đáng chú ý hơn hiện tại là:

| Mức độ | Vấn đề | Trạng thái |
| --- | --- | --- |
| Cao | Gọi Gemini trực tiếp từ browser bằng `VITE_GEMINI_API_KEY` | Cần sửa nếu dùng production |
| Cao | `postMessage` nhận dữ liệu import mà chưa kiểm tra `origin/source` | Cần sửa |
| Cao | Dependency audit còn advisory high | Cần update package |
| Trung bình | Log dữ liệu học tập/chat ra console | Cần gỡ hoặc chỉ bật khi debug |
| Trung bình | Import/export toàn bộ `localStorage` quá rộng | Nên giới hạn schema/key |
| Trung bình | Mật khẩu mã hóa local data chỉ yêu cầu tối thiểu 4 ký tự | Nên tăng yêu cầu |
| Lưu ý | `.env` từng xuất hiện trong lịch sử git | Không nghiêm trọng nếu chỉ là giá trị test/rác |

## Kết quả scan

### AgentShield

Lệnh đã chạy:

```bash
npx ecc-agentshield scan --path . --format json
```

Kết quả:

- Grade: `A`
- Score: `100`
- Findings: `0`
- Files scanned: `0`

Ghi chú: repo hiện không có cấu hình `.claude/`, `CLAUDE.md`, MCP hoặc hook Claude để AgentShield phân tích. Vì vậy kết quả này chỉ nói rằng không có bề mặt Claude config trong repo, không có nghĩa là toàn bộ app không có lỗi bảo mật.

### npm audit

Lệnh đã chạy:

```bash
npm audit --json
npm audit --omit=dev --json
```

Kết quả tổng:

- Tổng audit: 4 vulnerabilities
- High: 3
- Moderate: 1

Production-only audit còn:

- `lodash`: high, đi qua `recharts`

Dependency chain hiện tại:

```text
recharts@2.15.4 -> lodash@4.17.23
vite@6.3.5 -> picomatch@4.0.3, postcss@8.5.8
```

## Findings chi tiết

### 1. API key Gemini nằm ở phía client

Mức độ: Cao nếu dùng production.

Bằng chứng:

- `src/logic/ai/geminiService.ts:65-66`
- `src/logic/ai/geminiService.ts:198`
- `src/logic/ai/geminiService.ts:223-229`

Code hiện tại lấy key bằng:

```ts
import.meta.env.VITE_GEMINI_API_KEY
```

và gọi thẳng endpoint:

```ts
`${this.GEMINI_ENDPOINT}?key=${apiKey}`
```

Với Vite, mọi biến có prefix `VITE_` đều được đưa ra client bundle. Nghĩa là nếu đây là key thật, người dùng có thể xem key qua DevTools, source map/bundle, hoặc network request.

Hậu quả có thể xảy ra:

- Người khác lấy key và dùng ké quota Gemini.
- Nếu key có billing, có thể phát sinh chi phí.
- Key bị spam dẫn tới rate limit, chatbot của app bị lỗi cho người dùng thật.
- Vì app gửi dữ liệu học tập cá nhân vào Gemini, nếu không có proxy kiểm soát, khó audit/rate-limit/redact dữ liệu trước khi gửi ra ngoài.

Đề xuất:

- Nếu chỉ demo/test local thì chấp nhận tạm, nhưng không nên ship production theo hướng này.
- Tạo API proxy/serverless endpoint, ví dụ `/api/chat`, giữ Gemini key ở server env không có prefix `VITE_`.
- Thêm rate limit, giới hạn origin, logging có redaction.
- Restrict key trong Google Cloud nếu có thể.

### 2. Nhận `postMessage` import dữ liệu nhưng chưa xác minh nguồn gửi

Mức độ: Cao.

Bằng chứng:

- `src/App.tsx:62-64`
- `src/App.tsx:77-86`
- `src/App.tsx:94`
- `src/logic/Bookmarklet.js:851`

App đang nhận message kiểu `IMPORT_FULL_DATA`, lấy `event.data.payload`, rồi lưu vào secure storage nếu có `cryptoKey`. Bookmarklet gửi:

```js
window.opener.postMessage({ type: 'IMPORT_FULL_DATA', payload: fullDataPacket }, '*');
```

Nhưng app không kiểm tra:

- `event.origin`
- `event.source`
- nonce/session token giữa cửa sổ app và cửa sổ portal
- shape/schema chặt chẽ của payload

Hậu quả có thể xảy ra:

- Một tab/trang khác có thể gửi message giả để ghi dữ liệu học tập giả vào app.
- Người dùng có thể bị data poisoning: điểm, lịch học, học phí, lịch thi bị thay bằng dữ liệu sai.
- Nếu luồng opener bị điều hướng sang trang khác, dữ liệu raw có thể bị gửi tới nơi không mong muốn vì target origin là `*`.
- Các hook đang listen message có thể re-render theo message giả, tạo hành vi khó debug.

Đề xuất:

- Dùng target origin cụ thể thay vì `*`.
- Ở app, kiểm tra `event.origin` nằm trong allow-list, ví dụ portal chính thức và origin app.
- Kiểm tra `event.source === expectedWindowRef` nếu luồng mở popup do app kiểm soát.
- Thêm nonce một lần: app sinh nonce, truyền vào bookmarklet/config, message trả về phải kèm nonce đúng.
- Validate payload bằng schema trước khi lưu.

### 3. Dependency audit còn lỗi high/moderate

Mức độ: Cao.

Bằng chứng:

- `package.json:58-60`
- `npm audit`
- `npm audit --omit=dev`

Các package bị audit flag:

- `lodash <= 4.17.23`: high code injection/prototype pollution advisory, đi qua `recharts`.
- `vite <= 6.4.1`: nhiều advisory liên quan dev server arbitrary file read/path traversal.
- `picomatch 4.0.0 - 4.0.3`: ReDoS/method injection advisory, đi qua Vite.
- `postcss < 8.5.10`: XSS advisory trong stringify output.

Hậu quả có thể xảy ra:

- Với Vite: chủ yếu nguy hiểm khi chạy dev server, nhất là `server.host = '0.0.0.0'`; người cùng mạng có thể có cơ hội đọc file ngoài ý muốn nếu lỗ hổng bị khai thác.
- Với lodash: rủi ro phụ thuộc vào việc app/library có gọi API dễ bị khai thác bằng input không tin cậy hay không. Dù chưa thấy app gọi trực tiếp, production audit vẫn đỏ nên nên xử lý.
- Với picomatch: input glob độc hại có thể gây ReDoS trong môi trường dùng glob.
- Với postcss: rủi ro khi stringify CSS có input không tin cậy.

Đề xuất:

- Chạy `npm audit fix` hoặc update có kiểm soát.
- Ưu tiên update `vite` lên bản đã vá, audit gợi ý `6.4.2`.
- Cập nhật `postcss` lên `>=8.5.10`.
- Kiểm tra bản `recharts` mới có kéo lodash bản đã vá hay không.
- Sau update chạy lại `npm audit`, `npm run build`.

### 4. Log dữ liệu cá nhân và nội dung chat ra console

Mức độ: Trung bình.

Bằng chứng:

- `src/components/ChatbotWidget.tsx:239`
- `src/logic/ai/geminiService.ts:247-250`
- `src/logic/Bookmarklet.js:848`

Các log hiện có:

- Student context gửi cho AI.
- User request và chatbot response.
- Full data packet từ bookmarklet.

Hậu quả có thể xảy ra:

- Dữ liệu học tập cá nhân hiện trong console, dễ bị lộ khi demo, quay màn hình, gửi bug report, hoặc khi người dùng mở DevTools.
- Extension độc hại hoặc script bên thứ ba trên trang có thể đọc console/log hoặc hook console API trong một số tình huống.
- Full data packet có thể chứa điểm, lịch thi, học phí, đăng ký học phần.

Đề xuất:

- Xóa log nhạy cảm khỏi production.
- Nếu cần debug, bọc bằng flag như `import.meta.env.DEV` hoặc `VITE_DEBUG_LOGS === 'true'`.
- Khi log lỗi, chỉ log metadata không nhạy cảm, ví dụ số lượng môn/lịch thi, không log payload đầy đủ.

### 5. Import/export toàn bộ `localStorage` quá rộng

Mức độ: Trung bình.

Bằng chứng:

- `src/pages/setting/importData.tsx:12-17`
- `src/pages/setting/importData.tsx:68-71`
- `src/pages/setting/importData.tsx:86-88`

Luồng export hiện lấy toàn bộ key trong `localStorage`. Luồng import chỉ kiểm tra file có một vài key hợp lệ, sau đó ghi nhiều key từ file vào storage.

Hậu quả có thể xảy ra:

- File export có thể chứa nhiều dữ liệu hơn người dùng nghĩ, bao gồm dữ liệu nhạy cảm hoặc cấu hình nội bộ.
- File import độc hại có thể ghi đè key app, gây sai dữ liệu, lỗi UI hoặc làm app đọc dữ liệu không đúng định dạng.
- Nếu một key nhạy cảm bị import qua nhánh plain storage, có nguy cơ dữ liệu không được mã hóa đúng như kỳ vọng.

Đề xuất:

- Dùng allow-list key rõ ràng, ví dụ chỉ export/import các key app thật sự cần.
- Dùng schema validate cho từng key.
- Giới hạn kích thước file import.
- Với secure keys, luôn đi qua `saveSecure`, không dùng `saveToStorage`.

### 6. Mật khẩu local encryption tối thiểu 4 ký tự

Mức độ: Trung bình.

Bằng chứng:

- `src/components/SecurityLock.tsx:331-350`
- `src/components/SecurityLock.tsx:358-377`
- `src/helpers/localStorage/save.tsx:280-305`

App dùng PBKDF2 + AES-GCM là hướng tốt, nhưng UI cho phép mật khẩu chỉ 4 ký tự. Lockout hiện dựa trên `sessionStorage`, nên chỉ bảo vệ thao tác thử trong UI, không bảo vệ tốt nếu kẻ xấu đã có bản export/localStorage để brute-force offline.

Hậu quả có thể xảy ra:

- Nếu máy người dùng bị truy cập hoặc file export bị lộ, mật khẩu ngắn dễ bị đoán hơn.
- Lockout có thể bị bỏ qua bằng cách xóa sessionStorage hoặc brute-force offline trên dữ liệu đã lấy.
- Dữ liệu học tập cá nhân có thể bị giải mã nếu mật khẩu yếu.

Đề xuất:

- Tăng tối thiểu lên 8-12 ký tự.
- Khuyến khích passphrase thay vì PIN ngắn.
- Thêm meter kiểm tra độ mạnh.
- Cân nhắc Argon2id nếu có thư viện phù hợp, hoặc tăng tham số KDF có benchmark.

### 7. `.env` từng xuất hiện trong git history

Mức độ: Lưu ý, không còn xếp high nếu giá trị là test/rác.

Bằng chứng:

- `23dd55a44b236150c040d61b258eaed943ef1bec`: thêm `.env`
- `769e12e0c13dbd79285aca742bd0176fcdbebccc`: merge commit vẫn chứa history có `.env`
- `.gitignore` hiện đã ignore `.env`
- `git ls-files .env` không trả file, nghĩa là `.env` hiện không còn tracked

Hậu quả có thể xảy ra nếu giá trị là secret thật:

- Người có quyền đọc repo/history có thể lấy lại secret từ commit cũ.
- Xóa file ở commit sau không xóa secret khỏi lịch sử.
- Nếu repo từng public, secret có thể đã bị crawler lưu lại.

Với thông tin hiện tại của bạn: nếu `VITE_ENCRYPT_SECRET` trong hai commit đó chỉ là test/rác, không cần xem đây là sự cố nghiêm trọng. Vẫn nên giữ thói quen không commit `.env`, dùng `.env.example` không chứa value thật.

Đề xuất:

- Không cần rotate nếu chắc chắn value là rác/test.
- Nếu từng là secret thật, rotate ngay.
- Nếu muốn sạch history hoàn toàn, có thể dùng history rewrite, nhưng chỉ nên làm khi team đồng ý vì sẽ ảnh hưởng clone/branch của người khác.

## Những điểm đã kiểm tra nhưng chưa xem là lỗi chính

### `dangerouslySetInnerHTML` trong chatbot

Bằng chứng:

- `src/components/ChatbotWidget.tsx:291-363`

Code escape `&`, `<`, `>` trước khi chuyển Markdown đơn giản sang HTML, nên chưa thấy XSS trực tiếp từ phản hồi AI ở đoạn này. Tuy nhiên vẫn nên cẩn thận vì parser Markdown tự viết bằng regex dễ bị thiếu case.

Khuyến nghị:

- Nếu chatbot phát triển thêm Markdown phức tạp, nên dùng thư viện Markdown + sanitizer như `react-markdown` với `rehype-sanitize`, hoặc DOMPurify.

### Không thấy SQL/backend trực tiếp

Không phát hiện query SQL, ORM, API backend, cookie auth, JWT server-side trong source hiện tại. Các checklist SQL injection, CSRF backend, RBAC server-side không áp dụng nhiều cho repo client-only này.

## Ưu tiên xử lý đề xuất

1. Đưa Gemini call vào backend/serverless proxy nếu app sẽ public.
2. Sửa `postMessage`: target origin cụ thể, kiểm tra origin/source, thêm nonce và schema.
3. Update dependency để `npm audit` sạch hoặc giảm về mức chấp nhận được.
4. Gỡ log dữ liệu cá nhân khỏi production.
5. Siết import/export `localStorage` bằng allow-list + schema.
6. Tăng yêu cầu mật khẩu local encryption.

## Lệnh đã chạy

```bash
npx ecc-agentshield scan --path . --format json
npm audit --json
npm audit --omit=dev --json
rg -n --hidden -g '!node_modules' -g '!dist' -g '!build' -g '!package-lock.json' -e "dangerouslySetInnerHTML|innerHTML|outerHTML|insertAdjacentHTML|eval\\(|new Function|postMessage|addEventListener\\([\"']message|window\\.open|localStorage|sessionStorage|import\\.meta\\.env|VITE_|console\\.(log|error|warn)" src public docs package.json vite.config.ts index.html .env.example .gitignore
git grep -n -I -e 'VITE_[A-Z0-9_]*=' $(git rev-list --all) -- .env .env.example
npm ls lodash picomatch postcss vite
```
