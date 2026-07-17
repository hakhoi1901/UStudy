# Cấu trúc lưu trữ cục bộ của UStudy

Tài liệu này là bản đồ kỹ thuật cho dữ liệu được lưu trong `localStorage`,
`sessionStorage` và RAM cache của UStudy. Khi code và tài liệu khác nhau, ưu tiên
code tại `src/config/storageKeys.ts` và `src/helpers/localStorage/save.tsx`, sau
đó cập nhật lại tài liệu này trong cùng thay đổi.

## 1. Kiến trúc tổng quát

```text
Portal / file import
        |
        v
raw_student_db           Dữ liệu gốc, giữ nguyên mọi trường đã cào
        |
        +--> student_db_full       Dữ liệu sinh viên đã chuẩn hóa cho UI
        |
        +--> course_db_offline     Môn, lớp và lịch đã chuẩn hóa cho solver

import_meta              Thời gian, phiên bản và tham số lần đồng bộ
```

Nguyên tắc nguồn dữ liệu:

- `raw_student_db` là nguồn gốc để xử lý lại dữ liệu. Không xóa field lạ chỉ vì
  UI hiện tại chưa dùng.
- `student_db_full` và `course_db_offline` là dữ liệu dẫn xuất, có thể tạo lại
  bằng `processRawData(raw_student_db)`.
- Dữ liệu nhạy cảm được mã hóa trước khi ghi vào `localStorage`. Sau khi mở khóa,
  bản đã giải mã chỉ nằm trong RAM cache để các hook đồng bộ đọc được.
- Snapshot hoàn tác lưu nguyên chuỗi đang có trong `localStorage`, bao gồm cả
  ciphertext; không tự giải mã toàn bộ snapshot.

## 2. API lưu trữ

| API | Nơi lưu | Dùng cho |
| --- | --- | --- |
| `saveSecure` / `readSecure` | `localStorage`, AES-GCM | Dữ liệu Portal và dữ liệu nhạy cảm |
| `savePlain` / `readPlain` | `localStorage`, JSON | Thiết lập, trạng thái UI, dữ liệu người dùng không nhạy cảm |
| `populateSecureCache` | RAM | Bản đã giải mã sau khi mở khóa |
| `readFromStorage` | RAM cache trước, JSON plain sau | Shim tương thích code cũ |
| `saveToStorage` | `localStorage`, JSON plain | Alias cũ của `savePlain` |

Mã hóa dùng PBKDF2-SHA256 (310.000 vòng) để tạo khóa AES-GCM 256-bit. Giá trị
mã hóa có dạng:

```text
base64(salt):base64(iv):base64(ciphertext)
```

Không dùng `JSON.parse(localStorage.getItem(key))` cho một key secure.

## 3. Dữ liệu Portal gốc

### `raw_student_db` (secure)

Đây là payload gốc đã merge từ bookmarklet hoặc extension. Object và từng record
được giữ nguyên; field mới từ scraper phải được lưu kể cả khi UI chưa biết nó.

```ts
interface RawStudentDatabase {
  name?: string;
  grades?: Array<{
    semester: string;
    id: string;
    name: string;
    credits: string;
    class: string;
    type: string;
    score: string;
    notes: string;
    [field: string]: unknown;
  }>;
  exams?: Record<string, {
    midterm: RawExamEntry[];
    final: RawExamEntry[];
  }> | {
    midterm: RawExamEntry[];
    final: RawExamEntry[];
  };
  tuition?: Record<string, RawTuitionPeriod>;
  registrations?: RawRegistration[];
  courses?: RawOpenClass[];
  [futureField: string]: unknown;
}
```

Các type rút gọn được tham chiếu ở trên:

```ts
type RawExamEntry = {
  stt: string;
  id: string;
  name: string;
  group: string;
  date: string;
  time: string;
  room: string;
  place: string;
  notes: string;
  type: string;
  [portalField: string]: unknown;
};

type RawTuitionPeriod = {
  details: Array<{
    stt: string;
    semester: string;
    subject: string;
    credits: string;
    periods: string;
    tuitionCredits: string;
    originalFee: string;
    discount: string;
    support: string;
    fee: string;
    cost: string;
    notes: string;
    [portalField: string]: unknown;
  }>;
  totals: {
    credits: string;
    periods: string;
    tuitionCredits: string;
    fee: string;
    actualFee: string;
    totalDue: string;
    [portalField: string]: unknown;
  };
  updatedDate: string;
  year: string;
  sem: string;
  [portalField: string]: unknown;
};
```

`RawRegistration` hiện có các field chính:

```ts
{
  id: string;
  name: string;
  classGroup: string;
  regType: string;
  courseType: string;
  schedule: string;
  startWeek: string;
  semester?: string;
}
```

`RawOpenClass` giữ toàn bộ dòng lớp lý thuyết và chi tiết API của nhóm con:

```ts
{
  id: string;                 // Mã môn
  name: string;
  className: string;          // Mã lớp lý thuyết
  credits: string;
  capacity: string;           // Sĩ số tối đa lớp lý thuyết
  enrolled: string;           // Số đã đăng ký lớp lý thuyết
  cohort: string;
  schedule: string;
  practicalGroupRaw: string;
  exerciseGroupRaw: string;
  location: string;
  practicalClasses: Array<{
    Nhom?: string;
    SiSo?: string;
    DaDK?: string;
    LichHoc?: string;
    DiaDiem?: string;
    MaDiaDiem?: string;
    [portalField: string]: unknown;
  }>;
  exerciseClasses: Array<{
    Nhom?: string;
    SiSo?: string;
    DaDK?: string;
    LichHoc?: string;
    DiaDiem?: string;
    MaDiaDiem?: string;
    [portalField: string]: unknown;
  }>;
  [portalField: string]: unknown;
}
```

Không đổi tên hoặc loại field trong database raw. Nếu cần format thuận tiện hơn,
hãy thêm dữ liệu dẫn xuất ở processor.

## 4. Dữ liệu Portal đã xử lý

### `student_db_full` (secure)

```ts
{
  name: string;
  grades: Array<{
    semester: string;
    id: string;
    name: string;
    credits: string;
    class: string;
    type: string;
    score: number | string;
    notes: string;
  }>;
  exams: RawStudentDatabase['exams'];
  tuition: Record<string, {
    total: string;
    fee: string;
    actualFee: string;
    year: string;
    sem: string;
    updatedDate: string;
    details: Array<{
      code: string;
      name: string;
      credits: number;
      fee: number;
      actualFee: number;
      periods: number;
      tuitionCredits: number;
      classId: string;
    }>;
  }>;
  registrations: RawRegistration[];
  program: unknown[];
  source: {
    additionalPortalFields: Record<string, unknown>;
  };
}
```

### `course_db_offline` (secure)

Mỗi môn chứa bản Portal gốc theo môn và các tổ hợp lớp dùng được bởi solver:

```ts
type EnrollmentSnapshot = {
  capacity: number | null;
  enrolled: number | null;
  remaining: number | null;
  rawCapacity: string;
  rawEnrolled: string;
};

type CourseDatabaseEntry = {
  id: string;
  name: string;
  credits: number;
  source: {
    portalRows: RawOpenClass[]; // giữ nguyên mọi field Portal của môn
  };
  classes: Array<{
    id: string;                 // LT + hậu tố _TH_... và _BT_...
    schedule: string[];         // lịch đã chuẩn hóa để solver đọc
    components: {
      theory: ClassComponent;
      practical: ClassComponent | null;
      exercise: ClassComponent | null;
    };
    enrollment: {
      theory: EnrollmentSnapshot;
      practical: EnrollmentSnapshot | null;
      exercise: EnrollmentSnapshot | null;
    };
  }>;
};

type ClassComponent = {
  group: string;
  schedule: string[];
  rawSchedules: string[];
  locations: string[];
  enrollment: EnrollmentSnapshot;
};
```

### `import_meta` (secure)

```ts
{
  version?: string;
  scrapedAt?: string;
  params?: Record<string, unknown>;
  sourceUpdatedAt?: Partial<Record<
    'grades' | 'registrations' | 'exams' | 'courses' | 'tuition',
    string
  >>;
  [futureField: string]: unknown;
}
```

## 5. Key ứng dụng

### Cấu hình chương trình đào tạo (plain)

| Key | Kiểu dữ liệu | Ý nghĩa |
| --- | --- | --- |
| `selected_faculty_id` | `string` | Khoa đang chọn |
| `selected_major_id` | `string` | Ngành đang chọn |
| `selected_cohort_id` | `string` | Khóa tuyển |
| `selected_academic_year` | `string` | Năm học đang chọn |
| `selected_semester_number` | `number` | Học kỳ đang chọn |
| `department_configured` | `boolean` | Đã hoàn thành thiết lập khoa/ngành |

### Lộ trình và thời khóa biểu (plain theo code hiện tại)

| Key | Cấu trúc chính |
| --- | --- |
| `selected_courses_basket` | `string[]` mã môn đã chọn |
| `allowed_classes_map` | `Record<courseId, classId[]>` |
| `solver_preferences` | `{ daysOff?, session?, strategy?, noGaps? }` |
| `saved_schedules` | `SavedSchedule[]` gồm tên, thời gian, sessions, môn và lớp đã chọn |
| `schedule_overrides` | `{ sessionOverrides, weekOverrides, holidays }` |
| `study_plan_draft` | `{ semesters: StudyPlanSemester[], plan: Record<semesterId, courseId[]> }` |
| `study_plan_draft_layout` | `number` phần trăm chiều rộng panel trái |
| `study_plan_category_expansion` | `Record<categoryId, boolean>` |
| `active_group_schedule` | Lịch nhóm đang được chọn để hiển thị |
| `group_scheduler_members` | `GroupMemberToken[]` |
| `group_schedule_ui_state` | Bước, chế độ xem và các panel đang mở |
| `group_schedule_last_result` | `{ version: 1, updatedAt: string, memberSignature: string, result: GroupScheduleRunResult }`; toàn bộ phương án của lần xếp thành công gần nhất cho đúng nhóm hiện tại |
| `schedule_mode` | `'personal' | 'group'` |

### GPA, UI và tiện ích (plain theo code hiện tại)

| Key | Cấu trúc chính |
| --- | --- |
| `gpa_projected_grades` | `Record<courseId, number>` |
| `gpa_component_grades` | `{ predictionPlans, targetPlans }`; điểm thành phần được tách riêng giữa Dự đoán và Mục tiêu |
| `gpa_goal_grades` | `Record<courseCode, number | null>`; Dự đoán thay đổi sẽ ghi mềm sang Mục tiêu, còn thay đổi ở Mục tiêu không ghi ngược lại |
| `gpa_pull_future_grades` | Dữ liệu dự kiến GPA tương lai; key dự phòng/legacy |
| `grade_main_tab` | `'overview' | 'target' | 'history'` |
| `study_roadmap_active_tab` | Tab con gần nhất của Lộ trình học tập |
| `app_notifications` | Mảng thông báo của ứng dụng |
| `chatbot_chat_history` | Lịch sử hội thoại chatbot |

## 6. Key nội bộ và hoàn tác

| Key | Storage | Ý nghĩa |
| --- | --- | --- |
| `__pbkdf2_salt__` | local | Salt hiện tại, Base64 |
| `__pin_verify__` | local, secure | Blob kiểm tra PIN |
| `__ustudy_last_import_rollback__` | local, plain | Snapshot toàn bộ localStorage trước import gần nhất |
| `__ustudy_import_history__` | local, plain | Tối đa 20 bản tóm tắt import |
| `curent_page` | session | Route gần nhất; giữ nguyên lỗi chính tả vì là key đã phát hành |
| `__fail_count__` | session | Số lần nhập PIN sai trong phiên |
| `__lockout_until__` | session | Mốc hết khóa tạm thời |
| `USER_PIN` | session | Shim legacy; code mới không nên phụ thuộc vào key này |

Schema snapshot:

```ts
interface ImportRollbackSnapshot {
  createdAt: string;
  source: string;
  summary: { added: number; updated: number; removed?: number; unchanged: number };
  data: Record<string, string>; // nguyên giá trị localStorage trước import
  details?: Array<{
    source: string;
    added: number;
    updated: number;
    removed?: number;
    unchanged: number;
  }>;
  restoredSources?: string[];
}
```

## 7. Các điểm lệch hiện có

- `STORAGE_KEYS.APP_NOTIFICATION` đang trỏ đến `app_notification`, nhưng
  `NotificationContext` thực tế đọc/ghi `app_notifications`.
- `SECURE_DATA_KEYS` có một số key hiện vẫn được ghi bằng `savePlain`, gồm
  `gpa_projected_grades`, `app_notifications`, `solver_preferences`,
  `allowed_classes_map` và `saved_schedules`. Không suy luận rằng một key đã mã
  hóa chỉ vì nó có tên trong danh sách này; phải kiểm tra call site ghi dữ liệu.
- `saveToStorage` và `readFromStorage` là shim cũ. Code mới nên chọn rõ
  `savePlain/readPlain` hoặc `saveSecure/readSecure`.

## 8. Checklist khi thêm hoặc sửa dữ liệu lưu trữ

1. Thêm tên key vào `src/config/storageKeys.ts`; không rải string literal mới.
2. Chọn rõ plain hay secure. Nếu secure, thêm key vào `SECURE_DATA_KEYS` và dùng
   `saveSecure`, `readSecure`, RAM cache đúng luồng mở khóa.
3. Nếu là dữ liệu import/export, cập nhật nhãn và nhóm trong
   `src/features/setting/components/importData.tsx`.
4. Nếu thay schema, thêm migration hoặc fallback để dữ liệu cũ vẫn đọc được.
5. Nếu là dữ liệu Portal, luôn giữ bản gốc trong `raw_student_db`; chỉ tạo dữ
   liệu dẫn xuất ở `dataProcessor.ts`.
6. Cập nhật schema và bảng key trong tài liệu này trong cùng commit.
7. Chạy `npx tsc --noEmit` và `npm run build`.

## 9. File nguồn cần đọc khi sửa

- `src/config/storageKeys.ts`: registry key công khai.
- `src/helpers/localStorage/save.tsx`: mã hóa, plain storage, RAM cache, lịch sử
  import và hoàn tác.
- `src/context/CryptoContext.tsx`: mở khóa và populate RAM cache.
- `src/logic/dataProcessor.ts`: raw Portal sang dữ liệu dẫn xuất.
- `src/logic/import-preview.ts`: so sánh và merge bản import.
- `src/logic/import-metadata.ts`: metadata từng nguồn.
- `src/logic/import-rollback.ts`: hoàn tác một phần theo nguồn.
- `src/features/setting/components/importData.tsx`: import/export toàn bộ storage.
