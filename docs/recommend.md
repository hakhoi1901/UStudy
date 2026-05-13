**Luồng Tổng Quan**
`IntegratedStudyRoadmap` không tự tính gợi ý. Nó chỉ gọi `useCourseData()` rồi chọn source hiển thị:

- `viewMode === 'all'` → dùng `all`
- `viewMode === 'recommend'` → dùng `recommended`

Đoạn quyết định nằm ở [IntegratedStudyRoadmap.tsx](d:/Code/02_Projects/Active/UStudy/src/pages/integratedStudyRoadmap/IntegratedStudyRoadmap.tsx:64):

```ts
const { recommended, all, isReady, hasData } = useCourseData();
const currentSource = viewMode === 'recommend' ? recommended : all;
```

Sau đó chỉ filter theo search:

```ts
c.nameVi.toLowerCase().includes(searchTerm.toLowerCase()) ||
c.id.toLowerCase().includes(searchTerm.toLowerCase())
```

Nên thuật toán gợi ý thật sự nằm từ `useCourseData` xuống `CourseRecommender`.

**Nguồn Dữ Liệu**
Trong [useCourseData.ts](d:/Code/02_Projects/Active/UStudy/src/hooks/useCourseData.ts:33), hook đọc:

- `STUDENT_DB` / `student_db_full`: chứa `studentDb.grades`
- `COURSE_DB_OFFLINE` / `course_db_offline`: danh sách môn/lớp đang mở
- `useDepartmentData()`: lấy `courses`, `prerequisites`, `categories`, `tuitionRates` theo khoa/ngành/khoá đang chọn

Nếu thiếu `studentDb.grades` hoặc `courseDb` rỗng thì `hasData = false`, không có gợi ý.

Data lớp mở được tạo từ [dataProcessor.ts](d:/Code/02_Projects/Active/UStudy/src/logic/dataProcessor.ts:184), dạng chính là:

```ts
{
  id: string,
  name: string,
  credits: number,
  classes: { id: string; schedule: string[] }[]
}
```

Data CTĐT trong `courses.ts` dạng:

```ts
{
  course_id,
  course_name_vi,
  credits,
  course_type, // BB hoặc TC
  category,
  theory_hours,
  lab_hours,
  exercise_hours
}
```

Data tiên quyết trong `prerequisites.ts` dạng:

```ts
{
  course_id,
  prereq_id,
  type // PREVIOUS hoặc PREREQUISITE...
}
```

**Thuật Toán Gợi Ý Hiện Tại**
Core nằm ở [Recommender.ts](d:/Code/02_Projects/Active/UStudy/src/logic/scheduler/Recommender.ts:216).

Bước 1: phân tích bảng điểm bằng `getStudentStatus()`.

- `score >= 5.0` → `passed`
- `score < 5.0` → `failed`
- `score === ""`, `"(*)"`, `null`, `undefined` → `studying`
- điểm không parse được thành số → cũng coi là `studying`
- gặp `BAA00100` thì auto đánh dấu `ADD00031`, `ADD00032`, `ADD00033`, `ADD00034` là passed

Điểm cần lưu ý: hàm này không dùng `AcademicRulesEngine.resolveEffectiveGrades()`, nên nếu một môn có nhiều record, học lại/cải thiện, nó duyệt từng dòng và có thể vừa `passed` vừa `failed`. Đây là điểm nên sửa nếu muốn gợi ý chính xác hơn.

Bước 2: dựng graph tiên quyết bằng `PrerequisiteGraph`.

Logic hiện tại hơi ngược với tên thường dùng:

```ts
if (item.type === 'PREVIOUS') {
  softConstraints[cId].push(pid);
} else {
  hardConstraints[cId].push(pid);
}
```

Tức là:

- `PREVIOUS` bị coi là soft/song hành/bổ trợ
- mọi type khác, ví dụ `PREREQUISITE`, bị coi là hard prerequisite

`findBlockingPrereq(courseId, passed)` chỉ xét `hardConstraints`, không xét `PREVIOUS`.

Bước 3: add gợi ý theo priority.

Priority trong [Recommender.ts](d:/Code/02_Projects/Active/UStudy/src/logic/scheduler/Recommender.ts:128):

```ts
RETAKE = 4
MANDATORY = 3
ELECTIVE_REQUIRED = 2
SUGGESTED = 1
```

Nếu một môn được gợi ý nhiều lần, status priority cao hơn sẽ ghi đè.

Bước 4: `RETAKE`.

Với từng môn `failed`, thuật toán gọi:

```ts
const target = graph.findBlockingPrereq(cid, passed)
```

Nếu môn rớt bị chặn bởi hard prerequisite chưa qua, nó gợi ý môn chặn trước. Nếu không bị chặn, nó gợi ý chính môn rớt. Status là `RETAKE`.

Bước 5: `MANDATORY`.

Duyệt toàn bộ `allCoursesMeta`, môn nào:

```ts
course_type === 'BB'
!passed.has(cid)
!studying.has(cid)
```

thì tìm blocker bằng `findBlockingPrereq`. Nếu có target hợp lệ thì add `MANDATORY`.

Điểm cần lưu ý: vì `PREVIOUS` đang là soft, các môn có `PREVIOUS` chưa qua vẫn có thể được xem là không bị hard-block và được gợi ý trực tiếp.

Bước 6: `ELECTIVE_REQUIRED`.

Duyệt `categories` bằng `traverseCategories()`. Nó chỉ xử lý leaf có:

```ts
obj.courses && (obj.credits || obj.credits_required)
```

Sau đó `checkGroupRequirement()` tính tín chỉ hiện có trong group:

```ts
if (passed.has(cid) || studying.has(cid)) currentCredits += credits
```

Tức là môn đang học cũng được tính như đã đáp ứng tín chỉ nhóm.

Nếu `currentCredits < requiredCredits`, nó duyệt tất cả môn trong group chưa passed/chưa studying, tìm blocker hard prerequisite. Target được add status `ELECTIVE_REQUIRED`.

Điểm quan trọng: nó không chọn “vừa đủ số tín chỉ còn thiếu”; nó add tất cả môn còn lại trong group hoặc blocker của chúng, miễn group thiếu tín chỉ. Với group tự chọn lớn, gợi ý có thể rất nhiều.

Bước 7: `SUGGESTED`.

Sau khi đã có map gợi ý, nó duyệt các môn đã được add, lấy `softConstraints[cid]`, tức các prereq type `PREVIOUS`.

Nếu soft prereq chưa passed, chưa studying, chưa nằm trong recommendation map, và bản thân soft prereq không bị hard-block, thì add `SUGGESTED`.

Bước 8: lọc theo lớp đang mở.

Cuối cùng, dù map gợi ý có nhiều môn, output chỉ giữ môn có trong `openCourses`:

```ts
if (openClassesMap.has(cid)) finalOutput.push(...)
```

Nên tab `Gợi ý` thực chất là: “các môn thuật toán thấy nên học, nhưng chỉ nếu học kỳ hiện tại có lớp mở”.

**Mapping Ra UI**
Sau `recommend()`, [useCourseData.ts](d:/Code/02_Projects/Active/UStudy/src/hooks/useCourseData.ts:58) gọi `CourseDataMapper.mapCourseList`.

Trong [CourseDataMapper.ts](d:/Code/02_Projects/Active/UStudy/src/logic/CourseDataMapper.ts:47):

```ts
const needsRetake = isFailed || recStatus === 'RETAKE';

const isAvailable = isAllView
  ? !needsRetake
  : !!recStatus && recStatus !== 'RETAKE';
```

Nghĩa là:

- Ở tab `Gợi ý`, môn `RETAKE` có `needsRetake = true`, nhưng `isAvailable = false`.
- Tuy vậy [CourseRow.tsx](d:/Code/02_Projects/Active/UStudy/src/components/CourseRow.tsx:62) vẫn cho tick checkbox nếu `needsRetake = true`:

```ts
disabled={!course.isAvailable && !course.needsRetake}
```

Nên môn học lại vẫn chọn được.

Cách group UI:

- `category === 'FOUNDATION'` → `core`
- `category.startsWith('MAJOR_')`, `category === 'GRADUATION'`, `category.startsWith('SPECIALIZED_')` → `major`
- còn lại → `electives`