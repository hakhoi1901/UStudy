# Kiểm tra ảnh hưởng sau chỉnh sửa + Kế hoạch Phase 4 & Phase 5

## 1. Kiểm tra ảnh hưởng tới các chức năng khác

### 1.1 Tổng quan thay đổi
- **Thêm mới**: `src/types/grade.ts` (GPAPullCourse, GPAPullSemester), `src/logic/gpaPullRedistribution.ts`, mở rộng `src/pages/gradeManagement/GPAPullTool.tsx`.
- **Sửa**: `src/pages/gradeManagement/GradeManagement.tsx` — destructure thêm `accumulatedCredits`, `totalCredits` từ `useStudentGradeData` và truyền thêm props xuống `GPAPullTool`.

### 1.2 useStudentGradeData
- **Kiểm tra**: Hook đã trả về `accumulatedCredits` và `totalCredits` trong mọi nhánh (có dữ liệu và không có dữ liệu).
- **Sử dụng khác**: `DashboardWidgets.tsx` đã dùng `accumulatedCredits`, `totalCredits` từ cùng hook → không xung đột.
- **Kết luận**: Không ảnh hưởng.

### 1.3 useGPASimulator & GPASimulation
- **GradeManagement** vẫn truyền cùng `simulatorCourses`, `handleGradeChange` cho cả **GPAPullTool** và **GPASimulation**.
- **GPAPullTool** chỉ đọc `simulatorCourses` và gọi `handleGradeChange(courseCode, grade)` — cùng contract với GPASimulation.
- **Lưu trữ**: Điểm dự kiến vẫn lưu tại `STORAGE_KEYS.PROJECTED_GRADES` (trong useGPASimulator), hai component dùng chung nguồn.
- **Kết luận**: Không ảnh hưởng; Mô phỏng GPA và Công cụ Kéo GPA đồng bộ điểm dự kiến.

### 1.4 Các component khác trên trang Quản lý điểm
- **GPAInformation**, **GPAsem**, **RetakeCourses**, **GradeHistory**: Không đổi props, không import type/hook mới.
- **Kết luận**: Không ảnh hưởng.

### 1.5 Types & logic
- **GPAPullCourse**, **GPAPullSemester**: Chỉ dùng trong `GPAPullTool.tsx` và `gpaPullRedistribution.ts`; không export ra nơi khác ngoài `types/grade.ts` (re-export chuẩn).
- **redistributeSuggestedGrades**: Chỉ được gọi trong GPAPullTool khi build `nextSemester`.
- **GPACalculator**: Không sửa, chỉ dùng `calculateRequiredAverageForTargetGPA` như trước.
- **Kết luận**: Không ảnh hưởng chức năng khác.

### 1.6 Build
- `npm run build` chạy thành công (exit code 0). Cảnh báo hiện có (chunk size, dynamic import) là từ trước, không phát sinh từ thay đổi GPA Pull.

### 1.7 Tóm tắt kiểm tra
| Thành phần            | Ảnh hưởng |
|-----------------------|-----------|
| useStudentGradeData   | Không     |
| useGPASimulator       | Không     |
| GPASimulation         | Không     |
| GPAInformation, GPAsem, RetakeCourses, GradeHistory | Không |
| GPACalculator / AcademicRulesEngine | Không |
| Build                 | Thành công |

---

## 2. Kế hoạch chi tiết Phase 4 — Nhiều học kỳ

### 2.1 Mục tiêu
- Hiển thị **nhiều học kỳ** (Học kỳ tiếp theo + các kỳ sau), mỗi kỳ có danh sách môn và đề xuất điểm.
- Môn “còn lại” sau kỳ tiếp theo lấy từ **chương trình đào tạo** (CTĐT): môn bắt buộc BB + nhóm tự chọn bắt buộc, trừ môn đã qua và môn đã nằm trong simulator.
- Mỗi kỳ áp dụng cùng `requiredGPA = requiredAverage`, redistribution độc lập theo kỳ.

### 2.2 Nguồn dữ liệu “môn còn lại”
- **allCoursesMeta** (DepartmentContext): danh sách môn CTĐT, có `course_id`, `credits`, `course_type` (vd 'BB').
- **categories** (DepartmentContext): cấu trúc nhóm tự chọn, dùng để tính “elective required” (số tín chỉ tối thiểu từng nhóm).
- **CourseRecommender** (đã có): nhận studentData, openCourses, prereqs, allCoursesMeta, categories; có `getStudentStatus()` (passed, failed, studying) và `recommend()` trả về danh sách môn nên học.
- **Lưu ý**: Recommender trả về môn “nên học tiếp” (ưu tiên retake, mandatory, elective_required). Ta cần **tập môn chưa qua** (không nằm trong passed), trừ môn đã có trong simulator → phần còn lại chia vào các kỳ.

### 2.3 Bước thực hiện Phase 4

#### Bước 4.1 — Module lấy danh sách môn còn lại (chưa học)
1. **Tạo** `src/logic/gpaPullRemainingCourses.ts` (hoặc hàm trong file hiện có).
2. **Input**: `gradesHistory`, `simulatorCourseCodes: Set<string>`, `allCoursesMeta`, `categories` (tùy chọn), `prerequisites` (tùy chọn).
3. **Logic**:
   - Từ `gradesHistory` lấy tập `passedCodes` (môn đã qua: status passed, có grade).
   - Từ CTĐT: lấy tất cả môn BB + môn thuộc nhóm tự chọn bắt buộc (có thể dùng logic tương tự Recommender: duyệt allCoursesMeta + categories, tính môn còn thiếu).
   - **Remaining** = môn trong CTĐT cần học mà không thuộc `passedCodes` và không thuộc `simulatorCourseCodes`.
   - Trả về mảng `{ code, name, credits }[]` (name/credits từ allCoursesMeta).
4. **Sắp xếp**: Ưu tiên theo tiên quyết (prerequisites): môn không phụ thuộc ai học trước; hoặc đơn giản hóa: sort theo `course_id` / năm học nếu metadata có. Nếu không có thông tin kỳ cụ thể → **chia đều** thành N nhóm (vd 2 hoặc 3 kỳ) theo số tín chỉ gần bằng nhau.

#### Bước 4.2 — Chia môn còn lại thành các kỳ
1. **Chiến lược đơn giản (MVP)**:
   - Số kỳ = 2 hoặc 3 (config hoặc hằng số), hoặc tính từ `remainingCredits / 20` (ước lượng ~20 TC/kỳ) làm số kỳ.
   - Chia danh sách remaining (đã sort) lần lượt vào từng kỳ sao cho tổng tín chỉ mỗi kỳ gần bằng (hoặc chia đều số môn).
2. **Output**: Mảng `GPAPullSemester[]` (không bao gồm kỳ “Học kỳ tiếp theo” — kỳ đó đã có từ simulator). Mỗi phần tử: `id`, `label` (vd "Kỳ sau 1", "Kỳ sau 2"), `courses` (GPAPullCourse[] với lockedGrade null, projectedGrade null, suggestedGrade = requiredAverage, isLocked false, source 'future'), `requiredGPA`, `totalCredits`, `pointsNeeded`.

#### Bước 4.3 — State điểm dự kiến cho các kỳ tương lai
1. **Vấn đề**: Hiện chỉ kỳ tiếp theo (simulator) dùng `handleGradeChange` → lưu vào `PROJECTED_GRADES`. Các kỳ sau chưa có persistence.
2. **Giải pháp**:
   - **Cách A**: Mở rộng `PROJECTED_GRADES` — key có thể là `courseCode` (không phân biệt kỳ). Khi user nhập điểm cho môn ở “Kỳ sau 1”, lưu cùng key `courseCode` → đồng nhất với simulator (một môn chỉ xuất hiện một lần trong một kỳ). Hợp lý vì mỗi môn chỉ thuộc một kỳ.
   - **Cách B**: Storage riêng cho GPA Pull, vd `GPA_PULL_PROJECTED_GRADES`: `Record<courseCode, number>`. Khi render kỳ tương lai, đọc từ đây; khi user sửa, ghi vào đây và có thể đồng bộ ngược lại PROJECTED_GRADES nếu môn đó cũng nằm trong simulator (trường hợp hiếm vì simulator = kỳ tiếp theo, kỳ sau = môn chưa đăng ký).
3. **Đề xuất**: Dùng chung `PROJECTED_GRADES` (Cách A). Môn ở kỳ sau chỉ xuất hiện trong bảng GPA Pull; khi user nhập, gọi một callback `onProjectedGradeChange(courseCode, grade)` do parent (GradeManagement) cung cấp — parent có thể lưu vào state riêng cho “GPA Pull only” hoặc vào một storage key mới `GPA_PULL_FUTURE_GRADES`. Đơn giản hơn: **state local trong GPAPullTool** cho `futureSemestersProjected: Record<string, number>`, không persist (hoặc persist vào một key mới) để không trùng với simulator.

#### Bước 4.4 — UI nhiều kỳ trong GPAPullTool
1. **Cấu trúc**: `semesters = [nextSemester, ...futureSemesters]`. `nextSemester` như hiện tại (từ simulator + redistribution). `futureSemesters` từ bước 4.2, mỗi kỳ có `courses` với `projectedGrade` lấy từ state local (hoặc storage riêng).
2. **Render**: Accordion hoặc danh sách section. Mỗi section: tiêu đề kỳ (label), GPA cần đạt, tổng TC, bảng môn (cùng format bảng hiện tại). Ô “Điểm dự kiến” cho môn ở kỳ tương lai: onChange cập nhật state (futureSemestersProjected hoặc storage) → chạy redistribution cho đúng kỳ đó.
3. **Redistribution**: Mỗi kỳ gọi `redistributeSuggestedGrades(semester.courses, requiredAverage)` sau khi có danh sách courses (và sau khi cập nhật projectedGrade từ state). Đảm bảo kỳ tiếp theo vẫn dùng `simulatorCourses` + `handleGradeChange`; kỳ sau dùng state riêng + handler riêng.

#### Bước 4.5 — Tích hợp CourseRecommender / CTĐT
1. Trong **GradeManagement** hoặc **GPAPullTool**: lấy `data.courses`, `data.categories`, `data.prerequisites` từ `useDepartmentData()`; lấy `gradesHistory` và `simulatorCourses` (để có `simulatorCourseCodes`).
2. Gọi module “remaining courses” với passed = từ gradesHistory (passed), simulatorCourseCodes = Set(simulatorCourses.map(c => c.code)), allCoursesMeta, categories. Nhận danh sách môn còn lại.
3. Chia thành N kỳ → tạo `futureSemesters`. Merge với `nextSemester` → `semesters` đầy đủ truyền xuống UI.

#### Bước 4.6 — Cập nhật types / dependency
1. **GPAPullSemester** đã có; **GPAPullCourse** với `source: 'future'` đã có.
2. Nếu dùng CourseRecommender: cần studentDb (raw grades) và courseDb (open courses). Recommender.recommend() trả về môn nên học — có thể lấy tập “có thể học” rồi trừ passed và simulator. Hoặc tự implement “remaining” đơn giản: allCoursesMeta (BB) + flatten categories (elective required) → trừ passed → trừ simulator → sort.

### 2.4 Thứ tự triển khai Phase 4 (step-by-step)
| Bước | Nội dung | Phụ thuộc |
|------|----------|-----------|
| 4.1 | Tạo `getRemainingCoursesForGpaPull(gradesHistory, simulatorCodes, allCoursesMeta, categories?)` trả về `{ code, name, credits }[]` | - |
| 4.2 | Hàm `splitRemainingIntoSemesters(remaining, numSemesters, requiredAverage)` → `GPAPullSemester[]` | 4.1 |
| 4.3 | State trong GPAPullTool: `futureProjectedGrades: Record<string, number>` + handler `handleFutureGradeChange(courseCode, grade)`; hoặc storage key mới | - |
| 4.4 | GradeManagement truyền thêm `allCoursesMeta`, `categories` (và nếu cần `prerequisites`) xuống GPAPullTool | - |
| 4.5 | Trong GPAPullTool: khi có baseResult.success và requiredAverage, gọi 4.1 → 4.2 → có `futureSemesters`; merge với `nextSemester` thành `semesters` | 4.1, 4.2, 4.4 |
| 4.6 | UI: render danh sách `semesters` (accordion/sections); kỳ đầu dùng handleGradeChange, kỳ sau dùng handleFutureGradeChange; mỗi kỳ áp dụng redistributeSuggestedGrades | 4.3, 4.5 |

### 2.5 Rủi ro & giảm thiểu
- **CTĐT không có năm/kỳ**: Chỉ chia đều theo số kỳ cố định hoặc theo tín chỉ → có thể không khớp thực tế học từng kỳ. Chấp nhận MVP.
- **Trùng môn**: Đảm bảo remaining đã trừ simulator → mỗi courseCode chỉ xuất hiện một kỳ.
- **Performance**: Danh sách remaining có thể vài chục môn; split và redistribution theo kỳ dùng useMemo phụ thuộc gradesHistory, simulatorCourses, targetGPA, futureProjectedGrades.

---

## 3. Kế hoạch chi tiết Phase 5 — Polish & edge cases

### 3.1 Mục tiêu
- **Phạm vi điểm đề xuất và dự kiến chỉnh sửa: 5–10** — Điểm dưới 5.0 theo quy chế là không qua môn (phải học lại), nên trong Công cụ Kéo GPA chỉ cho phép đề xuất và nhập dự kiến trong khoảng 5–10 (đã áp dụng trong code: redistribution clamp [5, 10], input min=5 max=10).
- Cảnh báo khi không thể đạt GPA kỳ với điểm đã nhập/khóa (kể cả khi cần phân bổ &lt; 5 điểm/TC — không khả thi vì tối thiểu 5).
- Xử lý trường hợp đặc biệt (không có môn trong kỳ, tín chỉ 0/null).
- Nhất quán làm tròn, tối ưu hiệu năng, cải thiện accessibility.

### 3.2 Bước thực hiện Phase 5

#### Bước 5.1 — Cảnh báo “Không thể đạt GPA kỳ”
1. **Vị trí**: Trong `gpaPullRedistribution.ts` hoặc khi build semester trong GPAPullTool.
2. **Điều kiện** (phạm vi hợp lệ mỗi môn là **5–10**, vì dưới 5 phải học lại): Sau khi tính `remainingPoints` và `editableCredits`:
   - Nếu `remainingPoints < 0`: tổng điểm đã nhập/khóa vượt quá điểm cần → không thể đạt requiredAverage.
   - Nếu `remainingPoints > 10 * editableCredits`: điểm cần phân bổ lớn hơn tối đa (10/TC) → không thể đạt.
   - Nếu `remainingPoints < 5 * editableCredits`: điểm cần phân bổ ít hơn tối thiểu (5/TC) → không thể đạt requiredAverage mà vẫn qua môn tất cả; cần cảnh báo riêng.
3. **Hành động**:
   - Trả về thêm thông tin: vd `{ courses, semesterWarning: string | null }`. Hoặc trong component, tính lại `remainingPoints` và `editableCredits` từ courses và requiredAverage rồi hiển thị cảnh báo.
   - **UI**: Dưới bảng môn của kỳ đó, nếu `semesterWarning` không null → hiển thị block cảnh báo (màu amber): “Với điểm đã nhập, không thể đạt GPA kỳ X.XX. Bạn cần giảm điểm một số môn đã nhập hoặc tăng điểm môn khác.”
4. **Chi tiết**: Có thể thêm gợi ý ngắn: “Tổng điểm đã nhập: Y; cần tối đa: Z” (Z = requiredAverage * totalCredits).

#### Bước 5.2 — Không có môn trong kỳ
1. **Hiện trạng**: Đã có text “Chưa có môn nào trong học kỳ tiếp theo” khi simulatorCourses.length === 0.
2. **Bổ sung**: Với từng kỳ trong `semesters`, nếu `semester.courses.length === 0` thì không render bảng, chỉ hiển thị một dòng: “Chưa có môn trong kỳ này.”

#### Bước 5.3 — Tín chỉ môn = 0 hoặc null
1. **Hiện trạng**: Khi build nextSemester đã filter `credits != null && credits > 0`. Môn không có tín chỉ không vào danh sách kỳ.
2. **Bổ sung**: Trong `getRemainingCoursesForGpaPull` (Phase 4): bỏ qua môn có credits 0 hoặc null; không đưa vào tổng tín chỉ kỳ. Nếu cần, log cảnh báo nhẹ khi gặp môn không có tín chỉ trong CTĐT.

#### Bước 5.4 — Làm tròn nhất quán
1. **Hiện trạng**: `gpaPullRedistribution.ts` đã dùng `ACADEMIC_RULES.GPA_POINT_DECIMAL` để làm tròn suggestedGrade.
2. **Kiểm tra**: Tất cả chỗ hiển thị điểm (GPA tổng, GPA kỳ, đề xuất, dự kiến) dùng `.toFixed(decimals)` với `decimals = ACADEMIC_RULES.GPA_POINT_DECIMAL`.

#### Bước 5.5 — Performance
1. **useMemo**: `nextSemester` và (sau Phase 4) `futureSemesters` / `semesters` phụ thuộc đúng vào gradesHistory, simulatorCourses, baseResult, (futureProjectedGrades). Tránh phụ thuộc thừa.
2. **Redistribution**: Chỉ chạy khi build semesters (đã nằm trong useMemo). Không gọi trong render không cần thiết.

#### Bước 5.6 — Accessibility
1. **Label**: Các input “Điểm dự kiến” đã có context (cột bảng); nên thêm `aria-label` hoặc `id` + label ẩn cho từng ô (vd “Điểm dự kiến môn {code}”).
2. **Cảnh báo**: Block cảnh báo (5.1) thêm `role="alert"` hoặc `aria-live="polite"` để screen reader đọc khi xuất hiện.
3. **Màu sắc**: Không chỉ dựa vào màu để truyền tải “lỗi” — kèm text rõ ràng.

### 3.3 Thứ tự triển khai Phase 5 (step-by-step)
| Bước | Nội dung | Ghi chú |
|------|----------|--------|
| 5.1 | Tính và hiển thị cảnh báo “Không thể đạt GPA kỳ” khi remainingPoints &lt; 0, &gt; 10*editableCredits, hoặc &lt; 5*editableCredits (phạm vi 5–10) | Tách hàm `getSemesterWarning(courses, requiredAverage)`; dùng PASS_GRADE_DECIMAL |
| 5.2 | Ẩn bảng, hiển thị “Chưa có môn trong kỳ này” khi semester.courses.length === 0 | Áp dụng cho mọi kỳ |
| 5.3 | Đảm bảo remaining courses (Phase 4) bỏ qua credits 0/null | Trong getRemainingCoursesForGpaPull |
| 5.4 | Rà soát toàn bộ chỗ hiển thị điểm dùng GPA_POINT_DECIMAL | - |
| 5.5 | Rà soát useMemo/useCallback, tránh dependency thừa | - |
| 5.6 | aria-label / role="alert" cho input và cảnh báo | - |

---

## 4. Thứ tự thực hiện tổng thể (Phase 4 rồi Phase 5)

1. **Phase 4.1–4.2**: Module lấy remaining courses + chia kỳ.
2. **Phase 4.3–4.4**: State/handler cho điểm kỳ tương lai; GradeManagement truyền allCoursesMeta, categories.
3. **Phase 4.5–4.6**: Tích hợp vào GPAPullTool, UI nhiều kỳ (accordion/sections), redistribution từng kỳ.
4. **Phase 5.1**: Cảnh báo không đạt GPA kỳ.
5. **Phase 5.2–5.6**: Các polish còn lại (empty kỳ, tín chỉ null, làm tròn, performance, a11y).

Sau khi hoàn thành Phase 4 và 5, cập nhật lại **Tiêu chí chấp nhận** trong `PLAN_GPA_PULL_TOOL_DETAILED.md` và đánh dấu hoàn thành.
