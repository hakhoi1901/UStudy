# Báo cáo kiểm toán toàn diện website sau tích hợp K23

**Ngày kiểm toán:** 2026-08-29

**Phạm vi:** website/PWA và extension build; không kiểm thử Android/Capacitor native

**Branch:** `codex/integrate-k23-12-programs`

**Commit nền:** `98fb4b27deac2f0174ea3cbda45ae7f78fbc1bfe`

**Trạng thái:** đã cập nhật phụ lục K23 sau đợt hoàn thiện dữ liệu; không thay đổi public API, type hoặc schema

## 1. Kết luận điều hành

Website **đủ điều kiện tiếp tục review nhánh K23**, nhưng chưa nên coi toàn bộ sản phẩm là “không còn lỗi”. Phần K23 đạt các tiêu chí runtime quan trọng: 29/29 chương trình thuộc 9 khoa tải đủ ba asset, dùng nguồn trực tiếp `k23`, không fallback, không trùng mã, không thiếu reference category theo contract test và chọn tuần tự thành công trong browser cô lập. Không tái hiện được page error, route trắng hoặc tràn ngang liên quan K23.

Các rủi ro lớn được tái hiện lại đều là vấn đề có sẵn hoặc thuộc khóa khác:

- **P1:** asset K24 Công nghệ Thông tin chứa 794 bản ghi nhưng chỉ 184 mã duy nhất, tức 610 bản ghi lặp.
- **P1:** K25 và K26 hiển thị các ngành Thống kê, Kinh tế đất đai, Công nghệ giáo dục nhưng fallback về K24 không có asset; Workspace xác nhận `0/3`.
- **P1:** `AppSelect` không hỗ trợ đầy đủ bàn phím: `Escape` không đóng listbox, không có xử lý phím mũi tên/type-ahead theo mô hình combobox/listbox.
- **P2:** nhiều control tương tác chỉ cao/rộng 32–43 px; nút đóng mobile drawer 32×32 px không có accessible name.
- **P2:** main bundle và các chunk PDF/WASM lớn; import K24 mặc định vừa static vừa dynamic làm mất hiệu quả code splitting.

Không có P0. Không có bằng chứng cho thấy nhánh K23 gây regression giao diện hoặc tương thích trình duyệt.

## 2. Điểm sức khỏe

| Hạng mục | Điểm /20 | Nhận định |
|---|---:|---|
| Accessibility | **12** | Landmark/heading và nhãn chính tốt; còn lỗi bàn phím dropdown, accessible name, vùng chạm và reduced motion. |
| Performance | **11** | Local LCP/CLS tốt nhưng payload JS ban đầu lớn, PDF/WASM nặng và có cảnh báo code splitting. |
| Responsive | **18** | 0 route tràn ngang ở 360/390/768/1440 px trên ba engine; 200% text vẫn không tràn ở các route đại diện. |
| Theming | **11** | Hệ màu sáng khá nhất quán, tương phản runtime mẫu đạt; chưa có theme provider/dark theme hoàn chỉnh và token hóa còn phân mảnh. |
| Implementation Integrity | **12** | Type/test/build K23 tốt; dữ liệu K24 trùng, fallback K25/K26 rỗng và analytics 404 local làm giảm độ tin cậy toàn hệ thống. |
| **Tổng** | **64/100** | **Khá; K23 ổn định, nợ kỹ thuật toàn site cần xử lý trước khi tuyên bố hoàn thiện.** |

## 3. Môi trường và phương pháp

| Thành phần | Giá trị |
|---|---|
| Hệ điều hành | Windows, PowerShell |
| Node.js / npm | `v24.12.0` / `11.6.2` |
| Playwright | `1.62.1` |
| Browser engines | Chromium/Chrome–Edge, Firefox, WebKit–Safari |
| Viewport | 1440×900, 768×1024, 390×844, 360×800 |
| Server | Vite preview HTTPS; HTTP static chỉ dùng để chụp kiểm chứng giao diện |
| Dữ liệu browser | context cô lập; seed K23/CNTT/Công nghệ Thông tin; không dùng profile người dùng thật |

Kỹ thuật kiểm tra gồm typecheck, toàn bộ unit/contract test, build extension/web production, E2E hiện có, ma trận Playwright tự động bổ sung, DOM/geometry audit, console/page-error capture, kiểm tra bàn phím, mô phỏng text 200%, đo Navigation/LCP/CLS/resource transfer và mở danh sách CTĐT lớn. Ảnh dashboard/no-data và các màn hình đại diện đã được xem trực quan trong browser tích hợp; ảnh tạm không được giữ lại để đáp ứng yêu cầu chỉ tạo hai báo cáo.

## 4. Kết quả lệnh bắt buộc

| Lệnh | Kết quả thật | Ghi chú |
|---|---|---|
| `git diff --check` | **PASS** | Có cảnh báo LF→CRLF trên 4 file tracked vốn đang thay đổi; không có whitespace error. |
| `npm run typecheck:test` | **PASS** | Exit 0. |
| `npm run test:unit -- --reporter=verbose` | **PASS** | 13 file, **85/85** test sau cập nhật contract K23. |
| `npm run build` | **PASS có cảnh báo** | Extension production `0.2.7` và web đều build thành công. |
| `npm run test:e2e` | **PASS** | Bộ E2E hiện có đạt **6/6**; smoke bổ sung tuần tự K23 đạt **2/2** project (desktop/mobile Chromium), tổng **8/8**. |
| `VITE_ENABLE_WORKSPACE=true; npm run build:web` | **PASS có cảnh báo** | Xác minh Workspace production-gated build. |
| `npm audit --omit=dev` | **PASS** | `found 0 vulnerabilities`. |

### Cảnh báo build được giữ nguyên

- `courses.ts`, `prerequisites.ts`, `categories.ts` của K24 CNTT/Công nghệ Thông tin vừa được import động trong `registry.ts`, vừa import tĩnh tại `src/context/DepartmentContext.tsx:21-23`; Rollup báo chúng không được tách chunk.
- Main JS sau hoàn thiện K23: **2,334.22 kB**, gzip **613.10 kB**.
- `react-pdf.browser`: **1,462.98 kB**, gzip **491.47 kB**.
- ZXing WASM: **1,065.87 kB**, gzip **450.40 kB**.
- CSS: **192.72 kB**, gzip **28.47 kB**.
- Vite cảnh báo chunk lớn hơn 500 kB.

## 5. Ma trận tương thích và responsive

### 5.1 Route/engine

Desktop chạy toàn bộ 16 route trong phạm vi; tablet/mobile chạy 9 route đại diện chịu ảnh hưởng chính. Mỗi ô là `route lỗi / route tràn ngang`.

| Engine | 1440×900 (16 route) | 768×1024 (9 route) | 390×844 (9 route) | 360×800 (9 route) |
|---|---:|---:|---:|---:|
| Chromium | **0 / 0** | **0 / 0** | **0 / 0** | **0 / 0** |
| Firefox | **0 / 0** | **0 / 0** | **0 / 0** | **0 / 0** |
| WebKit | **0 / 0** | **0 / 0** | **0 / 0** | **0 / 0** |

Desktop routes: dashboard; chương trình, kế hoạch, chọn môn, xếp nhóm, lịch lộ trình; điểm; học phí; thời khóa biểu; bản đồ, lịch năm học, danh bạ trường; lịch thi; cài đặt; quyền riêng tư; Workspace dữ liệu.

Tablet/mobile routes: dashboard, chương trình đào tạo, điểm, học phí, thời khóa biểu, lịch thi, cài đặt, quyền riêng tư, Workspace dữ liệu.

### 5.2 Text zoom, touch và nội dung dài

- Mô phỏng root text 200% tại 390 px trên dashboard, CTĐT, cài đặt, quyền riêng tư và Workspace: **0/5 tràn ngang**.
- Danh sách trực tiếp 184 dòng: render **98 ms**, khoảng **1.604 DOM node** trong Chromium local.
- Điều hướng liên tục 29 chương trình K23: **29/29 đạt** trên desktop và mobile Chromium, không fallback, không page error CTĐT.
- Touch layout không tràn, nhưng còn nhiều target dưới 44×44 px; chi tiết ở `A11Y-02`.

## 6. Bao phủ luồng và trạng thái

| Luồng | Kết quả | Bằng chứng/giới hạn |
|---|---|---|
| Thiết lập lần đầu | PASS | E2E desktop/mobile mở setup, không runtime error; partial config quay lại setup an toàn. |
| Chọn K23/khoa/ngành | PASS | Tuần tự 9 khoa/29 ngành trong context cô lập; 29/29 hiện đủ ba asset chương trình. |
| Dashboard | PASS | No-data state hiển thị rõ ba cách nhập dữ liệu; ảnh chụp trực quan xác nhận hierarchy và không vỡ layout. |
| CTĐT/lộ trình | PASS K23 | K23 tải trực tiếp; danh sách dài render được; chưa thấy console error liên quan CTĐT. |
| Điểm/học phí/lịch thi/TKB | PASS app shell/no-data | Route tải trên ba engine. Không đăng nhập Portal nên không xác minh dữ liệu live hay lỗi nghiệp vụ phía Portal. |
| Thông tin trường | PASS | Bản đồ, lịch năm học, danh bạ tải trên desktop; route đại diện không lỗi. |
| Cài đặt | PASS có a11y issue | Form hiển thị đúng K23; control 36–43 px chưa đạt target 44 px. |
| Quyền riêng tư | PASS | Direct SPA refresh nằm trong 6/6 E2E; route tải trên ba engine. |
| Workspace nội bộ | PASS K23 / FAIL khóa khác | K23 đủ 29/29; ba ngành K25/K26 hiện 0/3 do fallback thiếu. |
| Loading | PASS quan sát | Suspense/loader xuất hiện khi lazy route và Workspace đọc asset; không bị kẹt. |
| Lỗi tải | PASS graceful cho coverage | Asset không tồn tại được biểu diễn `0/3`; không crash vì Workspace không gọi loader khi coverage thiếu. |
| Dữ liệu một phần | Có giới hạn | Đã kiểm tra config/storage thiếu và coverage 0/3. Không sửa dữ liệu người dùng để dựng mọi tổ hợp portal-data một phần. |
| Offline/tài nguyên bên thứ ba | App shell hoạt động; analytics local 404 | Không coi 404 analytics local là production regression. |

## 7. Accessibility audit

### Điểm đang hoạt động tốt

- Layout có `header`, `nav`, `main`; tiêu đề trang dùng `h1` qua `PageHeader`.
- Các selector K23 có `aria-label` rõ: Chọn khoa, Chọn ngành, Chọn khóa tuyển.
- Runtime contrast scan trên 9 route đại diện không tìm thấy text/background pair chắc chắn vi phạm WCAG theo computed color; 64 cảnh báo “gray-on-color” từ detector tĩnh không tái hiện được nên được ghi là **false-positive/chưa đủ bằng chứng**, không tính là finding.
- Focus ring được khai báo cho nhiều CTA/input chính; tab order cơ bản sử dụng được.

### Vấn đề

#### A11Y-01 — P1 — Custom select không đủ hành vi bàn phím

- **Vị trí:** `src/components/ui/form/app-select.tsx:60-91`.
- **Tác động:** người chỉ dùng bàn phím/screen reader khó chọn K23, khoa/ngành; listbox không đóng bằng `Escape`, không hỗ trợ Arrow Up/Down, Home/End và type-ahead.
- **Tái hiện:** mở Workspace → focus “Chọn khóa tuyển” → Enter → nhấn Escape; `role=listbox` vẫn tồn tại (`escapeClosed=false`).
- **Bằng chứng:** tái hiện Chromium headless và đọc code; component chỉ xử lý `onClick`, không có `onKeyDown`.
- **Hướng sửa:** dùng native `select` khi phù hợp hoặc triển khai đúng WAI-ARIA combobox/listbox, roving focus/`aria-activedescendant`, Escape/arrow/type-ahead và test keyboard.
- **Nguồn gốc:** component có sẵn toàn site; K23 chỉ làm luồng này được dùng nhiều hơn.

#### A11Y-02 — P2 — Vùng chạm nhỏ và nút không có accessible name

- **Vị trí:** `src/components/layout/Sidebar.tsx:191-196`, Header/Settings/Workspace controls.
- **Tác động:** khó thao tác trên mobile và không rõ chức năng với screen reader.
- **Tái hiện:** viewport 390×844; đo `getBoundingClientRect()`.
- **Bằng chứng đại diện:** mở thông báo 40×40; đăng nhập 116×36; mobile drawer close 32×32; Settings selects 316×43; Workspace selects 350×42; “Xem dữ liệu” 126×38. Nút 32×32 chỉ chứa icon `X`, không có `aria-label`.
- **Hướng sửa:** min-size 44×44, mở rộng padding/interactive hit area và thêm `aria-label="Đóng menu"`.

#### A11Y-03 — P2 — Không tôn trọng reduced motion

- **Vị trí:** toàn bộ `src`; ví dụ `src/features/tuition/components/tuition-status.tsx:12`, `src/components/security/SecurityGate.tsx:34`.
- **Tác động:** pulse/spin/transition có thể gây khó chịu cho người nhạy chuyển động.
- **Tái hiện:** tìm `prefers-reduced-motion` không có kết quả trong CSS/app, trong khi nhiều `animate-pulse`, `animate-spin`, `transition-all` tồn tại.
- **Hướng sửa:** thêm media query hoặc Tailwind `motion-reduce:*`, tắt animation không thiết yếu và giảm transition.

## 8. Performance và độ ổn định

### Chỉ số browser local

Đo route `/study-roadmap/program`, Chromium, production preview, warm local connection:

| Chỉ số | Giá trị |
|---|---:|
| DOMContentLoaded | 173.7 ms |
| Load event | 175.4 ms |
| LCP quan sát | 276 ms |
| CLS quan sát | 0 |
| Resource transfer | 643,843 bytes |
| JS transfer | 615,070 bytes |
| Resource entries | 4 |

Đây là số đo local/warm, **không thay thế Lighthouse/RUM trên mạng thật**.

#### PERF-01 — P2 — Bundle/chunk lớn

- **Vị trí:** output Vite build; `react-pdf`, ZXing WASM, main app.
- **Tác động:** parse/compile JS và tải trên mobile chậm, đặc biệt cold cache/network yếu.
- **Tái hiện:** `npm run build`.
- **Bằng chứng:** main 2.334 MB/613.10 kB gzip; PDF 1.46 MB/491 kB gzip; WASM 1.07 MB/450 kB gzip; cảnh báo >500 kB.
- **Hướng sửa:** route-level lazy loading, tách PDF/QR/optical tools theo hành động, manual chunks hợp lý, đo Lighthouse cold-cache trước/sau.

#### PERF-02 — P2 — Import static/dynamic xung đột

- **Vị trí:** `src/context/DepartmentContext.tsx:21-23`, `src/assets/data/academic-programs/registry.ts:490-505`.
- **Tác động:** ba asset mặc định K24 không được tách khỏi chunk dù registry dùng dynamic import.
- **Tái hiện:** `npm run build`.
- **Hướng sửa:** thống nhất một chiến lược load; tránh import tĩnh dataset mặc định hoặc đặt default vào chunk riêng có cache.

#### OPS-01 — P3 — Vercel Analytics 404 ở local preview

- **Vị trí:** `src/App.tsx:2,434`.
- **Tác động:** console noise làm che lỗi thật trong môi trường local; Chromium/WebKit ghi `Failed to load resource: 404` cho `/_vercel/insights/script.js`.
- **Tái hiện:** mở production preview ngoài Vercel.
- **Phân loại:** local-only; chưa có bằng chứng production lỗi.
- **Hướng sửa:** chỉ mount Analytics khi có môi trường phù hợp hoặc cấu hình debug/local rõ ràng.

## 9. Implementation integrity và dữ liệu

#### DATA-01 — P1 — 610 bản ghi lặp trong asset K24 CNTT

- **Vị trí:** `src/assets/data/academic-programs/khoa-cntt/cong-nghe-thong-tin/k24/courses.ts`; mã `BAA00101` lặp tại khoảng dòng 3, 1983, 3655, 5426, 7109.
- **Tác động:** tăng payload/memory, có thể lặp môn hoặc làm sai thống kê nếu consumer không dedupe.
- **Tái hiện:** `loadCohortData(..., 'k24')` trả **794 records / 184 unique**, 167 mã bị lặp, 610 record dư.
- **Hướng sửa:** chuẩn hóa asset về một record/mã và mở rộng contract uniqueness cho mọi khóa, không chỉ K23.
- **Nguồn gốc:** tồn tại ở K24; **không phải regression K23**.

#### DATA-02 — P1 — K25/K26 có ngành nhưng fallback không có asset

- **Vị trí:** `src/assets/data/academic-programs/registry.ts:232-329,329-426`.
- **Tác động:** người dùng chọn ngành hợp lệ nhưng không có CTĐT/lộ trình.
- **Tái hiện:** Workspace K25 → Thống kê, Kinh tế đất đai, Công nghệ giáo dục; cả ba hiện `0/3` và “đang dùng dữ liệu nguồn K24”. K26 lặp lại cùng fallback.
- **Bằng chứng:** import trực tiếp nguồn K24 của ba cặp đều `Cannot find module`; browser vẫn graceful, không crash.
- **Hướng sửa:** bổ sung dữ liệu trực tiếp đúng khóa hoặc bỏ ngành khỏi catalog tạm thời/hiển thị rõ “chưa có dữ liệu”, không fallback đến đường dẫn không tồn tại.
- **Nguồn gốc:** registry K25/K26; **không phải regression K23**.

### K23 branch-specific integrity

- 9 khoa, 29 chương trình, 4.111 record môn, 87 asset.
- 29/29 source cohort là `k23`; 0 fallback.
- 29/29 có `courses.ts`, `prerequisites.ts`, `categories.ts`.
- 29/29 không trùng mã môn; 0 category reference thiếu theo contract extractor.
- Browser tuần tự: 29/29 tải CTĐT trên cả desktop/mobile Chromium, 0 failure, 0 console/page error CTĐT.
- Quản lý tài nguyên và môi trường đã được tích hợp trực tiếp với 92 mã duy nhất; `MTH5556` đã gộp về mã canonical `MTH10556` ở Toán học và Toán học CNTN.
- Tất cả file prerequisite K23 hiện có nhưng đều chứa 0 quan hệ; đây là khác biệt nội dung cần xem trong báo cáo so sánh CTĐT, không phải lỗi load asset.

## 10. UI, consistency và theming

### Điểm tốt

- Hệ phân cấp sidebar/header/content rõ, card/border/radius/spacing nhất quán ở các màn hình được chụp.
- No-data dashboard có hướng dẫn hành động rõ; Workspace phân biệt `3/3`, fallback và asset path dễ kiểm tra.
- Desktop/mobile giữ hierarchy, không cắt nội dung hoặc tạo scroll ngang trong ma trận.
- Màu thương hiệu xanh `#004A98`, neutral gray và trạng thái emerald/amber được dùng tương đối nhất quán.

### THEME-01 — P3 — Theme mới dừng ở light mode và token hóa chưa hoàn chỉnh

- **Vị trí:** `src/index.css` và nhiều class/inline color toàn `src`; `next-themes` chỉ xuất hiện ở toaster, không có ThemeProvider/setTheme cho app.
- **Tác động:** khó bảo trì/chuyển dark/high-contrast; màu hard-code có thể lệch giữa feature.
- **Bằng chứng:** không tìm thấy app-level `ThemeProvider`, `setTheme` hoặc `prefers-color-scheme`; detector tĩnh tìm nhiều màu gray/accent nhưng runtime contrast mẫu chưa chứng minh vi phạm.
- **Hướng sửa:** gom semantic color tokens, xác định chính thức light-only hay thêm dark/high-contrast, rồi visual-regression test theo theme.

## 11. Detector tĩnh và false positive

UI detector bắt 83 pattern/42 file: 64 gray-on-color, 8 border-accent-on-rounded, 8 side-tab, 3 bounce-easing. Sau kiểm tra DOM/computed style và ảnh:

- 64 cảnh báo màu không được tự động nâng thành lỗi vì detector không biết nền thực tế; scan runtime mẫu không tái hiện contrast fail.
- Border/side-tab/bounce là heuristic phong cách, không phải defect xác minh được.
- Chỉ các vấn đề keyboard, target size, accessible name và reduced motion có bằng chứng runtime/code được ghi finding.

## 12. Phân loại K23 và vấn đề toàn site

| Nhóm | K23 branch | Có sẵn/toàn site |
|---|---|---|
| Load 29 CTĐT | PASS | — |
| Fallback sai | 0 | K25/K26 có ba ngành 0/3 |
| Trùng mã/record | 0 | K24 CNTT có 610 record lặp |
| Browser regression | Không tái hiện | Analytics local 404 |
| Responsive overflow | Không tái hiện | Không tái hiện |
| Accessibility | K23 selectors bị ảnh hưởng | Gốc ở shared AppSelect/Sidebar |
| Bundle | K23 làm tăng số chunk asset nhỏ | Main/PDF/WASM và import conflict đã mang tính kiến trúc |

## 13. Khuyến nghị theo thứ tự

1. **Trước merge/release:** xác nhận với nguồn chính thức đối với prerequisite K23 đang rỗng và các mâu thuẫn PDF còn được giữ bằng provenance; dữ liệu Quản lý tài nguyên và môi trường đã được tích hợp và kiểm thử.
2. **P1:** dedupe K24 CNTT và thêm contract test uniqueness cho toàn bộ direct source.
3. **P1:** sửa catalog/fallback ba ngành K25/K26 đang 0/3.
4. **P1/P2:** thay hoặc hoàn thiện AppSelect theo chuẩn keyboard, đồng thời nâng target 44×44 và accessible name.
5. **P2:** tách PDF/WASM/heavy tools và giải quyết import static/dynamic conflict.
6. **P2/P3:** thêm reduced motion, xác định chiến lược theme và kiểm thử visual regression.
7. Mở rộng Playwright config chính thức thêm Firefox/WebKit, tablet, 360 px và test tuần tự K23 để biến audit thủ công này thành regression gate.

## 14. Giới hạn kiểm chứng

- Không dùng tài khoản Portal thật; luồng đăng nhập, dữ liệu live, rate limit và thay đổi upstream không được xác nhận end-to-end.
- Không audit Android native, camera/optical hardware hoặc extension trong browser store; chỉ build extension production.
- Performance là local warm-run, không có throttling/Lighthouse CI/RUM.
- Không tạo/cố ý làm hỏng dữ liệu người dùng để phủ mọi tổ hợp partial/error; dùng context cô lập và coverage thiếu có sẵn.
- Safari được đại diện bằng WebKit Playwright trên Windows, không phải Safari thật trên macOS/iOS.
- Ảnh kiểm chứng không được commit vì yêu cầu cuối chỉ cho phép hai báo cáo mới.

## 15. Trạng thái Git tại thời điểm cập nhật báo cáo

Worktree vẫn dirty và không được commit/push. Đợt hoàn thiện K23 thêm dữ liệu Quản lý tài nguyên và môi trường, chuẩn hóa mã Toán, cập nhật registry/contract/E2E và các báo cáo; mọi thay đổi ngoài phạm vi có sẵn của người dùng được giữ nguyên.

## 16. Phụ lục tái kiểm định phát hành — 30/08/2026

Vòng cuối được chạy lại trên cùng branch/HEAD, sau khi đối chiếu trực quan đủ 29 PDF K23 duy nhất (874 trang). Kết quả không làm thay đổi kết luận điều hành: **không phát hiện regression website do K23 và không có P0**.

### Kết quả chạy lại

- `git diff --check`: PASS; 4 cảnh báo LF→CRLF, không có whitespace error.
- `npm run check`: PASS; typecheck, **13/13 file và 85/85 test**, extension production `0.2.7`, web build.
- `npm run test:e2e`: PASS **8/8**; 29/29 chương trình K23 được tải tuần tự ở desktop/mobile Chromium mà không có lỗi CTĐT.
- `npm audit --omit=dev`: PASS, 0 vulnerability.
- Production HTTP static: cấu hình hiển thị đúng K23 → Khoa Môi trường → Quản lý tài nguyên và môi trường; các chunk `courses`, `prerequisites`, `categories` trả HTTP 200; console không có warning/error và không có ảnh hỏng.
- Responsive thực đo: `documentElement.scrollWidth` bằng viewport ở cả 390×844 và 360×800; thanh điều hướng mobile và nội dung không bị cắt ngang.

### Phát hiện được xác minh trong vòng cuối

**A11Y-04 — P2 — vùng chạm mobile chưa đạt 44×44 px trên màn Cài đặt**

- **Tái hiện:** viewport 390×844, K23/Quản lý tài nguyên và môi trường, route `/settings`.
- **Bằng chứng:** 14/31 phần tử tương tác hiển thị có một chiều dưới 44 px. Nút thông báo 40×40; bốn AppSelect cao 43 px; nhiều nút hành động cao 36–39 px; một nút icon 32×32.
- **Tác động:** giảm khả năng thao tác chính xác bằng ngón tay, nhất là người dùng hạn chế vận động.
- **Hướng sửa:** chuẩn hóa `min-width`/`min-height: 44px` cho icon button và `min-height: 44px` cho select/action trên touch breakpoint; giữ visual density desktop bằng media query phù hợp.
- **Nguồn gốc:** shared UI toàn site; không liên quan asset hay logic K23.

Detector Impeccable tiếp tục trả 83 heuristic trên 42 file: gray-on-color, accent border và bounce. Không cảnh báo nào được nâng thành defect chỉ dựa trên detector. Ảnh production và DOM thực không cho thấy overflow hoặc nội dung K23 bị vỡ; các vấn đề màu/kiểu cần đo contrast theo từng trạng thái trước khi sửa.

### Cảnh báo không chặn phát hành K23

- Main JS 2,334.22 kB (gzip 613.10 kB), `react-pdf` 1,462.98 kB và ZXing WASM 1,065.87 kB; Rollup cảnh báo chunk trên 500 kB.
- Ba asset K24 CNTT vừa import tĩnh vừa import động nên không được tách chunk. Đây là nợ kiến trúc cũ, không phải do 29 asset K23 được lazy-load.
- Server static cục bộ trả 404 cho `/_vercel/insights/script.js`; production hosting mới là môi trường hợp lệ của tài nguyên này. Không có lỗi console trong lượt browser cuối.
- Firefox/WebKit không được chạy lại riêng trong phụ lục ngày 30/08; kết quả đa engine ở thân báo cáo vẫn là kết quả vòng audit trước. Regression gate cuối chính thức của repo hiện gồm desktop/mobile Chromium.

### Trạng thái chốt

K23 đạt 9 khoa, 29 chương trình, 4.111 record và 87/87 asset trực tiếp; không fallback, không trùng mã, không thiếu category reference. Vòng cuối không tạo thay đổi mã nguồn/dữ liệu ngoài hai báo cáo, không commit/push và không để server kiểm thử chạy nền.
