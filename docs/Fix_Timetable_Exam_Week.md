# Hướng dẫn Fix Lỗi: Thời khoá biểu hiển thị sai vào tuần thi

## 1. Mô tả vấn đề (Bug Description)
**Hiện trạng:** Dữ liệu môn học lấy từ Portal (cào qua Bookmarklet) chỉ cung cấp `Tuần bắt đầu` (Ví dụ: `02/09`) và tổng số tiết. Khi tính toán tuần kết thúc, hệ thống đơn thuần lấy Ngày bắt đầu + Tổng số tuần học. 
**Lỗi phát sinh:** Cách tính này không tính đến "khoảng trống" của các **Tuần thi tập trung** (Giữa kỳ / Cuối kỳ). Hậu quả là khi sinh viên chuyển trang sang tuần thi, thời khóa biểu vẫn hiển thị lịch học bình thường dù thực tế toàn trường được nghỉ học.

## 2. Giải pháp (Solution)
**Chiến thuật:** 
- Thay vì thay đổi logic tính ngày kết thúc phức tạp ở core, ta áp dụng cơ chế **Dynamic Rendering Filter** (Bộ lọc hiển thị động) ngay tại UI (file `VisualSchedule.tsx`).
- Tận dụng chính dữ liệu `Lịch Thi` mà user đã crawl được từ Portal. Nếu tuần hiện tại đang xem có bất kỳ ngày nào trùng với ngày thi của sinh viên, hệ thống sẽ tự động xác định đó là "Tuần thi" -> Ẩn toàn bộ lịch học và hiện thông báo nghỉ học.

## 3. Chi tiết thay đổi Code (Implementation)

Toàn bộ các thay đổi được thực hiện trong file `src/pages/visualSchedule/VisualSchedule.tsx`:

### Bước 1: Import dữ liệu lịch thi
Khai báo sử dụng hook `useStudentDb` để kéo danh sách lịch thi (exams) ra:
```tsx
import { useStudentDb } from '../../hooks/useStudentDb';
```

### Bước 2: Bóc tách danh sách ngày thi (Exam Dates)
Trong component `VisualSchedule`, ta tạo một mảng chứa TẤT CẢ các ngày thi của sinh viên.
```tsx
  const { exams } = useStudentDb();

  // Tạo mảng dẹt chứa toàn bộ các ngày thi (Giữa kỳ + Cuối kỳ) dưới dạng đối tượng Date
  const allExamDates = React.useMemo(() => {
    if (!exams || typeof exams !== 'object') return [];
    const dates: Date[] = [];
    Object.values(exams).forEach((semesterExams: any) => {
      const addDate = (item: any) => {
        let formattedDate = item.date || '';
        if (formattedDate.includes('/')) {
          const parts = formattedDate.split('/');
          if (parts.length === 3) {
            const d = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
            if (!isNaN(d.getTime())) dates.push(d);
          }
        }
      };
      if (semesterExams.midterm) semesterExams.midterm.forEach(addDate);
      if (semesterExams.final) semesterExams.final.forEach(addDate);
    });
    return dates;
  }, [exams]);
```

### Bước 3: Áp dụng bộ lọc vào `displaySessions`
Khi component đang lặp qua danh sách lịch học để quyết định môn nào sẽ hiển thị, ta chèn thêm một bước kiểm tra: "Tuần lễ từ `currentWeekStart` đến `currentWeekEnd` có chứa bất kỳ `ExamDate` nào không?"
```tsx
  const displaySessions = schedule.sessions.filter(session => {
    if (!semesterStartDate || !session.startDateParsed || !session.endDateParsed) return true;

    const currentWeekStart = new Date(semesterStartDate);
    currentWeekStart.setDate(currentWeekStart.getDate() + (currentWeek - 1) * 7);
    currentWeekStart.setHours(0, 0, 0, 0); // Reset giờ để so sánh chính xác

    const currentWeekEnd = new Date(currentWeekStart);
    currentWeekEnd.setDate(currentWeekEnd.getDate() + 6);
    currentWeekEnd.setHours(23, 59, 59, 999);

    // KIỂM TRA: Nếu ngày thi rơi vào trong tuần đang xem -> Ẩn môn học
    const isExamWeek = allExamDates.some(d => d >= currentWeekStart && d <= currentWeekEnd);
    if (isExamWeek) {
      return false; // Trả về false để loại môn học khỏi thời khoá biểu tuần này
    }

    if (currentWeekStart > session.endDateParsed || currentWeekEnd < session.startDateParsed) {
      return false;
    }
    return true;
  });
```

### Bước 4: Hiển thị thông báo thân thiện (Alert Banner)
Khi đã ẩn hết lịch học, thay vì để màn hình trống trơn giống như "Lỗi data", ta chèn thêm một banner thông báo màu vàng rất trực quan.
```tsx
        {/* Thông báo tuần thi */}
        {displaySchedule.sessions.length === 0 && totalFilteredCourses === 0 && schedule.sessions.length > 0 && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3 shadow-sm">
            <span className="text-xl">🎓</span>
            <div>
              <h3 className="text-sm font-semibold text-amber-800">Tuần thi tập trung</h3>
              <p className="text-xs text-amber-700 mt-1">Tuần này là tuần thi nên bạn không có lịch học. Chúc bạn ôn thi thật tốt và đạt kết quả cao nhé!</p>
            </div>
          </div>
        )}
```

---
**Kết quả:** Thời khoá biểu giờ đã cực kỳ thông minh, biết "lắng nghe" lịch thi của người dùng để tự động dọn dẹp lịch học.
