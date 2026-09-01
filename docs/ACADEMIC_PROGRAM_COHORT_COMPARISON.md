# Báo cáo so sánh chương trình đào tạo theo khóa

**Ngày đối chiếu:** 2026-08-29

**Branch:** `codex/integrate-k23-12-programs`

**Commit nền:** `98fb4b27deac2f0174ea3cbda45ae7f78fbc1bfe`

**Nguồn:** runtime assets trong `src/assets/data/academic-programs`, registry hiện tại và PDF K23 có sẵn tại `D:\Downloads`

**Nguyên tắc:** không suy diễn dữ liệu chính thức khi registry chỉ fallback hoặc khi PDF mâu thuẫn

## 1. Kết luận quan trọng

K23 có **29 chương trình/9 khoa**, tất cả là nguồn trực tiếp và tải đủ ba asset. Quản lý tài nguyên và môi trường đã được bổ sung từ PDF/ZIP K23 và vượt contract với 92 mã duy nhất. Hai cảnh báo đỏ học thuật còn cần nguồn chính thức là:

1. **Toán học K23 ↔ K24 chỉ trùng khoảng 59,0% mã môn** sau chuẩn hóa alias: K23 có 205 mã canonical, K24 có 121 mã và toàn bộ 121 mã K24 nằm trong K23; K23 dư 84 mã so với K24.
2. **Toàn bộ 29 file prerequisite K23 đều rỗng**. Riêng các chương trình CNTT/Toán tương ứng ở K24 có 110–142 quan hệ. Asset “có mặt” không đồng nghĩa có độ phủ ngữ nghĩa.

Các khác biệt đỏ khác:

- K24 bỏ Cử nhân tài năng Vật lý học và thêm Nhóm ngành CNTT, CN Bán dẫn, Thiết kế vi mạch. Quản lý tài nguyên và môi trường có ở cả K23/K24 sau đợt hoàn thiện này, nhưng không tính lại so sánh nội dung K24 trong phạm vi hiện tại.
- K25 bỏ Nhóm ngành CNTT, thêm Thống kê, Kinh tế đất đai, Công nghệ giáo dục; ba ngành mới này fallback K24 nhưng K24 không có asset (`0/3`).
- K24→K25: Hệ thống thông tin chỉ trùng **39,7%**; Cử nhân tài năng CNTT chỉ trùng **63,4%**.
- Khoa học vật liệu có nhánh `MAJOR_THIN_FILM/MANDATORY` đổi yêu cầu **16→26 tín chỉ**, chạm ngưỡng đỏ 10 tín chỉ.

K25/K26 **không được kết luận giống K24**: K25 chỉ có 7/33 chương trình trực tiếp; K26 có 0/33 chương trình trực tiếp.

## 2. Quy tắc phân loại

- **Đỏ:** Jaccard mã môn `<70%`; thêm/bỏ ngành hoặc khối quan trọng; chênh tín chỉ yêu cầu `>=10`; hoặc mất quan hệ tiên quyết quy mô lớn.
- **Vàng:** Jaccard `70–85%`.
- **Xanh:** Jaccard `>85%`, không có trigger đỏ khác.
- Jaccard = `|giao mã môn| / |hợp mã môn|`.
- Số môn dùng **mã duy nhất**, không dùng raw record count. Điều này quan trọng vì asset K24 CNTT/Công nghệ Thông tin có 794 record nhưng chỉ 184 mã duy nhất.
- “Trực tiếp” nghĩa `sourceCohort === cohort`; “fallback” nghĩa registry trỏ sang khóa khác.

## 3. Tổng quan registry và khả năng tải

| Khóa | Khoa | Chương trình | Nguồn trực tiếp | Fallback | Tải đủ 3 asset | Không có dữ liệu riêng |
|---|---:|---:|---:|---:|---:|---:|
| K23 | 9 | 29 | **29** | 0 | **29** | 0 |
| K24 | 9 | 31 | **31** | 0 | **31** | 0 |
| K25 | 10 | 33 | **7** | 26 | 30 | **26** |
| K26 | 10 | 33 | **0** | 33 | 30 | **33** |

Ba cặp fallback không tải được ở cả K25/K26:

- `khoa-toan/thong-ke/k24`
- `khoa-dia-chat/kinh-te-dat-dai/k24`
- `khoa-lien-nganh/cong-nghe-giao-duc/k24`

Workspace tái hiện cả ba là `0/3 dữ liệu chương trình`, đồng thời hiển thị đang dùng nguồn K24.

## 4. 28 cặp chương trình K23 đã đối chiếu với K24

K23 hiện có 29 chương trình. Bảng lịch sử dưới đây giữ 28 cặp đã tính trước đợt bổ sung; Quản lý tài nguyên và môi trường không được mở rộng/tính lại so sánh K24 trong đợt này theo phạm vi yêu cầu.

`+K24/-K24` lần lượt là số mã chỉ có ở K24 và số mã chỉ có ở K23. “Không khớp ngành” là trigger đỏ cấu trúc.

| Khoa / ngành | K23 | K24 | Giao | Jaccard | +K24 / -K24 | Mức |
|---|---:|---:|---:|---:|---:|---|
| CNTT / Công nghệ Thông tin | 189 | 184 | 172 | 85,6% | 12 / 17 | Xanh |
| CNTT / Hệ thống thông tin | 160 | 184 | 144 | 72,0% | 40 / 16 | **Vàng** |
| CNTT / Kỹ thuật phần mềm | 161 | 184 | 145 | 72,5% | 39 / 16 | **Vàng** |
| CNTT / Khoa học máy tính | 169 | 184 | 153 | 76,5% | 31 / 16 | **Vàng** |
| CNTT / Trí tuệ nhân tạo | 159 | 184 | 143 | 71,5% | 41 / 16 | **Vàng** |
| CNTT / Cử nhân tài năng | 176 | 184 | 159 | 79,1% | 25 / 17 | **Vàng** |
| Vật liệu / Khoa học vật liệu | 110 | 107 | 102 | 88,7% | 5 / 8 | **Đỏ: tín chỉ nhánh +10** |
| Vật liệu / Công nghệ vật liệu | 97 | 99 | 86 | 78,2% | 13 / 11 | **Vàng** |
| Toán / Toán học | 205 | 121 | 121 | **59,0%** | 0 / 84 | **Đỏ** |
| Toán / Toán - Tin | 202 | 209 | 180 | 77,9% | 29 / 22 | **Vàng** |
| Toán / Toán ứng dụng | 205 | 205 | 205 | 100% | 0 / 0 | Xanh* |
| Toán / Khoa học dữ liệu | 81 | 81 | 81 | 100% | 0 / 0 | Xanh* |
| Toán / Cử nhân tài năng | 204 | 204 | 204 | 100% | 0 / 0 | Xanh* |
| Địa chất / Địa chất học | 132 | 140 | 126 | 86,3% | 14 / 6 | Xanh |
| Địa chất / Kỹ thuật địa chất | 89 | 96 | 83 | 81,4% | 13 / 6 | **Vàng** |
| Vật lý / Vật lý học | 142 | 147 | 142 | 96,6% | 5 / 0 | Xanh |
| Vật lý / Vật lý y khoa | 65 | 65 | 64 | 97,0% | 1 / 1 | Xanh |
| Vật lý / Hải dương học | 125 | 130 | 125 | 96,2% | 5 / 0 | Xanh |
| Vật lý / Kỹ thuật hạt nhân | 81 | 85 | 80 | 93,0% | 5 / 1 | Xanh |
| Vật lý / CN Vật lý điện tử và tin học | 79 | 79 | 79 | 100% | 0 / 0 | Xanh* |
| Vật lý / Cử nhân tài năng Vật lý học | 142 | — | — | — | Không khớp ngành | **Đỏ: bị bỏ** |
| Hóa / Hóa học | 167 | 176 | 167 | 94,9% | 9 / 0 | Xanh |
| Hóa / Cử nhân tài năng | 145 | 151 | 145 | 96,0% | 6 / 0 | Xanh |
| Sinh / Sinh học | 196 | 212 | 196 | 92,5% | 16 / 0 | Xanh |
| Sinh / Công nghệ sinh học | 173 | 178 | 155 | 79,1% | 23 / 18 | **Vàng** |
| Môi trường / Công nghệ kỹ thuật môi trường | 95 | 95 | 95 | 100% | 0 / 0 | Xanh* |
| Môi trường / Khoa học môi trường | 122 | 122 | 122 | 100% | 0 / 0 | Xanh* |
| Điện tử–Viễn thông / Kỹ thuật ĐTVT | 148 | 148 | 148 | 100% | 0 / 0 | Xanh* |

`*` Cùng tập mã môn **không có nghĩa metadata/cấu trúc giống nhau**. Ví dụ Toán ứng dụng có 3 tên, 1 giờ lý thuyết, 1 giờ bài tập, 16 loại BB/TC và 144 category assignment thay đổi trên các mã giao nhau; Khoa học dữ liệu có 2 tên, 4 giờ bài tập, 4 loại và 36 category assignment thay đổi.

## 5. K24 so với nguồn trực tiếp K25

Chỉ 7 chương trình sau có dữ liệu K25 riêng. Các ngành khác không được so sánh nội dung K24→K25 vì chỉ fallback.

| Ngành trực tiếp K25 | K24 | K25 | Giao | Jaccard | +K25 / -K25 | Prerequisite | Mức |
|---|---:|---:|---:|---:|---:|---:|---|
| CNTT | 184 | 154 | 151 | 80,7% | 3 / 33 | 142→133 | **Vàng** |
| Hệ thống thông tin | 184 | 73 | 73 | **39,7%** | 0 / 111 | **133→0** | **Đỏ** |
| Kỹ thuật phần mềm | 184 | 136 | 135 | 73,0% | 1 / 49 | 133→133 | **Vàng** |
| Khoa học máy tính | 184 | 151 | 148 | 79,1% | 3 / 36 | 142→133 | **Vàng** |
| Trí tuệ nhân tạo | 184 | 141 | 135 | 71,1% | 6 / 49 | 133→133 | **Vàng** |
| CNTT Cử nhân tài năng | 184 | 120 | 118 | **63,4%** | 2 / 66 | 133→133 | **Đỏ** |
| Hóa học Cử nhân tài năng | 151 | 151 | 151 | 100% | 0 / 0 | 0→0 | Xanh |

## 6. Thêm/bỏ ngành theo registry

### K23 → K24

**Thêm trong runtime K24:**

- CNTT / Nhóm ngành máy tính và công nghệ thông tin.
- Vật lý / Công nghệ bán dẫn.
- Điện tử–Viễn thông / Thiết kế vi mạch.

**Bỏ trong runtime K24:**

- Vật lý / Cử nhân tài năng ngành Vật lý học.

“Quản lý tài nguyên và môi trường” không còn được xếp là ngành mới K24: PDF/ZIP K23 đã được tích hợp thành nguồn trực tiếp K23. Báo cáo này không kết luận hai khóa giống nhau vì chưa tính lại đối chiếu nội dung K24 cho cặp này.

### K24 → K25

**Thêm:** Thống kê; Kinh tế đất đai; Công nghệ giáo dục.

**Bỏ:** Nhóm ngành máy tính và công nghệ thông tin.

Cả ba ngành thêm đều chưa có dữ liệu trực tiếp K25 và fallback K24 cũng không tồn tại; đây là cảnh báo đỏ về khả năng dùng trong app.

### K25 → K26

Registry không thêm/bỏ ngành, nhưng **33/33 đều fallback K24**. Không có cơ sở xác minh K26 giống K24 hay K25.

## 7. Metadata, BB/TC, tín chỉ và số giờ

So sánh field-level được thực hiện trên các mã môn giao nhau: `course_name_vi`, `credits`, `theory_hours`, `lab_hours`, `exercise_hours`, `course_type`, `category`.

Các khác biệt đáng chú ý:

| Cặp | Tên | TC | LT | TH | BT | BB/TC | Category |
|---|---:|---:|---:|---:|---:|---:|---:|
| K23→K24 Hệ thống thông tin | 3 | 0 | 0 | 0 | 3 | 0 | 101 |
| K23→K24 Kỹ thuật phần mềm | 4 | 0 | 0 | 0 | 3 | 0 | 101 |
| K23→K24 Khoa học máy tính | 4 | 0 | 0 | 0 | 5 | 0 | 101 |
| K23→K24 Trí tuệ nhân tạo | 6 | 0 | 0 | 0 | 3 | 0 | 101 |
| K23→K24 CNTT Cử nhân tài năng | 6 | 0 | 0 | 0 | 1 | 3 | 121 |
| K23→K24 Công nghệ vật liệu | 4 | 0 | 5 | 0 | 6 | 4 | 41 |
| K23→K24 Toán học | 0 | 0 | 0 | 0 | 7 | 0 | 58 |
| K23→K24 Toán - Tin | 9 | 0 | 1 | 0 | 5 | 24 | 152 |
| K23→K24 Kỹ thuật địa chất | 3 | 0 | 0 | 0 | 4 | 5 | 28 |
| K23→K24 Công nghệ sinh học | 9 | 0 | 0 | 0 | 8 | 0 | 111 |
| K23→K24 Công nghệ KT môi trường | 7 | **1** | 2 | 2 | 3 | 4 | 0 |
| K24→K25 Hệ thống thông tin | 8 | 0 | 0 | 0 | 0 | 8 | 49 |
| K24→K25 CNTT Cử nhân tài năng | 3 | 0 | 0 | 0 | 0 | 4 | 118 |

`TC/LT/TH/BT` trong bảng lần lượt là số course record giao nhau đổi tín chỉ/lý thuyết/thực hành/bài tập; không phải tổng tín chỉ chương trình.

### Tín chỉ yêu cầu trong cây category

So sánh các numeric path cùng tên (`credits`, `credits_required`, `total_credits_required`) tìm thấy trigger đỏ chắc chắn:

- Khoa học vật liệu, `MAJOR.breakdown.MAJOR_THIN_FILM.breakdown.MANDATORY.credits`: **16 (K23) → 26 (K24)**.

Các schema category giữa khóa không hoàn toàn đồng dạng, nên chỉ so numeric path trùng khớp; không ép ghép các khối khác tên. Việc category assignment đổi hàng chục/hàng trăm môn cho thấy cấu trúc khối kiến thức đã được tái phân loại mạnh ngay cả khi tập mã môn giống nhau.

## 8. Tiên quyết, học trước và song hành

- K23: **29/29 `prerequisites.ts` có mặt nhưng đều là mảng rỗng**; tổng quan hệ = 0.
- K24: các chương trình CNTT có 133 hoặc 142 quan hệ; Toán học, Toán–Tin, Toán ứng dụng và Toán CNTN có 110 quan hệ; nhiều ngành khác vẫn 0.
- K25 trực tiếp: Hệ thống thông tin giảm 133→0; các chương trình CNTT khác giữ khoảng 133, riêng CNTT/KHMT 142→133.

Đây là khác biệt lớn về hành vi: lộ trình K23 không thể cảnh báo tiên quyết/học trước/song hành dù file asset tồn tại. Không có PDF quan hệ riêng để xác nhận đây là chủ ý hay thiếu dữ liệu; cần hỏi đơn vị đào tạo hoặc nguồn chính thức, không tự sinh quan hệ từ tên môn.

## 9. Phân tích chi tiết các trường hợp đỏ

### RED-01 — Toán học K23 ↔ K24, Jaccard khoảng 59,0%

- K23 205 mã canonical; K24 121 mã; giao 121; K24 không thêm mã nào nhưng bỏ 84 mã so với K23.
- 58 category assignment và 7 `exercise_hours` đổi trên phần giao.
- Prerequisite 0→110.
- Khả năng: K23 asset chứa catalog rộng/các nhóm tự chọn hơn, hoặc K24 asset chỉ chứa phần được chọn. Không thể xác định chỉ bằng code.
- Cần đối chiếu bảng môn và tổng tín chỉ bắt buộc/tự chọn trong PDF K24 tương ứng; hiện `D:\Downloads` không có PDF K24 để kết luận.

### RED-02 — K23 Cử nhân tài năng Vật lý học bị bỏ ở K24

- K23 có 142 mã và PDF `CTDT_LY_TN2023.pdf`.
- K24 không có cặp ngành tương ứng trong registry.
- Cần xác minh chương trình dừng tuyển, đổi tên/ghép vào Vật lý học hay registry K24 thiếu.

### RESOLVED-03 — Quản lý tài nguyên và môi trường đã có runtime K23

- PDF 21 trang, trang 1 ghi “Chương trình đào tạo ngành Quản lý tài nguyên và môi trường — Khóa tuyển: 2023”, mã ngành 7850101.
- Registry K23 đã thêm nguồn trực tiếp `k23`; đủ 3/3 asset, 92 mã duy nhất và 92/92 môn reachable.
- Các mâu thuẫn `BAA00022`, `BIO00001`, `ENM10102`, `ENM10113`, `ENM10208` được xử lý theo bảng CTĐT chi tiết/số giờ/đa số lần xuất hiện và lưu provenance trong `description`.
- Đây không còn là cảnh báo đỏ catalog. Vẫn cần nguồn chính thức nếu muốn dứt điểm các mâu thuẫn nội bộ của PDF.

### RED-04 — Khoa học vật liệu, nhánh Màng mỏng +10 tín chỉ

- Numeric path cùng tên đổi 16→26 tín chỉ.
- Tập mã vẫn trùng 88,7%, nên khác biệt sẽ bị bỏ sót nếu chỉ nhìn Jaccard.
- Cần kiểm tra PDF hai khóa về tổng tín chỉ bắt buộc của định hướng Màng mỏng và quy tắc tốt nghiệp.

### RED-05 — Hệ thống thông tin K24 ↔ K25, Jaccard 39,7%

- 184→73 mã; K25 là tập con 73 mã, bỏ 111 mã.
- 8 tên, 8 BB/TC, 49 category assignment thay đổi trên phần giao.
- Prerequisite 133→0.
- Vì K25 là nguồn trực tiếp, đây không phải hiệu ứng fallback. Có thể asset K25 chưa hoàn tất hoặc mô hình chương trình thay đổi rất lớn; cần PDF/quyết định K25.

### RED-06 — CNTT Cử nhân tài năng K24 ↔ K25, Jaccard 63,4%

- 184→120 mã; giao 118; thêm 2, bỏ 66.
- 3 tên, 4 BB/TC, 118 category assignment thay đổi.
- Prerequisite vẫn 133.
- Cần xác minh K25 có cố ý rút gọn catalog hay thiếu các nhóm tự chọn.

### RED-07 — Ngành mới K25/K26 fallback vào đường dẫn không tồn tại

- Thống kê, Kinh tế đất đai, Công nghệ giáo dục được đưa vào catalog.
- K25 không đặt `dataSourceCohort: 'k25'`, nên dùng default K24; K26 cũng default K24.
- Không có ba thư mục K24 tương ứng; Workspace hiển thị 0/3.
- Không được mô tả các khóa này là “giống K24”; trạng thái đúng là **chưa có dữ liệu riêng và fallback không khả dụng**.

### RED-08 — Khoảng trống prerequisite K23

- 87 asset K23 có mặt nhưng 29 prerequisite asset đều rỗng.
- So với CNTT/Toán K24, mức chênh 110–142 quan hệ/chương trình là rất lớn.
- Tác động trực tiếp đến cảnh báo lộ trình và điều kiện đăng ký môn.

## 10. Đối chiếu PDF K23

### Độ phủ nguồn

- Tìm thấy **29 PDF CTĐT K23**, tổng **874 trang**; 29/29 đọc được bằng Poppler.
- 29 PDF khớp 29 chương trình runtime hiện tại; Quản lý tài nguyên và môi trường đã được ánh xạ vào K23.
- Đã render và xem trực quan các trang 9, 11–14 và 20 PDF Quản lý tài nguyên và môi trường cùng trang 15 PDF Kỹ thuật địa chất; text extraction xác nhận cohort/tên ngành, mã và các vị trí mâu thuẫn.
- Không tìm thấy bộ PDF K24/K25/K26 tương ứng trong phạm vi nguồn được cấp, nên các khóa đó chỉ được so bằng runtime asset.

### Xung đột/điểm cần giữ nguyên cảnh báo nguồn

| Chương trình | Mức nguồn | Nội dung cần xác minh |
|---|---|---|
| Kỹ thuật địa chất | **FAIL nguồn, runtime PASS** | PDF có `GEO10413`/`GEO20208` ở các phần khác nhau cho vị trí học phần; trang bảng chi tiết hiển thị `GEO20208`. Tên `GEO10113` cũng không nhất quán. |
| Địa chất học | Cảnh báo | `GEO10613/GEO10601`, `GEO10614/GEO10603` khác nhau giữa bảng. |
| Hóa học CNTN | Cảnh báo | Giáo dục thể chất có nơi 8, nơi 4 tín chỉ; `CHE10505/CHE10506` không thống nhất. |
| Toán học/Toán CNTN | Đã chuẩn hóa một phần | `MTH5556` đã gộp về canonical `MTH10556`; `MTH10425` vẫn cố ý không tạo vì thiếu metadata bắt buộc. |
| Khoa học vật liệu | Cảnh báo | PDF thiếu nhánh Vật liệu Từ ở một phần và có xung đột môn/tín chỉ tốt nghiệp. |
| Quản lý tài nguyên và môi trường | Runtime PASS, nguồn còn provenance | Đã tích hợp 92 mã; giữ rõ các mâu thuẫn tín chỉ/tên/BB trong `description`. |

Đợt hoàn thiện kiểm tra 18 ZIP, tích hợp 17 chương trình và bỏ qua một gói Hóa học trùng SHA-256; tổng nguồn gồm 5 PASS, 10 WARNING và 2 FAIL nguồn đã được xử lý có provenance. Contract runtime vẫn PASS vì dữ liệu ưu tiên bảng CTĐT chi tiết thay vì tự đoán từ phần tổng hợp mâu thuẫn.

## 11. Kiểm tra chất lượng asset

### K23

- 4.111 course records; mỗi chương trình có mã duy nhất nội bộ.
- 0 duplicate course ID.
- 0 category reference thiếu theo extractor contract chính thức.
- 29/29 import thành công; 29/29 source direct.
- 29/29 browser selection thành công trên desktop và mobile Chromium.

### Khóa khác — vấn đề nền cần biết khi so sánh

- K24 CNTT/Công nghệ Thông tin: 794 raw records / 184 mã duy nhất, 610 duplicate record; các phép so sánh trong báo cáo dùng 184.
- K24 Sinh học: 225 raw / 212 unique; Công nghệ sinh học: 208 raw / 178 unique.
- Detector regex thô từng báo các token `TC1/TC2/TC3`, `MTH10425`, `GEO20208` là missing reference. Đây là **false positive của regex tổng quát**; K23 contract extractor hiểu schema đã xác nhận 0 missing category reference. Những mã nguồn mâu thuẫn vẫn được giữ riêng ở bảng cảnh báo PDF, không bị che đi.

## 12. Khuyến nghị xác minh chính thức

1. Xin xác nhận chính thức cho các mâu thuẫn còn lưu provenance của Quản lý tài nguyên và môi trường; không cần bổ sung catalog vì runtime K23 đã hoàn thiện.
2. Xin PDF/quyết định K24 cho Toán học, Khoa học vật liệu và Cử nhân tài năng Vật lý học; đây là ba chênh lệch đỏ K23→K24.
3. Xin nguồn prerequisite K23 hoặc văn bản xác nhận không công bố quan hệ; không để “file có mặt” bị hiểu là dữ liệu đầy đủ.
4. Xin PDF K25 cho Hệ thống thông tin và CNTT Cử nhân tài năng trước khi chấp nhận mức giảm 111/66 mã.
5. Sửa catalog K25/K26 hoặc bổ sung asset cho Thống kê, Kinh tế đất đai, Công nghệ giáo dục.
6. Dedupe K24 trước mọi thống kê raw count; thêm test uniqueness/reference/loadability cho tất cả nguồn trực tiếp và fallback.
7. Khi có PDF mới, so cả tổng tín chỉ tốt nghiệp, BB/TC, định hướng, nhóm tự chọn và phương án tốt nghiệp; không chỉ so mã môn.

## 13. Lệnh và khả năng tái lập

Các số liệu runtime lấy bằng `loadCohortData`, `resolveDataCohort` và `ACADEMIC_YEAR_MAJOR_CATALOGS` trong process TSX độc lập; browser xác minh bằng production build có `VITE_ENABLE_WORKSPACE=true`.

Các gate chung đã chạy:

- `npm run typecheck:test`: PASS.
- `npm run test:unit -- --reporter=verbose`: PASS 85/85.
- `npm run build`: PASS có chunk/import warning.
- `npm run test:e2e`: PASS 8/8 tính cả smoke K23 desktop/mobile Chromium.
- Browser K23 9 khoa/29 ngành: PASS 29/29.
- PDF `pdfinfo`: 29/29 đọc được, 874 trang.

## 14. Giới hạn

- Không có PDF K24/K25/K26 nguồn tương ứng trong phạm vi được cung cấp.
- PDF là tài liệu local; báo cáo không xác minh chữ ký/quyết định với website trường.
- Category schema khác nhau giữa khóa; numeric credit chỉ so khi path trùng chính xác.
- Jaccard đo tập mã, không tự chứng minh chương trình tương đương về chuẩn đầu ra hoặc cấu trúc tốt nghiệp.
- Không tự động sửa xung đột PDF, tạo môn thiếu metadata hoặc suy diễn prerequisite.

## 15. Trạng thái Git

Báo cáo đã được cập nhật sau đợt hoàn thiện dữ liệu K23. Registry/data/test thay đổi đúng phạm vi kế hoạch; public API, type và schema không đổi; không commit hoặc push và mọi thay đổi ngoài phạm vi của người dùng được giữ nguyên.
