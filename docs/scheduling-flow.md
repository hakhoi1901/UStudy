# Luồng xếp lịch cá nhân và xếp lịch nhóm

Tài liệu này mô tả luồng dữ liệu từ lúc người dùng chọn môn, cấu hình điều kiện, chạy thuật toán, đến lúc hệ thống trả về thời khóa biểu.

Các file chính:

- UI chọn môn và giỏ môn: `src/components/SelectionBasket.tsx`
- UI lịch dự kiến cá nhân: `src/pages/integratedStudyRoadmap/CalenderView.tsx`
- Hook xếp lịch cá nhân: `src/hooks/useScheduleSolver.ts`
- Solver cá nhân: `src/logic/scheduler/Scheduler.ts`
- Thuật toán genetic cá nhân: `src/logic/scheduler/GeneticSolver.ts`
- Chấm điểm lịch cá nhân: `src/logic/scheduler/FitnessValuator.ts`
- Database lớp học: `src/logic/scheduler/CourseDatabase.ts`
- Giải mã mask sang block lịch: `src/logic/scheduler/ScheduleDecoder.ts`
- UI xếp lịch nhóm: `src/pages/GroupSchedulePage.tsx`
- Hook xếp lịch nhóm: `src/hooks/useGroupScheduler.ts`
- Solver nhóm: `src/logic/scheduler/GroupScheduler.ts`
- Type nhóm: `src/logic/scheduler/GroupTypes.ts`
- Config điểm: `src/logic/scheduler/Constants.ts`

## 1. Dữ liệu nền dùng cho xếp lịch

Xếp lịch dùng dữ liệu lớp học offline, ưu tiên đọc từ localStorage key `COURSE_DB_OFFLINE`. Nếu chưa có dữ liệu offline, xếp lịch cá nhân fallback sang file tĩnh `src/logic/scheduler/Course_db.json`.

Mỗi môn trong database có dạng khái niệm:

```ts
{
  id: "CSC10001",
  name: "Tên môn",
  credits: 4,
  classes: [
    {
      id: "23CLC01",
      schedule: ["T2(1-3)", "T4(6-8)"],
      mask: [/* optional */]
    }
  ]
}
```

Khi nạp vào `CourseDatabase`, mỗi lớp được chuẩn hóa thành `scheduleMask`.

`scheduleMask` là một `Bitset` biểu diễn các tiết học trong tuần. Nếu class đã có `mask`, hệ thống dùng trực tiếp. Nếu không có `mask` nhưng có `schedule`, hệ thống gọi `encodeScheduleToMask()` để mã hóa chuỗi lịch thành bitset.

Mask giúp thuật toán kiểm tra trùng lịch và kiểm tra ngày nghỉ nhanh hơn so với parse chuỗi lịch mỗi lần.

## 2. Xếp lịch cá nhân

### 2.1. Người dùng nhập dữ liệu

Người dùng chọn môn ở tab chọn môn. Các môn được đưa vào giỏ qua `SelectionBasket`.

Giỏ môn quản lý:

- Danh sách môn đã chọn.
- Tổng tín chỉ.
- Học phí dự kiến.
- Bộ lọc lớp theo từng môn qua nút lọc lớp.

Khi người dùng bấm `Xác nhận đăng ký`, `SelectionBasket` gọi:

```ts
solve(selectedCourses, allowedClassesMap)
```

Trong đó:

- `selectedCourses`: danh sách môn người dùng muốn học.
- `allowedClassesMap`: map các lớp được phép cho từng môn. Nếu người dùng lọc bỏ lớp nào, lớp đó không được đưa vào solver.

Sau đó app chuyển sang tab `calendar`.

### 2.2. Người dùng cấu hình lịch cá nhân

Trong `CalenderView`, người dùng có thể mở cấu hình lịch và chỉnh:

- Buổi ưu tiên: tự do, sáng, chiều.
- Chiến thuật: dồn lịch hoặc trải đều.
- Tiết trống: cho phép hoặc hạn chế.
- Ngày muốn nghỉ: mỗi ngày có 4 trạng thái theo chu kỳ:
  - Không chọn.
  - Nghỉ cả ngày.
  - Nghỉ buổi sáng.
  - Nghỉ buổi chiều.

Dữ liệu cấu hình được lưu trong localStorage key `SOLVER_PREFERENCES`.

`daysOff` hỗ trợ hai dạng:

- Dữ liệu cũ: `0`, `1`, `2`... nghĩa là nghỉ cả ngày.
- Dữ liệu mới: `"0:morning"`, `"0:afternoon"`... nghĩa là nghỉ sáng hoặc nghỉ chiều.

Quy ước ngày:

- `0` là Thứ 2.
- `1` là Thứ 3.
- ...
- `5` là Thứ 7.
- `6` là Chủ nhật.

### 2.3. Hook `useScheduleSolver` chuẩn bị dữ liệu

`useScheduleSolver` là lớp trung gian giữa UI và solver.

Khi `solve()` được gọi, hook thực hiện:

1. Bật trạng thái loading.
2. Đọc database lớp học từ `COURSE_DB_OFFLINE`, nếu không có thì dùng `Course_db.json`.
3. Lấy danh sách mã môn từ `selectedCourses`.
4. Gọi `runScheduleSolver(dbData, userWants, selectedClassMap, prefs)`.

`userWants` là danh sách mã môn, ví dụ:

```ts
["CSC10001", "MTH00003"]
```

`selectedClassMap` là bộ lọc lớp:

```ts
{
  CSC10001: ["23CLC01", "23CLC02"]
}
```

Nếu môn không có trong `selectedClassMap`, solver được phép chọn toàn bộ lớp của môn đó.

### 2.4. `Scheduler.ts` lọc dữ liệu lớp

`runScheduleSolver()` làm các bước chính:

1. Tạo `CourseDatabase`.
2. Load dữ liệu môn và lớp.
3. Với mỗi môn người dùng chọn:
   - Tìm môn trong database.
   - Nếu có filter lớp, chỉ giữ các lớp được phép.
   - Nếu không có filter, giữ toàn bộ lớp.
4. Tạo `FitnessEvaluator` với cấu hình người dùng.
5. Tạo `GeneticSolver` với danh sách môn đã lọc.
6. Chạy solver để lấy top phương án.

Sau bước này, mỗi môn chỉ còn danh sách class hợp lệ. Nếu một môn bị filter nhưng không còn lớp nào hợp lệ, môn đó bị bỏ khỏi kết quả.

### 2.5. Genetic solver hoạt động như thế nào

`GeneticSolver` biểu diễn một phương án lịch bằng `Chromosome`.

Một chromosome có mảng `genes`, trong đó mỗi gene là index lớp được chọn cho một môn.

Ví dụ người dùng chọn 3 môn:

```ts
genes = [2, 0, 4]
```

Nghĩa là:

- Môn 1 chọn lớp index 2.
- Môn 2 chọn lớp index 0.
- Môn 3 chọn lớp index 4.

Quá trình chạy:

1. Khởi tạo quần thể ngẫu nhiên với `CONFIG.POPULATION_SIZE`.
2. Tính fitness cho từng chromosome.
3. Lặp qua `CONFIG.GENERATIONS` thế hệ:
   - Sort population theo fitness giảm dần.
   - Giữ lại top 10% tốt nhất.
   - Chọn parent bằng tournament selection.
   - Lai ghép bằng crossover.
   - Đột biến một gene theo `CONFIG.MUTATION_RATE`.
   - Tính lại fitness cho cá thể mới.
4. Sort kết quả cuối.
5. Trả về top phương án khác nhau.

### 2.6. Chấm điểm lịch cá nhân

`FitnessEvaluator` tính điểm cho từng chromosome.

Điểm bắt đầu từ `WEIGHTS.BASE`.

Các nhóm điểm/phạt chính:

- Trùng lịch: phạt cực nặng bằng `PENALTY_HARD`.
- Học vào ngày hoặc buổi muốn nghỉ: phạt `PENALTY_DAY_OFF`.
- Đúng buổi ưu tiên: cộng `BONUS_SESSION`.
- Sai buổi ưu tiên: trừ `PENALTY_WRONG_SESSION`.
- Dồn lịch: thưởng thêm theo số ngày trống bằng `BONUS_COMPRESS`.
- Trải đều: phạt ngày học quá nặng bằng `PENALTY_SPREAD`.
- Tiết trống: trừ `PENALTY_GAP`, nếu bật `noGaps` thì phạt nặng hơn.

Trùng lịch là hard constraint. Nếu có trùng, fitness bị âm rất lớn và phương án gần như bị loại khỏi top.

Ngày nghỉ được kiểm bằng mask:

- Nghỉ cả ngày: kiểm toàn bộ 20 half-period của ngày.
- Nghỉ sáng: kiểm half-period 0 đến 9, tương ứng tiết 1-5.
- Nghỉ chiều: kiểm half-period 10 đến 19, tương ứng tiết 6-10.

### 2.7. Trả kết quả cá nhân về UI

Solver trả về danh sách phương án dạng raw:

```ts
{
  option: 1,
  fitness: 12345,
  schedule: [
    {
      subjectID: "CSC10001",
      classID: "23CLC01",
      mask: [/* ... */],
      schedule: ["T2(1-3)"]
    }
  ]
}
```

`useScheduleSolver` chuyển raw result thành `ScheduleOption`:

```ts
{
  option: 1,
  fitness: 12345,
  classSections: ClassSection[]
}
```

Việc chuyển đổi dùng `maskToSections()`. Hàm này biến mask thành các block lịch có:

- Mã môn.
- Tên môn.
- Mã lớp.
- Ngày trong tuần.
- Tiết bắt đầu.
- Tiết kết thúc.
- Màu hiển thị.

`CalenderView` nhận `currentSections` từ hook và render grid thời khóa biểu. Người dùng có thể chuyển qua lại các phương án bằng thanh `PA 1`, `PA 2`, ...

## 3. Xếp lịch nhóm

Xếp lịch nhóm không dùng genetic solver như cá nhân. Nó dùng DFS/backtracking có sắp thứ tự candidate, kết hợp scoring để rank phương án.

Lý do: bài toán nhóm cần quản lý nhiều thành viên, môn chung, môn riêng, cùng lớp hoặc tách lớp, ưu tiên cá nhân, ưu tiên nhóm, và fairness.

### 3.1. Người dùng nhập dữ liệu nhóm

UI chính nằm ở `GroupSchedulePage`.

Flow gồm 4 bước:

1. Thêm thành viên.
2. Cấu hình nhóm.
3. Xếp lịch.
4. Xem kết quả.

Ở bước thêm thành viên, người dùng nhập:

- Nickname.
- Danh sách môn.
- Cấu hình cá nhân.
- Cấu hình lớp cá nhân qua nút lọc trong giỏ môn.

Nếu đang có giỏ môn cá nhân, nhóm lấy môn từ giỏ hiện tại. Nếu không, người dùng có thể nhập mã môn thủ công.

Mỗi thành viên được lưu thành `GroupMemberToken`:

```ts
{
  nickname: "Bạn A",
  sharedCourses: [],
  personalCourses: ["CSC10001", "MTH00003"],
  busyMask: [],
  preferredClasses: {
    CSC10001: {
      excluded: ["23CLC03"],
      preferred: ["23CLC01"],
      required: ["23CLC02"]
    }
  },
  personalConfig: {
    daysOff: ["0:morning"],
    session: "1",
    strategy: "compress",
    noGaps: true
  }
}
```

`preferredClasses` hỗ trợ:

- `excluded`: không muốn vào lớp đó.
- `preferred`: ưu tiên lớp đó.
- `required`: bắt buộc lớp đó, nếu lệch sẽ bị phạt rất nặng.

### 3.2. Link nhóm

Khi thêm thành viên, danh sách member được sanitize rồi encode vào URL hash.

Các hàm liên quan:

- `sanitizeGroupMember()`
- `encodeGroupURL()`
- `decodeGroupURL()`

Dữ liệu được JSON stringify, nén bằng `pako.deflate`, rồi encode base64-url.

Khi mở lại link nhóm, app decode hash và dựng lại danh sách thành viên. Nếu link lỗi hoặc bị cắt ngắn, app hiển thị decode error.

### 3.3. Cấu hình nhóm

Ở bước cấu hình nhóm, người dùng chọn:

- Buổi ưu tiên của nhóm.
- Chiến thuật dồn lịch nhóm.
- Tiết trống nhóm.
- Ngày nhóm muốn nghỉ, cũng theo 4 trạng thái: cả ngày, sáng, chiều, bỏ chọn.
- Lớp ưu tiên theo môn chung.

Cấu hình lớp nhóm có 4 trạng thái:

- `Cấm`: nhóm không muốn vào lớp đó.
- `Không`: không cấu hình.
- `Ưu tiên`: cộng điểm nếu chọn được, phạt nếu không chọn.
- `Bắt buộc`: yêu cầu rất mạnh, lệch sẽ bị phạt cực nặng.

Ưu tiên nhóm có trọng số cao hơn ưu tiên cá nhân.

### 3.4. Hook `useGroupScheduler`

`useGroupScheduler` quản lý:

- Danh sách thành viên.
- Link share nhóm.
- Trạng thái loading.
- Kết quả solver.
- Warning và error.

Khi gọi `solve(config)`, hook:

1. Kiểm tra nhóm có ít nhất 2 thành viên.
2. Kiểm tra có database lớp học.
3. Gọi `runGroupScheduleSolver(dbData, members, config)`.
4. Lưu result vào state.

### 3.5. Chuẩn hóa dữ liệu trước khi solve

`runGroupScheduleSolver()` đầu tiên sanitize member.

`sanitizeGroupMember()` làm các việc:

- Chuẩn hóa mã môn thành uppercase.
- Loại duplicate course.
- Chuẩn hóa `busyMask`.
- Chuẩn hóa `preferredClasses`.
- Giữ lại `personalConfig`.

Sau đó solver build `density` bằng `buildDensityMap()`.

`density` là danh sách môn trong nhóm kèm danh sách thành viên đăng ký môn đó:

```ts
{
  courseId: "CSC10001",
  subscribers: [0, 1, 2],
  isShared: true
}
```

Nếu một môn có từ 2 thành viên trở lên, `isShared = true`.

Danh sách density được sort để môn có nhiều subscriber và môn chung được xử lý trước.

### 3.6. Kiểm tra dữ liệu lớp học

Solver nạp database bằng `CourseDatabase`.

Với từng môn trong density:

- Nếu môn có lớp trong database, giữ lại.
- Nếu không có lớp, thêm warning và loại môn đó khỏi bài toán.

Nếu không còn thành viên hoặc không còn môn hợp lệ, solver trả về rỗng.

### 3.7. Fitness config nhóm

`runGroupScheduleSolver()` tạo `fitnessConfig` từ config người dùng và default trong `GROUP_SCHEDULER_WEIGHTS`.

Các nhóm config chính:

- `fairnessWeight`: phạt lệch điểm giữa thành viên.
- `sharedSlotBonus`: thưởng môn chung được học cùng lớp.
- `personalPreferenceWeight`: thưởng đúng lớp ưu tiên cá nhân.
- `groupPreferenceWeight`: thưởng đúng lớp ưu tiên nhóm.
- `personalRequiredPreferenceWeight`: thưởng đúng lớp bắt buộc cá nhân.
- `groupRequiredPreferenceWeight`: thưởng đúng lớp bắt buộc nhóm.
- `*_MissPenalty`: phạt khi lệch ưu tiên, lệch bắt buộc, hoặc bị xếp vào lớp cấm.

Config nhóm nằm ở `GROUP_SCHEDULER_WEIGHTS`.

### 3.8. Solver nhóm tìm phương án như thế nào

Solver nhóm dùng `solveGroup()`.

Input chính:

- `courses`: density map.
- `courseDatabase`: database môn/lớp.
- `members`: danh sách thành viên.
- `mode`: `shared-first` hoặc `split`.
- `preferenceMode`: `strict` hoặc `relaxed`.

Solver dùng DFS:

1. Bắt đầu từ môn đầu tiên trong density.
2. Lấy danh sách lớp có thể chọn cho môn đó.
3. Sort lớp bằng `getPreferenceHits()`.
4. Thử từng lớp.
5. Kiểm tra ràng buộc ưu tiên bằng `classMatchesPreferenceConstraints()`.
6. Kiểm tra trùng lịch bằng `isClassValid()`.
7. Nếu hợp lệ, cập nhật state mask của từng thành viên.
8. Chuyển sang môn tiếp theo.
9. Khi xếp xong toàn bộ môn, lưu một solution.

State của nhóm là `StateMatrix`:

```ts
number[][]
```

Mỗi hàng là mask lịch của một thành viên. Khi một thành viên được xếp thêm lớp, mask lớp được OR vào mask hiện tại của thành viên đó.

### 3.9. Chế độ `shared-first` và `split`

`shared-first` cố gắng xếp môn chung vào cùng một lớp cho tất cả subscriber.

Ví dụ môn `CSC10001` có 3 thành viên cùng đăng ký. Nếu đang ở `shared-first`, solver thử chọn một lớp duy nhất cho cả 3 người.

`split` cho phép mỗi thành viên chọn lớp riêng cho cùng một môn.

Chế độ split được dùng khi không thể tìm nghiệm tốt trong shared-first.

### 3.10. Chế độ `strict` và `relaxed`

`strict` giữ ràng buộc lớp mạnh hơn:

- Lớp `required` phải được chọn nếu có.
- Lớp `excluded` không được chọn.

`relaxed` cho phép lệch các ràng buộc đó, nhưng điểm bị phạt rất nặng.

Nhờ vậy solver vẫn có thể trả phương án khả dụng trong trường hợp điều kiện quá chặt.

### 3.11. Thứ tự fallback của solver nhóm

`runGroupScheduleSolver()` thử theo thứ tự:

1. `shared-first` + `strict`
2. `split` + `strict`
3. `shared-first` + `relaxed`
4. `split` + `relaxed`

Nếu một bước không tìm được solution, solver thêm warning rồi thử bước tiếp theo.

Ý nghĩa:

- Ưu tiên cao nhất là học chung lớp và giữ cấu hình bắt buộc/cấm.
- Nếu không được, cho tách lớp nhưng vẫn giữ cấu hình.
- Nếu vẫn không được, cho lệch cấu hình nhưng trừ điểm rất mạnh.
- Cuối cùng mới vừa cho tách lớp vừa cho lệch cấu hình.

### 3.12. Chấm điểm solution nhóm

Sau khi DFS tìm được candidate solution, solver gọi `scoreGroupSolution()`.

Điểm nhóm gồm:

1. Điểm lịch của từng thành viên.
2. Phạt fairness.
3. Thưởng môn chung được học cùng lớp.
4. Thưởng/phạt theo ưu tiên lớp cá nhân và nhóm.

Điểm lịch từng thành viên được tính lại bằng `FitnessEvaluator`, giống xếp lịch cá nhân:

- Ngày nghỉ.
- Buổi học.
- Chiến thuật dồn/trải.
- Tiết trống.
- Trùng lịch.

Điểm member gồm hai phần:

- `sharedScore`: điểm cho các môn chung.
- `personalScore`: điểm cho các môn riêng, có merge thêm `member.personalConfig`.

Sau đó solver tính độ lệch điểm giữa các thành viên:

```ts
fairnessPenalty = fairnessWeight * sqrt(variance)
```

Nếu một thành viên có lịch quá xấu so với những người còn lại, variance tăng và điểm nhóm bị trừ.

### 3.13. Ưu tiên lớp trong nhóm

Khi chấm từng lớp được chọn, solver xem:

- Cấu hình nhóm cho môn đó.
- Cấu hình cá nhân của thành viên cho môn đó.

Nếu lớp được chọn nằm trong:

- `required`: cộng required bonus.
- `preferred`: cộng preferred bonus.
- `excluded`: trừ excluded penalty.

Nếu môn có danh sách `required` nhưng solver chọn lớp khác, bị trừ required miss penalty.

Nếu môn có danh sách `preferred` nhưng solver chọn lớp khác, bị trừ preferred miss penalty.

Trọng số nhóm cao hơn cá nhân, nên cấu hình nhóm thắng trong ranking tổng thể.

### 3.14. Trả kết quả nhóm về UI

Sau khi chấm điểm, solver:

1. Sort solution theo fitness giảm dần.
2. Lấy top 3.
3. Chuyển solution thành `GroupScheduleOption`.

`GroupScheduleOption` gồm:

```ts
{
  option: 1,
  fitness: 12345,
  assignments: {
    "CSC10001": "23CLC01",
    "MTH00003::member-1": "23CLC02"
  },
  schedules: [
    {
      memberIndex: 0,
      nickname: "Bạn A",
      items: [...]
    }
  ]
}
```

`assignments` lưu lớp được chọn. Nếu môn chung học cùng lớp, key là mã môn. Nếu môn bị tách theo thành viên, key có dạng member assignment.

`schedules` là dữ liệu đã gom theo từng thành viên để UI render.

### 3.15. Hiển thị kết quả nhóm

UI kết quả nhóm có hai kiểu xem bảng:

- Theo môn học.
- Theo thành viên.

Ngoài ra có nút `Xem lịch nhóm`.

Khi mở lịch nhóm, `GroupScheduleCalendarPreview` hiển thị:

- Thanh chuyển phương án `PA 1`, `PA 2`, ...
- Thanh chuyển thành viên.
- Grid lịch giống lịch dự kiến cá nhân.

Preview dùng `maskToSections()` để chuyển item mask của từng thành viên thành `ClassSection[]`, rồi render lên grid.

Khi người dùng bấm `Dùng lịch đang xem`, hệ thống:

1. Lấy option đang chọn.
2. Lấy thành viên đang chọn.
3. Gọi `getOptionRegistrations()`.
4. Lưu vào localStorage key `ACTIVE_GROUP_SCHEDULE`.
5. Chuyển sang trang thời khóa biểu.

Trang thời khóa biểu ưu tiên đọc `ACTIVE_GROUP_SCHEDULE`. Nếu có lịch nhóm đang active, nó dùng registrations của nhóm để build lịch tuần.

## 4. Khác nhau giữa xếp lịch cá nhân và nhóm

| Tiêu chí | Xếp lịch cá nhân | Xếp lịch nhóm |
| --- | --- | --- |
| Input chính | Một danh sách môn | Nhiều thành viên, mỗi người có danh sách môn |
| Thuật toán tìm kiếm | Genetic algorithm | DFS/backtracking có fallback |
| Mục tiêu | Tìm lịch tốt cho một người | Tìm lịch cân bằng cho nhiều người |
| Trùng lịch | Kiểm trong một lịch cá nhân | Kiểm riêng theo từng member |
| Môn chung | Không có khái niệm nhóm | Ưu tiên học cùng lớp |
| Lớp ưu tiên | Filter lớp trong giỏ | Cấm/ưu tiên/bắt buộc theo cá nhân và nhóm |
| Ngày nghỉ | Theo cá nhân | Có cấu hình nhóm và cấu hình cá nhân |
| Output | `ScheduleOption[]` | `GroupScheduleOption[]` |
| Render lịch | `CalenderView` | `GroupScheduleResult` và `GroupScheduleCalendarPreview` |

## 5. Tóm tắt pipeline

### Cá nhân

```text
Người dùng chọn môn
-> SelectionBasket lưu selectedCourses và allowedClassesMap
-> useScheduleSolver.solve()
-> runScheduleSolver()
-> CourseDatabase load dữ liệu lớp
-> Lọc class theo allowedClassesMap
-> GeneticSolver tạo và tiến hóa population
-> FitnessEvaluator chấm điểm
-> Lấy top phương án
-> maskToSections()
-> CalenderView render grid lịch
```

### Nhóm

```text
Người dùng thêm thành viên
-> GroupSchedulePage tạo GroupMemberToken
-> useGroupScheduler lưu members và encode link nhóm
-> Người dùng cấu hình nhóm
-> useGroupScheduler.solve()
-> runGroupScheduleSolver()
-> sanitize members
-> buildDensityMap()
-> CourseDatabase load dữ liệu lớp
-> solveGroup() thử shared-first/split và strict/relaxed
-> scoreGroupSolution()
-> rank top 3
-> toScheduleOption()
-> GroupScheduleResult render bảng
-> GroupScheduleCalendarPreview render lịch theo PA/thành viên
```
