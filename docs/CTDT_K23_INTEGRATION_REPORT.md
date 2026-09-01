# Báo cáo tích hợp chương trình đào tạo K23

Ngày kiểm tra: 29/08/2026

Branch: `codex/integrate-k23-12-programs`

Commit nền: `98fb4b2`

## 1. Kết quả tổng hợp

- Đợt bổ sung đã kiểm tra 18 ZIP, tích hợp 17 chương trình mới và bỏ qua 1 ZIP Hóa học trùng hoàn toàn theo SHA-256.
- Sau khi thêm 92 môn Quản lý tài nguyên và môi trường và gộp hai alias `MTH5556` về `MTH10556`, toàn bộ catalog K23 có 9 khoa, 29 chương trình và 4.111 bản ghi môn học.
- Mỗi chương trình có đủ ba asset runtime: `courses.ts`, `categories.ts`, `prerequisites.ts`; tổng cộng 87 file cho 29 chương trình.
- Không chép `validation-report.md` vào runtime và không thay đổi public type/schema.
- Mọi chương trình K23 dùng trực tiếp dữ liệu `k23`, không fallback sang K24.
- Kiểm toán kỹ thuật sau chuẩn hóa đạt 4.111/4.111 môn có thể truy cập trong toàn catalog.

## 2. Kiểm kê 18 ZIP đợt bổ sung

Thư mục nguồn chung: `D:/Downloads`. Đường dẫn đích bên dưới nằm dưới `src/assets/data/academic-programs/`.

| ZIP nguồn | SHA-256 | Đích canonical | Số môn | Kiểm toán nguồn | Xử lý |
|---|---|---:|---:|---|---|
| `ustudy-data-k23-khoa-dia-chat-dia-chat-hoc.zip` | `8704d8ef422560f392f03ecb3f1e1e80ed639ce706f3159eb8e10e119c7f94a4` | `khoa-dia-chat/dia-chat-hoc/k23` | 132 | WARNING | Tích hợp |
| `ustudy-data-k23-khoa-dia-chat-ky-thuat-dia-chat.zip` | `7d3604cc4d322c82d135becd27a5e1882f21d2038483b06b679240063adbfdd0` | `khoa-dia-chat/ky-thuat-dia-chat/k23` | 89 | FAIL nguồn | Tích hợp có ghi nhận xung đột |
| `ustudy-data-k23-khoa-dien-tu-vien-thong-ky-thuat-dien-tu-vien-thong.zip` | `bd24f486f476a08d475205f129069d2b85e8d42810ff3624a2cf943ed5879eae` | `khoa-dien-tu-vien-thong/ky-thuat-dien-tu-vien-thong/k23` | 148 | PASS | Tích hợp |
| `ustudy-data-k23-khoa-hoa-hoa-hoc-cntn.zip` | `69e180b3fcc1e1436de32c06f3c5a0817d1b128f7f9a0432c6d8709a0fee9f5b` | `khoa-hoa/cu-nhan-tai-nang/k23` | 145 | WARNING | Tích hợp |
| `ustudy-data-k23-khoa-toan-tin-hoc-khoa-hoc-du-lieu.zip` | `f43de827634687b9d13b74b31fd917dfad9d12d68136a8740d0d598261fd8316` | `khoa-toan/khoa-hoc-du-lieu/k23` | 81 | PASS | Tích hợp |
| `ustudy-data-k23-khoa-toan-tin-hoc-toan-hoc-cntn.zip` | `ce9d4308d65df41383b108dafc78202c5decf1d71ad22ff57011c3149f53351d` | `khoa-toan/cu-nhan-tai-nang/k23` | 205 | WARNING | Tích hợp |
| `ustudy-data-k23-khoa-toan-tin-hoc-toan-hoc.zip` | `d62c5f51a12516a00f1015c088d6c3d11cf4ad219b2d294c2ff8cb261f237844` | `khoa-toan/toan-hoc/k23` | 206 | WARNING | Tích hợp |
| `ustudy-data-k23-khoa-toan-tin-hoc-toan-tin.zip` | `4eef3f28669ae50d5b60bc0117613d9fbb6f20eeeec27194a0c0040457a89370` | `khoa-toan/toan-tin/k23` | 202 | WARNING | Tích hợp |
| `ustudy-data-k23-khoa-toan-tin-hoc-toan-ung-dung.zip` | `efe7036034faa54e9605e864c75ffb1ffbfb87f9d6ad86aeb9aaefd784d403f6` | `khoa-toan/toan-ung-dung/k23` | 205 | WARNING | Tích hợp |
| `ustudy-data-k23-khoa-vat-ly-ki-thuat-cong-nghe-vat-lieu.zip` | `205c315867c5754dab93c8dd4788586fbce5ff711598856dab4affd0e5c494d2` | `khoa-khoa-hoc-va-cong-nghe-vat-lieu/cong-nghe-vat-lieu/k23` | 97 | WARNING | Tích hợp |
| `ustudy-data-k23-khoa-vat-ly-ky-thuat-hai-duong-hoc.zip` | `1f33c74be53e3e9800f519f60a82794f34c396d57c242bdd673549f6fc4c99ca` | `khoa-ly/hai-duong-hoc/k23` | 125 | WARNING | Tích hợp |
| `ustudy-data-k23-khoa-vat-ly-ky-thuat-khoa-hoc-vat-lieu.zip` | `caf8dce06798f3c5035a31d89f28ee4a4a902efd859b569e6f43bf39e41fd42b` | `khoa-khoa-hoc-va-cong-nghe-vat-lieu/khoa-hoc-vat-lieu/k23` | 110 | WARNING | Tích hợp |
| `ustudy-data-k23-khoa-vat-ly-ky-thuat-ky-thuat-hat-nhan.zip` | `1c42b15e135922219cf65f4eac3e6f7aff00a92f0af1fabd91f9ae16bd37fa67` | `khoa-ly/ky-thuat-hat-nhan/k23` | 81 | PASS | Tích hợp |
| `ustudy-data-k23-khoa-vat-ly-ky-thuat-vat-ly-hoc-cntn.zip` | `e6d3957b687148df03827cf814c520a3279d7b73b6e3d9987349610a9023cbf9` | `khoa-ly/cu-nhan-tai-nang-vat-ly-hoc/k23` | 142 | PASS | Tích hợp |
| `ustudy-data-k23-khoa-vat-ly-ky-thuat-vat-ly-hoc.zip` | `34319e163a61a3f91505a5fd27bac5f6b6024f1afeebcbfd65364f325c5854ae` | `khoa-ly/vat-ly-hoc/k23` | 142 | PASS | Tích hợp |
| `ustudy-data-k23-khoa-vat-ly-ky-thuat-vat-ly-y-khoa.zip` | `2ca6b7ade2aab6e5f6cadede70af38294b7d7e15db82eeed07496271d8d92853` | `khoa-ly/vat-ly-y-khoa/k23` | 65 | WARNING | Tích hợp |
| `ustudy-data-k23-khoa-moi-truong-quan-ly-tai-nguyen-moi-truong.zip` | `646788883b6d3f7aecf406e2f6f0b4123222b81fbb9fb5c24f8cb077f267f1c5` | `khoa-moi-truong/quan-ly-tai-nguyen-va-moi-truong/k23` | 92 | FAIL nguồn đã xử lý có căn cứ | Tích hợp; điền metadata bắt buộc và giữ provenance |
| `ustudy-data-k23-khoa-hoa-hoa-hoc (1).zip` | `8c835fdb21624537f6d055b1b9e6738b29487524a61385e56c4742db6c18b9b6` | `khoa-hoa/hoa-hoc/k23` | 167 | Trùng gói đã có | Bỏ qua; SHA-256 giống `ustudy-data-k23-khoa-hoa-hoa-hoc.zip` |

Tổng kiểm toán nguồn của 17 gói mới: **5 PASS, 10 WARNING, 2 FAIL nguồn**. `FAIL nguồn` không phải lỗi runtime: Kỹ thuật địa chất và Quản lý tài nguyên và môi trường đều vượt contract sau khi ưu tiên bảng CTĐT chi tiết, đối chiếu số giờ/đa số lần xuất hiện và ghi rõ provenance.

## 3. Ma trận đầy đủ 29 chương trình K23

`Category` là số node category cấp cao; `prerequisite` là số quan hệ trong file tiên quyết.

| Khoa | Chương trình | Slug | Môn | Category | Prerequisite | Trạng thái nạp |
|---|---|---|---:|---:|---:|---|
| CNTT | Công nghệ Thông tin | `khoa-cntt/cong-nghe-thong-tin` | 189 | 4 | 0 | PASS, 3/3 |
| CNTT | Hệ thống thông tin | `khoa-cntt/he-thong-thong-tin` | 160 | 7 | 0 | PASS, 3/3 |
| CNTT | Kỹ thuật phần mềm | `khoa-cntt/ky-thuat-phan-mem` | 161 | 7 | 0 | PASS, 3/3 |
| CNTT | Khoa học máy tính | `khoa-cntt/khoa-hoc-may-tinh` | 169 | 4 | 0 | PASS, 3/3 |
| CNTT | Trí tuệ nhân tạo | `khoa-cntt/tri-tue-nhan-tao` | 159 | 7 | 0 | PASS, 3/3 |
| CNTT | Cử nhân tài năng | `khoa-cntt/cu-nhan-tai-nang` | 176 | 4 | 0 | PASS, 3/3 |
| Khoa học và Công nghệ Vật liệu | Khoa học vật liệu | `khoa-khoa-hoc-va-cong-nghe-vat-lieu/khoa-hoc-vat-lieu` | 110 | 4 | 0 | PASS, 3/3 |
| Khoa học và Công nghệ Vật liệu | Công nghệ vật liệu | `khoa-khoa-hoc-va-cong-nghe-vat-lieu/cong-nghe-vat-lieu` | 97 | 4 | 0 | PASS, 3/3 |
| Toán - Tin học | Toán học | `khoa-toan/toan-hoc` | 205 | 5 | 0 | PASS, 3/3 |
| Toán - Tin học | Toán - Tin | `khoa-toan/toan-tin` | 202 | 4 | 0 | PASS, 3/3 |
| Toán - Tin học | Toán ứng dụng | `khoa-toan/toan-ung-dung` | 205 | 5 | 0 | PASS, 3/3 |
| Toán - Tin học | Khoa học dữ liệu | `khoa-toan/khoa-hoc-du-lieu` | 81 | 2 | 0 | PASS, 3/3 |
| Toán - Tin học | Cử nhân tài năng ngành Toán học | `khoa-toan/cu-nhan-tai-nang` | 204 | 10 | 0 | PASS, 3/3 |
| Địa chất | Địa chất học | `khoa-dia-chat/dia-chat-hoc` | 132 | 4 | 0 | PASS, 3/3 |
| Địa chất | Kỹ thuật địa chất | `khoa-dia-chat/ky-thuat-dia-chat` | 89 | 4 | 0 | PASS, 3/3 |
| Vật lý - Vật lý Kỹ thuật | Vật lý học | `khoa-ly/vat-ly-hoc` | 142 | 4 | 0 | PASS, 3/3 |
| Vật lý - Vật lý Kỹ thuật | Vật lý y khoa | `khoa-ly/vat-ly-y-khoa` | 65 | 4 | 0 | PASS, 3/3 |
| Vật lý - Vật lý Kỹ thuật | Hải dương học | `khoa-ly/hai-duong-hoc` | 125 | 4 | 0 | PASS, 3/3 |
| Vật lý - Vật lý Kỹ thuật | Kỹ thuật hạt nhân | `khoa-ly/ky-thuat-hat-nhan` | 81 | 4 | 0 | PASS, 3/3 |
| Vật lý - Vật lý Kỹ thuật | CN Vật lý điện tử và tin học | `khoa-ly/cong-nghe-vat-ly-dien-tu-va-tin-hoc` | 79 | 4 | 0 | PASS, 3/3 |
| Vật lý - Vật lý Kỹ thuật | Cử nhân tài năng ngành Vật lý học | `khoa-ly/cu-nhan-tai-nang-vat-ly-hoc` | 142 | 5 | 0 | PASS, 3/3 |
| Hóa học | Hóa học | `khoa-hoa/hoa-hoc` | 167 | 9 | 0 | PASS, 3/3 |
| Hóa học | Cử nhân tài năng ngành hóa học | `khoa-hoa/cu-nhan-tai-nang` | 145 | 4 | 0 | PASS, 3/3 |
| Sinh học - Công nghệ sinh học | Sinh học | `khoa-sinh/sinh-hoc` | 196 | 4 | 0 | PASS, 3/3 |
| Sinh học - Công nghệ sinh học | Công nghệ sinh học | `khoa-sinh/cong-nghe-sinh-hoc` | 173 | 4 | 0 | PASS, 3/3 |
| Môi trường | Công nghệ kỹ thuật môi trường | `khoa-moi-truong/cong-nghe-ky-thuat-moi-truong` | 95 | 4 | 0 | PASS, 3/3 |
| Môi trường | Khoa học môi trường | `khoa-moi-truong/khoa-hoc-moi-truong` | 122 | 4 | 0 | PASS, 3/3 |
| Môi trường | Quản lý tài nguyên và môi trường | `khoa-moi-truong/quan-ly-tai-nguyen-va-moi-truong` | 92 | 4 | 0 | PASS sau chuẩn hóa, 3/3 |
| Điện tử - Viễn thông | Kỹ thuật Điện tử - Viễn thông | `khoa-dien-tu-vien-thong/ky-thuat-dien-tu-vien-thong` | 148 | 8 | 0 | PASS, 3/3 |
| **Tổng** | **29 chương trình** |  | **4.111** | **141** | **0** | **PASS** |

## 4. Mâu thuẫn và quyết định dữ liệu

### Kỹ thuật địa chất — xung đột bắt buộc phải lưu ý

- PDF có xung đột mã **`GEO10413`/`GEO20208`** cho cùng vị trí học phần giữa phần tổng hợp và bảng CTĐT chi tiết.
- Dữ liệu runtime giữ **`GEO10413`**, vì đây là mã xuất hiện tại bảng CTĐT chi tiết — nguồn có độ chi tiết cao hơn và đi kèm đầy đủ metadata học phần.
- Tên học phần `GEO10113` cũng có khác biệt giữa các phần của PDF; dữ liệu giữ tên trong bảng chi tiết.
- Do mâu thuẫn mã môn nguồn không thể tự suy ra chắc chắn chỉ từ PDF, validation nguồn đánh dấu FAIL; contract dữ liệu runtime vẫn PASS.

### Quản lý tài nguyên và môi trường — hoàn thiện metadata bắt buộc

- `BAA00022` được gán `BB`: PDF trang 9 in `B`, trong khi `BAA00021` ngay trước đó là `BB` và toàn bộ dữ liệu K23 dùng cùng phân loại cho Thể dục 2.
- `ENM10102 = 3 TC`, `ENM10113 = 2 TC`, `ENM10208 = 3 TC` theo bảng nội dung CTĐT chi tiết, cơ cấu giờ và đa số lần xuất hiện. Trang 20 lần lượt in 2/3/2 TC và được ghi rõ là mâu thuẫn nguồn trong `description`.
- `BIO00001` giữ tên “Sinh đại cương 1” theo bảng nội dung CTĐT và cách gọi nhất quán trong dữ liệu K23; kế hoạch trang 15 dùng “Sinh học đại cương 1”.
- Ba option chuyên ngành được làm phẳng thành danh sách course trực tiếp cho giao diện; tín chỉ bắt buộc/tự chọn và quy tắc chọn vẫn nằm trong `note`.

### Các cảnh báo còn lại

- **Địa chất học:** `GEO10613/GEO10601` và `GEO10614/GEO10603` không nhất quán giữa các bảng; giữ `GEO10613`, `GEO10614` theo bảng chi tiết.
- **Điện tử - Viễn thông:** `ETC10307` là TC trong một lộ trình nhưng BB ở lộ trình khác; course record hợp nhất dùng BB, còn vị trí của từng lộ trình được giữ trong category.
- **Hóa học CNTN:** tổng tín chỉ Giáo dục thể chất có chỗ ghi 8, có chỗ ghi 4; `CHE10505/CHE10506` cũng không thống nhất. Dữ liệu giữ bảng CTĐT chính.
- **Khoa học dữ liệu:** phần tốt nghiệp có khác biệt cách phân loại giữa bảng tổng hợp và bảng chi tiết; giữ bảng chi tiết. Gói vẫn đạt PASS nguồn vì không làm mất hoặc đổi mã môn.
- **Toán học và Toán học CNTN:** `MTH5556` được xác định là mã in thiếu của `MTH10556` vì trùng hoàn toàn tên, 4 TC và 45 LT + 30 TH; mọi reference được gộp về `MTH10556` và record alias bị loại. `MTH10425` vẫn không được tạo vì thiếu số giờ và BB/TC.
- **Toán - Tin:** các pool ghi 24/20/24 tín chỉ nhưng quy tắc yêu cầu chọn 16; category thể hiện đúng quy tắc chọn 16. Lỗi gõ `MT10442` được chuẩn hóa thành `MTH10442` theo metadata.
- **Toán ứng dụng:** pool Cơ học 24 tín chỉ nhưng mục tiêu 16; pool Tối ưu 19 nhưng mục tiêu 15. Category giữ toàn bộ pool và ghi rõ mức tín chỉ phải chọn.
- **Công nghệ vật liệu:** phần tốt nghiệp được ghi BB ở bảng tổng hợp nhưng bảng chi tiết có cả BB/TC; giữ phân loại từng học phần trong bảng chi tiết.
- **Hải dương học:** `OMH10390` chỉ xuất hiện ở lịch, thiếu metadata nên không tạo record; một phương án 4 tín chỉ lại chứa môn 3 tín chỉ, được giữ nguyên và ghi chú thay vì tự sửa tín chỉ.
- **Khoa học vật liệu:** PDF thiếu nhánh “Vật liệu Từ” và có xung đột số môn/tín chỉ tốt nghiệp; giữ các nhánh và bảng chi tiết thực sự có dữ liệu.
- **Vật lý y khoa:** nguồn có `MPH10995/NTE10995`; giữ `MPH10995` theo bảng chi tiết.
- **Vật lý học, Vật lý học CNTN và Kỹ thuật hạt nhân:** không phát hiện mâu thuẫn dữ liệu nguồn cần can thiệp.

Nguyên tắc chung: không tự thay đổi mã môn, tín chỉ, số giờ hoặc BB/TC khi không có căn cứ rõ ràng; ưu tiên bảng CTĐT chi tiết và ghi nhận các điểm không thể kết luận chắc chắn.

## 5. Chuẩn hóa category cho giao diện

Đã chuẩn hóa 10 file `categories.ts`:

1. `khoa-dien-tu-vien-thong/ky-thuat-dien-tu-vien-thong/k23/categories.ts`
2. `khoa-toan/toan-hoc/k23/categories.ts`
3. `khoa-toan/cu-nhan-tai-nang/k23/categories.ts`
4. `khoa-toan/toan-tin/k23/categories.ts`
5. `khoa-ly/hai-duong-hoc/k23/categories.ts`
6. `khoa-khoa-hoc-va-cong-nghe-vat-lieu/khoa-hoc-vat-lieu/k23/categories.ts`
7. `khoa-ly/ky-thuat-hat-nhan/k23/categories.ts`
8. `khoa-ly/vat-ly-hoc/k23/categories.ts`
9. `khoa-ly/cu-nhan-tai-nang-vat-ly-hoc/k23/categories.ts`
10. `khoa-moi-truong/quan-ly-tai-nguyen-va-moi-truong/k23/categories.ts`

Quy tắc bảo toàn:

- Mỗi option chứa trực tiếp danh sách course ID đã khử trùng lặp theo thứ tự nguồn.
- Tên nhóm, số tín chỉ, BB/TC và quy tắc chọn ở các node con được chuyển đầy đủ vào `note`.
- Không còn `breakdown` hoặc `options` lồng bên trong một option.
- Vật lý học thường được nâng từ hai lớp “Định hướng” thành 7 option chuyên ngành trực tiếp; tên định hướng cũ được giữ trong note.
- Phần tốt nghiệp Điện tử - Viễn thông có 6 option trực tiếp, tương ứng 3 chuyên ngành × 2 phương án tốt nghiệp.
- Không thay đổi course record, mã môn, tín chỉ, giờ học hoặc BB/TC trong quá trình chuẩn hóa.

## 6. Registry, Workspace và contract test

- Registry K23 được mở rộng theo thứ tự khoa của K24: CNTT, Vật liệu, Toán, Địa chất, Vật lý, Hóa học, Sinh học, Môi trường, Điện tử - Viễn thông.
- Workspace coverage đã dùng đường dẫn thật `academic-programs/<faculty>/<major>/<cohort>/...`; mọi chương trình K23 hiển thị đúng 3/3.
- Thống kê số khoa của Workspace được tính từ catalog đang chọn; K23 hiển thị đúng 9 thay vì dùng tổng khoa toàn cục.
- Contract test kiểm tra đúng 9 khoa, 29 chương trình, 4.111 course record và 87 asset runtime.
- Mỗi chương trình được kiểm tra: số môn, mã duy nhất, trường bắt buộc, số không âm, `course_type` BB/TC, bốn môn Anh văn là TC, prerequisites là mảng rỗng, category đúng schema, không có option lồng, không thiếu reference và mọi môn có thể truy cập theo thuật toán của `TrainingProgramView`.

## 7. Kết quả kiểm thử và smoke-test

| Hạng mục | Kết quả |
|---|---|
| `npm run typecheck:test` | PASS |
| Contract test K23 | PASS — 33/33 test |
| Toàn bộ unit test | PASS — 13 file, 85/85 test |
| `npm run build:web` | PASS |
| `npm run check` | PASS — typecheck, 85/85 unit test, extension build và web build |
| Workspace K23 | PASS — 9 khoa, 29/29 chương trình đủ 3/3, 0 thiếu |
| E2E smoke K23 | PASS — tuần tự 29/29 chương trình trên desktop và mobile Chromium; 2/2 project, không console/page error CTĐT |
| Cài đặt K23 | PASS — chọn và lưu tuần tự đủ 29/29 chương trình |
| Trạng thái “Đang cập nhật dữ liệu” | Không xuất hiện với catalog K23 |

Smoke-test chạy trên production preview, dùng browser context cô lập và trạng thái nhập dữ liệu tối thiểu. Console không có lỗi nạp asset chương trình; lỗi duy nhất ở các lượt audit trước là script Vercel Insights trả HTML trên web server cục bộ, không liên quan CTĐT hoặc runtime production.

## 8. Trạng thái Git và phạm vi bàn giao

- Branch vẫn là `codex/integrate-k23-12-programs`, HEAD `98fb4b2`.
- Không commit và không push.
- Các thay đổi gồm 87 file dữ liệu K23, registry, Workspace coverage, contract test, cấu hình type của test và báo cáo này.
- `docs/CTDT_TO_USTUDY_DATA_TEMPLATE.md` vẫn là file untracked có sẵn của người dùng; không sửa và không stage.
- Không có `validation-report.md` trong cây runtime.

## 9. Tái kiểm tra cuối bằng PDF nguồn — 30/08/2026

Đợt xác minh cuối không chỉ dựa vào ZIP/parser. Toàn bộ **29 PDF K23 duy nhất, 874 trang** trong `D:/Downloads` đã được kiểm kê, render trang bìa và xem trực quan các trang chứa dữ liệu có xung đột. Có 30 file mang tên K23 vì PDF Quản lý tài nguyên và môi trường có thêm bản `(1)`, nhưng hai file trùng SHA-256 `e0556541bbffe0bfab94366748603a80dfb147801ecb64b4062ce4960ca9a221`; do đó vẫn chỉ có 29 nguồn CTĐT duy nhất. Trang bìa của cả 29 nguồn đều ghi khóa tuyển 2023 và khớp ngành runtime.

### Bằng chứng trực quan cho các quyết định quan trọng

| Chương trình | Trang PDF đã xem | Nội dung nguồn | Kết luận runtime |
|---|---:|---|---|
| Quản lý tài nguyên và môi trường | 8, 9, 11–15, 18–20 | `BIO00001` có hai cách gọi; `BAA00022` in thiếu một chữ `B`; ba môn `ENM10102/ENM10113/ENM10208` có tín chỉ mâu thuẫn giữa bảng chi tiết và kế hoạch | Giữ “Sinh đại cương 1”; chuẩn hóa `BAA00022 = BB`; dùng lần lượt 3/2/3 TC theo bảng chi tiết, số giờ và đa số lần xuất hiện |
| Kỹ thuật địa chất | 10, 15 | `GEO10413` có metadata đầy đủ ở bảng chi tiết, kế hoạch dùng `GEO20208` | Giữ `GEO10413`; không tạo alias thiếu căn cứ |
| Địa chất học | 14, 22 | `GEO10613/GEO10614` đối lập `GEO10601/GEO10603` | Giữ mã ở bảng CTĐT chi tiết |
| Hóa học | 12, 30, 32–33, 46 | Dãy Hóa phân tích dùng `CHE103xx` ở bảng chính nhưng `CHE102xx` ở bảng phụ và va chạm dãy Hóa lý; `CHE10132` có chỗ 2 TC, chỗ 3 TC với 30 LT + 30 TH | Giữ `CHE103xx`; `CHE10132 = 3 TC` |
| Vật lý y khoa | 9, 13 | Khóa luận là `MPH10995` ở bảng chi tiết nhưng `NTE10995` ở kế hoạch | Giữ `MPH10995` |
| Hải dương học | 18–20, 34 | `OMH10390` chỉ có ở lịch, không có metadata bắt buộc trong bảng chính; pool 4 TC chứa một môn 3 TC | Không tạo `OMH10390`; giữ pool và note, không tự suy diễn |
| Toán học | 11, 30 | `MTH10556` và `MTH5556` trùng hoàn toàn tên, 4 TC và 45 LT + 30 TH | Gộp alias về `MTH10556` |
| Toán học CNTN | 13 | `MTH10425` có 3 TC nhưng thiếu số giờ và BB/TC | Omission có chủ đích; không dựng metadata giả |
| Công nghệ kỹ thuật môi trường | 11, 14, 21, 23 | `ENE10172` là 2 TC với 15 LT + 30 TH ở bảng chi tiết, nhưng 3 TC ở kế hoạch | Giữ 2 TC |

Riêng Quản lý tài nguyên và môi trường, các tổng ở bảng chi tiết tự khớp: toàn khóa **135 TC**, giáo dục đại cương **53**, cơ sở/ngành **52**, mỗi chuyên ngành **20** và tốt nghiệp **10**. PDF không công bố quan hệ tiên quyết/học trước/song hành/khuyến nghị, vì vậy `prerequisites.ts` rỗng là biểu diễn trung thực nguồn, không phải lỗi parser.

### Đối chiếu runtime với gói dữ liệu

- Bộ mã môn chuẩn của cả **29/29** chương trình runtime khớp gói ZIP nguồn tương ứng.
- Ngoại lệ duy nhất là alias không chuẩn `MTH5556` trong ZIP Toán: runtime cố ý loại alias sau khi đối chiếu trực quan và giữ `MTH10556` canonical.
- Trích xuất text tự động từ PDF nhận dạng mã rất kém do font/mã hóa ký tự (ví dụ mã bị vỡ thành `B,AA00021`), nên các tỷ lệ khớp thấp từ detector text được đánh dấu **false positive** và không dùng làm căn cứ sửa dữ liệu. Kết luận phía trên dựa trên ảnh render trang PDF và bảng dữ liệu nhìn được trực tiếp.

### Cổng kiểm định cuối

| Hạng mục | Kết quả ngày 30/08/2026 |
|---|---|
| `git diff --check` | PASS; chỉ có cảnh báo LF→CRLF trên 4 file tracked, không có lỗi whitespace |
| `npm run check` | PASS: typecheck, 13 file/85 test, extension 0.2.7 và web production build |
| `npm run test:e2e` | PASS: **8/8**, gồm tuần tự 29 chương trình trên desktop và mobile Chromium |
| `npm audit --omit=dev` | PASS: 0 vulnerability |
| Runtime production K23/Quản lý TN&MT | PASS: ba asset trả 200, đúng K23 trực tiếp, không console error/warning CTĐT |
| Responsive production | PASS ở 390×844 và 360×800, `scrollWidth = viewport width`, không tràn ngang |

Không phát hiện lỗi dữ liệu K23 mới có đủ bằng chứng để sửa. Các mâu thuẫn còn lại là mâu thuẫn ngay trong PDF nguồn và đã được giữ provenance/ghi chú theo nguyên tắc ưu tiên bảng CTĐT chi tiết. Branch/HEAD vẫn là `codex/integrate-k23-12-programs` / `98fb4b2`; không commit, không push và không sửa file nguồn trong `D:/Downloads`.
