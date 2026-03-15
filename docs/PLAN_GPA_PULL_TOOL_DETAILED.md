# Kế hoạch chi tiết: Công cụ "Kéo" GPA (GPA Pull Tool) — Phiên bản chuyên nghiệp

## 1. Tổng quan & mục tiêu

### 1.1 Mô tả chức năng
Công cụ ngược với **GPA dự kiến**: sinh viên nhập **GPA mong muốn lúc tốt nghiệp** (vd: 8.0 để đạt loại Giỏi). Hệ thống tính toán và đề xuất:
- **GPA tổng**: hiện tại, mục tiêu, và điểm trung bình tối thiểu cần đạt trên toàn bộ tín chỉ còn lại.
- **GPA theo kỳ**: với số tín chỉ còn lại, mỗi học kỳ cần đạt GPA tối thiểu bao nhiêu.
- **Từng môn trong từng kỳ**: đề xuất điểm từng môn để đạt GPA kỳ đó; môn đã có điểm thì khóa và đề xuất các môn còn lại.
- **Điều chỉnh động**: khi sinh viên sửa điểm dự kiến một môn (vd A=10, B=8.5), hệ thống tự điều chỉnh đề xuất các môn còn lại (C, D...) để GPA tổng/kỳ vẫn đạt mục tiêu.

### 1.2 Nguyên tắc triển khai
- Tuân thủ quy chuẩn code hiện tại: `GPACalculator`, `AcademicRulesEngine`, `useGPASimulator`, `useStudentGradeData`.
- Không phá vỡ chức năng hiện có (Mô phỏng GPA, Lịch sử điểm, v.v.).
- Logic tính GPA thống nhất với `calculateProjectedGPA` và `calculateRequiredAverageForTargetGPA`.

### 1.3 Yêu cầu phạm vi điểm đề xuất / dự kiến
- **Điểm &lt; 5.0** theo quy chế là không qua môn (phải học lại). Trong Công cụ Kéo GPA, **điểm đề xuất** và **điểm dự kiến** (ô chỉnh sửa) chỉ nằm trong khoảng **5–10**.
- Ô nhập "Điểm dự kiến" có `min=5`, `max=10`; giá trị nhập ngoài khoảng này được clamp về [5, 10].
- Hàm redistribution clamp `suggestedGrade` trong [5, 10] (dùng `ACADEMIC_RULES.PASS_GRADE_DECIMAL`).

---

## 2. Công thức & mô hình dữ liệu

### 2.1 Công thức cốt lõi (đã có)
- **Tích lũy hiện tại** (từ `gradesHistory`):  
  `currentPoints`, `currentCredits` — chỉ môn `passed`/`retake`, loại trừ môn không tính GPA, dùng `AcademicRulesEngine.calculateAccumulationParams`.
- **Tín chỉ còn lại**:  
  `remainingCredits = TOTAL_CREDITS - currentCredits`
- **Điểm cần có trong tương lai**:  
  `futurePointsNeeded = targetGPA * TOTAL_CREDITS - currentPoints`
- **Điểm TB tối thiểu trên tín chỉ còn lại**:  
  `requiredAverage = futurePointsNeeded / remainingCredits` (nếu `remainingCredits > 0`).

### 2.2 Phân bổ theo học kỳ
- **GPA theo kỳ**: Giữ đơn giản — mỗi học kỳ cần đạt **cùng một mức GPA** = `requiredAverage` (điểm trung bình trên tín chỉ còn lại).  
  Công thức: với mỗi kỳ có `credits_k` tín chỉ, cần tổng điểm kỳ = `requiredAverage * credits_k`.
- **Điểm từng môn trong kỳ**:  
  - Tổng điểm cần của kỳ: `pointsNeeded_k = requiredAverage * sum(credits of courses in semester k)`.  
  - Môn đã khóa (có điểm): dùng điểm đó, không chỉnh sửa.  
  - Môn chưa khóa: đề xuất ban đầu = `requiredAverage`; khi user sửa một môn, phân bổ lại điểm còn lại cho các môn có thể chỉnh.

### 2.3 Phân bổ lại khi user chỉnh điểm (trong một kỳ)
- Gọi:
  - `fixedPoints` = tổng (điểm × tín chỉ) của các môn đã khóa + môn user đã sửa (coi như khóa).
  - `fixedCredits` = tổng tín chỉ của các môn đó.
  - `editableCredits` = tổng tín chỉ các môn còn lại (chưa khóa, chưa bị user sửa trong bước này).
  - `pointsNeededForSemester` = `requiredAverage * totalCreditsInSemester`.
- Điểm còn lại cần phân bổ:  
  `remainingPoints = pointsNeededForSemester - fixedPoints`.
- Đề xuất cho mỗi môn có thể chỉnh:  
  `suggestedGrade = remainingPoints / editableCredits` (chia đều theo tín chỉ).  
  Nếu `editableCredits === 0` thì không còn môn để đề xuất. **Clamp `suggestedGrade` trong [5, 10]** (điểm dưới 5 phải học lại).

### 2.4 Mô hình dữ liệu đề xuất (TypeScript)

```ts
// Môn trong kỳ (dùng trong GPA Pull)
interface GPAPullCourse {
  code: string;
  name: string;
  credits: number;
  /** Điểm thật đã có (từ grades/portal) → khóa, read-only */
  lockedGrade: number | null;
  /** Điểm user nhập (dự kiến) — nếu đã nhập có thể coi là "đã khóa" cho đề xuất */
  projectedGrade: number | null;
  /** Điểm đề xuất bởi hệ thống (tính từ requiredAverage và redistribution) */
  suggestedGrade: number | null;
  /** Đã khóa (có lockedGrade) → không cho sửa */
  isLocked: boolean;
  /** Nguồn: ongoing | registration | future */
  source: 'ongoing' | 'registration' | 'future';
}

// Một học kỳ trong công cụ Kéo GPA
interface GPAPullSemester {
  id: string;
  label: string;           // "Học kỳ tiếp theo", "HK 2025-2026", ...
  courses: GPAPullCourse[];
  requiredGPA: number;      // = requiredAverage (chung toàn bộ tín chỉ còn lại)
  totalCredits: number;
  /** Tổng điểm cần đạt kỳ này = requiredGPA * totalCredits */
  pointsNeeded: number;
}

// State chính của công cụ
interface GPAPullState {
  targetGPA: number;
  currentGPA: number;
  currentCredits: number;
  remainingCredits: number;
  requiredAverage: number;   // điểm TB tối thiểu trên tín chỉ còn lại
  semesters: GPAPullSemester[];
  /** Kết quả từ GPACalculator.calculateRequiredAverageForTargetGPA */
  baseResult: { success: boolean; impossible?: boolean; alreadyAchieved?: boolean; message: string };
}
```

---

## 3. Nguồn dữ liệu

### 3.1 Đã có trong app
- **gradesHistory**, **currentGPA**, **accumulatedCredits**, **totalCredits**, **gpaPerSemester** — từ `useStudentGradeData()`.
- **Simulator courses (học kỳ tiếp theo)** — từ `useGPASimulator(gradesHistory, data.courses)`: môn `ongoing` + môn đăng ký học phần (ĐKHP, `courseType === 'LT'`). Mỗi môn có `credits`, `projectedGrade`, `currentGrade` (hiện tại đều null từ DB).
- **allCoursesMeta** (CTĐT) — từ `useDepartmentData().data.courses`: tra cứu tên, tín chỉ theo `course_id`.

### 3.2 “Môn đã có điểm” (khóa)
- **Từ gradesHistory**: môn có `status === 'passed'` hoặc `'retake'` đã nằm trong tích lũy, **không** xuất hiện trong “tín chỉ còn lại” nữa. Chỉ có môn **chưa qua** (ongoing hoặc chưa học) mới nằm trong danh sách kỳ tương lai.
- **Trong học kỳ tiếp theo (simulator)**:  
  - Nếu sau này portal/import có cập nhật điểm cho môn đang học → khi đó `gradesHistory` có điểm, môn đó sẽ không còn `ongoing` nữa.  
  - Trong phiên bản hiện tại, môn trong simulator **chưa có điểm thật**; có thể coi “có điểm” = user đã nhập **projected grade** và ta cho phép **khóa** (lock) để đề xuất các môn còn lại. Hoặc khi tích hợp dữ liệu điểm giữa kỳ, nếu có `currentGrade` thì dùng làm `lockedGrade`.
- **Quy ước**: Môn có `lockedGrade !== null` (từ DB hoặc từ điểm đã nhập và user bấm “Khóa”) → `isLocked = true`, read-only, dùng trong công thức phân bổ.

### 3.3 Danh sách môn còn lại theo kỳ
- **Giai đoạn 1 (MVP)**:
  - **Chỉ một “học kỳ”** = học kỳ tiếp theo = danh sách từ **simulator** (ongoing + ĐKHP). Đủ để hiển thị GPA tổng, GPA kỳ (bằng `requiredAverage`), và từng môn với đề xuất điểm + khóa + phân bổ lại khi user sửa.
- **Giai đoạn 2 (mở rộng)**:
  - Lấy “môn còn lại” từ chương trình đào tạo: `allCoursesMeta` (và categories) — môn bắt buộc BB + nhóm tự chọn bắt buộc — trừ đi các môn đã có trong `gradesHistory` (passed/retake). Nhóm các môn còn lại vào các “kỳ” (vd theo năm/học kỳ trong CTĐT, hoặc mặc định chia đều 2–3 kỳ). Mỗi kỳ áp dụng cùng công thức: `requiredGPA = requiredAverage`, `pointsNeeded = requiredAverage * totalCredits`, rồi đề xuất/redistribute từng môn như trên.

---

## 4. Kế hoạch triển khai từng bước (Step-by-step)

### Phase 0: Chuẩn bị (đã xong)
- [x] Branch `feature/gpa-pull-tool`.
- [x] Hàm `GPACalculator.calculateRequiredAverageForTargetGPA`.
- [x] Component `GPAPullTool` cơ bản: nhập target GPA, hiển thị remaining credits + required average.

---

### Phase 1: GPA tổng + GPA theo kỳ + một kỳ duy nhất (Học kỳ tiếp theo)

**Mục tiêu**: Hiển thị đầy đủ GPA tổng, GPA theo kỳ, và bảng môn học kỳ tiếp theo với đề xuất điểm; ban đầu chia đều `requiredAverage` cho mọi môn.

#### Bước 1.1 — Mở rộng state & types
1. Thêm type `GPAPullCourse`, `GPAPullSemester`, `GPAPullState` (hoặc tương đương) trong `src/types/` (vd `grade.ts` hoặc file mới `gpaPull.ts`).
2. Trong component/hook GPA Pull: giữ `targetGPA`, `baseResult` từ `calculateRequiredAverageForTargetGPA`; thêm `semesters: GPAPullSemester[]` với **một phần tử** là “Học kỳ tiếp theo”, danh sách môn lấy từ **simulator courses** (từ `useGPASimulator`).

#### Bước 1.2 — Truyền simulator courses vào GPAPullTool
1. Trong `GradeManagement.tsx`, truyền thêm xuống `GPAPullTool`: `simulatorCourses`, `handleGradeChange` (hoặc callback chỉ dùng trong GPA Pull, xem bước sau).
2. Map `simulatorCourses` → `GPAPullCourse[]`:  
   - `lockedGrade`: null (giai đoạn 1 không có điểm thật từ DB cho môn trong simulator).  
   - `projectedGrade`: từ simulator.  
   - `suggestedGrade`: khởi tạo = `requiredAverage` (từ baseResult).  
   - `isLocked`: false (giai đoạn 1 chưa khóa môn theo điểm thật).  
   - `credits`: từ simulator (hoặc từ allCoursesMeta nếu null).

#### Bước 1.3 — UI: GPA tổng & GPA theo kỳ
1. **GPA tổng**:  
   - Hiển thị: GPA hiện tại, GPA mục tiêu, tín chỉ đã tích lũy / tổng, tín chỉ còn lại.  
   - Dùng `currentGPA`, `currentCredits`, `totalCredits`, `remainingCredits`, `targetGPA` từ `baseResult` và `useStudentGradeData`.
2. **GPA theo kỳ**:  
   - Chỉ có một kỳ (Học kỳ tiếp theo): hiển thị “GPA tối thiểu cần đạt trong kỳ này: X.XX” với `X.XX = requiredAverage`.  
   - Ghi chú ngắn: “Các kỳ sau cũng cần duy trì trung bình tối thiểu X.XX điểm.”

#### Bước 1.4 — Bảng môn trong kỳ + đề xuất điểm ban đầu
1. Bảng (hoặc list) môn học kỳ tiếp theo: Mã, Tên, Tín chỉ, Điểm đề xuất (suggested), Điểm dự kiến (projected — ô nhập), Xếp loại (từ `getClassification`).
2. Ban đầu: tất cả `suggestedGrade = requiredAverage`; cột “Điểm dự kiến” có thể để trống hoặc mặc định = suggested.
3. Dùng `ACADEMIC_RULES.GPA_POINT_DECIMAL` để format số.

#### Bước 1.5 — Đồng bộ với Simulator (tùy chọn)
- Nếu muốn “điểm dự kiến” trong GPA Pull đồng bộ với Mô phỏng GPA: dùng chung `projectedGrades` (từ `useGPASimulator`) và `handleGradeChange`. Khi user nhập trong GPA Pull, cập nhật cùng state/storage đó.
- Hoặc tách riêng state “projected trong GPA Pull” để không ảnh hưởng Mô phỏng GPA; sau có thể merge hai luồng.

**Kết quả Phase 1**: Có GPA tổng, GPA theo kỳ, một bảng môn với đề xuất điểm đều = requiredAverage.

---

### Phase 2: Khóa môn đã có điểm + đề xuất môn còn lại

**Mục tiêu**: Môn có điểm rồi (từ DB hoặc user khóa) → read-only; đề xuất chỉ cho các môn chưa khóa.

#### Bước 2.1 — Xác định môn “có điểm”
1. **Từ dữ liệu**: Nếu simulator/backend sau này cung cấp `currentGrade` (điểm thật đã có) cho một môn → set `lockedGrade = currentGrade`, `isLocked = true`.
2. **Từ user**: Khi user đã nhập “điểm dự kiến” cho một môn và ta quy ước “đã nhập = khóa cho đề xuất”: set `isLocked = true` cho môn đó, `lockedGrade = projectedGrade` (dùng trong công thức), không cho sửa ô đó nữa (hoặc có nút “Mở khóa” để sửa lại).
3. Trong UI: ô điểm môn khóa → disabled hoặc read-only, có badge “Đã có điểm” / “Đã khóa”.

#### Bước 2.2 — Công thức đề xuất khi có môn khóa
1. Trong kỳ:  
   - `fixedPoints = sum(lockedGrade * credits)` cho môn `isLocked`.  
   - `fixedCredits = sum(credits)` của môn khóa.  
   - `editableCredits = totalCreditsInSemester - fixedCredits`.  
   - `pointsNeededForSemester = requiredAverage * totalCreditsInSemester`.  
   - `remainingPoints = pointsNeededForSemester - fixedPoints`.  
2. Với mỗi môn **không** khóa:  
   - `suggestedGrade = remainingPoints / editableCredits` (nếu `editableCredits > 0`), **clamp [5, 10]** (điểm &lt; 5 phải học lại).  
3. Tạo helper trong `GPACalculator` hoặc module riêng: `redistributeSuggestedGrades(semester: GPAPullSemester, requiredAverage: number): void` (cập nhật `suggestedGrade` cho từng môn).

#### Bước 2.3 — Gọi redistribution khi load và khi có khóa
1. Sau khi build danh sách môn kỳ (từ simulator + locked state), gọi `redistributeSuggestedGrades` để set `suggestedGrade` cho môn chưa khóa.
2. Đảm bảo khi `editableCredits === 0` hoặc `remainingPoints < 0` / > 10*editableCredits xử lý không lỗi (ẩn đề xuất hoặc báo “Không thể đạt mục tiêu với điểm đã khóa”).

**Kết quả Phase 2**: Môn có điểm → khóa; các môn còn lại được đề xuất đúng để đạt GPA kỳ = requiredAverage.

---

### Phase 3: User sửa điểm → tự động phân bổ lại (redistribution)

**Mục tiêu**: Khi user nhập/sửa điểm một môn (vd A=10, B=8.5), hệ thống coi môn đó là “đã cố định” và điều chỉnh đề xuất các môn còn lại (C, D) để GPA kỳ vẫn đạt `requiredAverage`.

#### Bước 3.1 — Coi “đã nhập” là cố định cho redistribution
1. Với mỗi môn trong kỳ:  
   - Nếu `isLocked` (có điểm thật) → dùng `lockedGrade` cho tổng điểm.  
   - Nếu user đã nhập `projectedGrade` (không null) → coi như “fixed” trong bước phân bổ: dùng `projectedGrade` thay vì `suggestedGrade` khi tính `fixedPoints` và `fixedCredits`.  
2. Chỉ những môn chưa có `projectedGrade` (hoặc chưa khóa) mới nhận `suggestedGrade` từ công thức `remainingPoints / editableCredits`.

#### Bước 3.2 — Thuật toán redistribution (chi tiết)
1. Input: danh sách môn kỳ, `requiredAverage`, `totalCreditsInSemester`, `pointsNeededForSemester = requiredAverage * totalCreditsInSemester`.
2. **Fixed**: môn có `isLocked` dùng `lockedGrade`; môn có `projectedGrade !== null` (user đã nhập) dùng `projectedGrade`.  
   - `fixedPoints = sum(grade * credits)` cho các môn fixed.  
   - `fixedCredits = sum(credits)` cho các môn fixed.  
3. **Editable**: các môn còn lại (chưa nhập hoặc cho phép đề xuất).  
   - `editableCredits = totalCreditsInSemester - fixedCredits`.  
   - `remainingPoints = pointsNeededForSemester - fixedPoints`.  
4. Gán `suggestedGrade = remainingPoints / editableCredits` cho mỗi môn editable, clamp trong [0, 10].  
5. Nếu `editableCredits === 0`: không còn môn để chỉnh; kiểm tra nếu `fixedPoints !== pointsNeededForSemester` có thể hiển thị cảnh báo “GPA kỳ sẽ lệch mục tiêu”.

#### Bước 3.3 — Cập nhật UI khi user nhập
1. Khi user thay đổi “Điểm dự kiến” của một môn (onChange):  
   - Cập nhật state `projectedGrade` cho môn đó.  
   - Gọi lại redistribution cho kỳ đó → cập nhật `suggestedGrade` cho các môn còn lại (chưa nhập).  
2. Ô “Điểm đề xuất” (suggested) có thể read-only; ô “Điểm dự kiến” (projected) cho phép nhập. Khi chưa nhập, có thể hiển thị suggested làm placeholder hoặc giá trị mặc định.

#### Bước 3.4 — Giữ GPA tổng đúng mục tiêu
1. GPA tổng = `calculateProjectedGPA(gradesHistory, projectedCourses)` với `projectedCourses` = toàn bộ môn “đã có điểm” (passed/retake) + **điểm dự kiến/đề xuất** của các môn trong simulator (và sau này các kỳ khác).  
2. Vì hiện chỉ có **một kỳ** (simulator), khi user sửa điểm trong kỳ đó, `projectedCourses` thay đổi → cumulative GPA thay đổi. Mục tiêu là cumulative = targetGPA.  
3. Cách đơn giản: **requiredAverage** được tính từ “toàn bộ tín chỉ còn lại”. Học kỳ tiếp theo chỉ là một phần; ta yêu cầu **GPA của học kỳ tiếp theo = requiredAverage**. Khi user sửa một môn trong kỳ đó, ta chỉ cần redistribution trong kỳ đó để **GPA kỳ** = requiredAverage → tổng điểm kỳ đúng → khi cộng với currentPoints sẽ đạt targetGPA (vì requiredAverage được tính từ tổng remaining credits).  
4. Lưu ý: nếu có nhiều kỳ, mỗi kỳ cần đạt `requiredAverage` thì tổng vẫn đạt target; với một kỳ thì đảm bảo kỳ đó đạt requiredAverage là đủ cho “phần tín chỉ của kỳ đó”.

**Kết quả Phase 3**: User sửa A=10, B=8.5 → C và D được đề xuất lại sao cho GPA kỳ = requiredAverage; GPA tổng vẫn đúng mục tiêu (trong giới hạn một kỳ).

---

### Phase 4: Nhiều học kỳ (mở rộng)

**Mục tiêu**: Hiển thị nhiều kỳ (vd “Kỳ 1”, “Kỳ 2”, …), mỗi kỳ có danh sách môn và đề xuất điểm; logic redistribution giống từng kỳ.

#### Bước 4.1 — Danh sách môn còn lại (sau kỳ tiếp theo)
1. Dùng `CourseRecommender` + `allCoursesMeta` + `categories`: lấy danh sách môn có thể học (BB + elective required), trừ đi `gradesHistory` (passed/retake) và trừ đi môn đã nằm trong simulator (kỳ tiếp theo).  
2. Danh sách còn lại → sắp xếp theo tiên quyết / năm học (nếu có trong CTĐT) hoặc chia đều vào N kỳ (vd 2–3 kỳ).  
3. Mỗi nhóm → một `GPAPullSemester` với `requiredGPA = requiredAverage`, `pointsNeeded = requiredAverage * totalCredits`.

#### Bước 4.2 — UI nhiều kỳ
1. Accordion hoặc tab: từng kỳ một, bên trong là bảng môn tương tự Phase 1–3.  
2. Mỗi kỳ hiển thị: GPA cần đạt, tổng tín chỉ, bảng môn với đề xuất/điểm dự kiến và redistribution khi user sửa trong kỳ đó.

#### Bước 4.3 — Redistribution độc lập từng kỳ
- User chỉ sửa trong một kỳ; redistribution chỉ ảnh hưởng kỳ đó. Các kỳ khác giữ nguyên đề xuất = requiredAverage (hoặc đã được user sửa trước đó).

**Kết quả Phase 4**: Nhiều kỳ, mỗi kỳ có bảng môn + đề xuất + khóa + redistribution.

---

### Phase 5: Polish & edge cases

1. **Không đạt mục tiêu với điểm đã khóa/nhập**:  
   Nếu `remainingPoints < 0` hoặc `> 10 * editableCredits` → hiển thị cảnh báo “Với điểm đã nhập, không thể đạt GPA kỳ X.XX” và gợi ý giảm/ tăng điểm môn đã nhập.  
2. **Không có môn nào trong kỳ**: Ẩn bảng, hiển thị “Chưa có môn trong kỳ này.”  
3. **Tín chỉ môn = 0 hoặc null**: Bỏ qua môn đó trong tổng tín chỉ kỳ hoặc báo lỗi nhẹ.  
4. **Làm tròn**: Dùng `ACADEMIC_RULES.GPA_POINT_DECIMAL`; khi redistribution có thể làm tròn suggestedGrade đến 2 chữ số thập phân để dễ đọc.  
5. **Performance**: Redistribution chỉ chạy khi targetGPA hoặc danh sách môn/điểm trong kỳ thay đổi (useMemo/useCallback).  
6. **Accessibility**: Label rõ cho input, thông báo lỗi/ cảnh báo có aria.

---

## 5. Tóm tắt luồng dữ liệu

```
useStudentGradeData()     → gradesHistory, currentGPA, accumulatedCredits, totalCredits
useGPASimulator(...)      → simulatorCourses (ongoing + ĐKHP), handleGradeChange
GPACalculator.calculateRequiredAverageForTargetGPA(gradesHistory, targetGPA, TOTAL_CREDITS)
                          → baseResult (remainingCredits, requiredAverage, success, message)

GPAPullTool:
  - targetGPA (user) + baseResult
  - semesters[0].courses ← map từ simulatorCourses, suggestedGrade = requiredAverage
  - (Phase 2) locked courses → redistribution → suggestedGrade cho môn còn lại
  - (Phase 3) user thay đổi projectedGrade → redistribution trong kỳ → cập nhật suggestedGrade
  - (Phase 4) semesters[1..] từ curriculum, cùng logic redistribution từng kỳ
```

---

## 6. Tiêu chí chấp nhận (Acceptance criteria)

- [x] Sinh viên nhập GPA mục tiêu (vd 8.0) → thấy GPA hiện tại, mục tiêu, tín chỉ còn lại, điểm TB tối thiểu cần đạt.
- [ ] Thấy “GPA theo kỳ”: ít nhất một kỳ (Học kỳ tiếp theo) với mức GPA cần đạt = requiredAverage.
- [x] Bảng môn trong kỳ: mỗi môn có đề xuất điểm (ban đầu = requiredAverage), có thể nhập “điểm dự kiến”.
- [x] Môn đã có điểm (từ DB hoặc khóa) → read-only; đề xuất các môn còn lại để đạt GPA kỳ.
- [x] Khi user sửa điểm một môn (vd A=10, B=8.5), các môn còn lại (C, D) tự cập nhật đề xuất sao cho GPA kỳ = requiredAverage; GPA tổng vẫn đạt mục tiêu (trong phạm vi một kỳ).
- [x] Phase 4 & 5: Nhiều kỳ từ CTĐT, cảnh báo không đạt GPA kỳ, a11y.
- [x] Không ảnh hưởng Mô phỏng GPA và các trang khác; build không lỗi; logic GPA thống nhất với GPACalculator/AcademicRulesEngine.

---

## 7. Thứ tự ưu tiên triển khai

| Thứ tự | Nội dung | Phase |
|--------|----------|--------|
| 1 | Types + state GPAPullCourse, GPAPullSemester | 1 |
| 2 | Truyền simulator vào GPAPullTool, map sang GPAPullCourse | 1 |
| 3 | UI GPA tổng + GPA theo kỳ + bảng môn, suggested = requiredAverage | 1 |
| 4 | Khóa môn có điểm; redistribution khi có khóa | 2 |
| 5 | User sửa điểm → redistribution trong kỳ | 3 |
| 6 | Nhiều kỳ (curriculum) + polish | 4–5 |

Tài liệu này dùng làm kế hoạch step-by-step để triển khai công cụ Kéo GPA chuyên nghiệp, đúng quy chuẩn code hiện tại và không gây lỗi cho chức năng khác.
