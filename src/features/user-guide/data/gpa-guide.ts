import type { UserGuide } from '../types';

export const GPA_GUIDE: UserGuide = {
  id: 'gpa',
  version: 1,
  title: 'Dự đoán và lập mục tiêu GPA',
  shortTitle: 'Kế hoạch GPA',
  description: 'Phân biệt điểm dự đoán với điểm mục tiêu và hiểu cách UStudy phân bổ điểm.',
  category: 'study',
  estimatedMinutes: 6,
  route: '/grades',
  prerequisite: 'student-data',
  sections: [
    {
      id: 'modes',
      title: 'Hai chế độ độc lập',
      blocks: [
        { type: 'list', items: ['Dự đoán: nhập điểm bạn nghĩ mình có thể đạt để xem GPA kỳ và GPA tích lũy.', 'Mục tiêu: nhập GPA mong muốn để UStudy gợi ý điểm cần đạt cho các môn chưa biết điểm.'] },
        { type: 'notice', tone: 'info', title: 'Đồng bộ một chiều', text: 'Điểm thay đổi ở Dự đoán được chuyển mềm sang Mục tiêu. Thay đổi trong Mục tiêu không ghi ngược về Dự đoán.' },
      ],
    },
    {
      id: 'scope',
      title: 'Chọn đúng phạm vi',
      blocks: [
        { type: 'paragraph', text: 'Toàn khóa dùng toàn bộ tín chỉ tích lũy; Cơ sở ngành chỉ dùng nhóm môn tương ứng; Kỳ này chỉ tính các môn trong học kỳ đang chọn.' },
        { type: 'notice', tone: 'warning', title: 'Môn đã có điểm trong kỳ', text: 'Điểm chính thức được khóa và đưa vào phép tính. UStudy chỉ phân bổ lại các môn chưa có điểm hoặc chưa được sửa thủ công.' },
      ],
    },
    {
      id: 'courses',
      title: 'Điểm môn và điểm thành phần',
      blocks: [
        { type: 'paragraph', text: 'Bạn có thể nhập trực tiếp điểm môn, mở chi tiết để tính từ điểm thành phần và thêm môn cải thiện khi cần mô phỏng việc học lại.' },
        { type: 'list', items: ['Điểm đã nhập thủ công được giữ nguyên khi phân bổ lại.', 'Môn cải thiện chỉ tạo tác động trong mô phỏng.', 'Giới hạn GPA tối đa giúp nhận biết mục tiêu không khả thi.'] },
      ],
    },
  ],
  steps: [
    { id: 'grade-tabs', route: '/grades', target: '[data-guide="grade-main-tabs"]', title: 'Mở Kế hoạch GPA', content: 'Quản lý điểm gồm Tổng quan, Kế hoạch GPA và Lịch sử điểm. Tour đã chuyển sẵn sang đúng tab.', beforeAction: 'show-gpa-plan', placement: 'bottom' },
    { id: 'planning-modes', route: '/grades', target: '[data-guide="gpa-planning-modes"]', title: 'Dự đoán hoặc Mục tiêu', content: 'Hai chế độ dùng hai bộ giá trị độc lập. Hãy chọn theo câu hỏi bạn muốn trả lời.', beforeAction: 'show-gpa-plan', placement: 'bottom' },
    { id: 'target-settings', route: '/grades', target: '[data-guide="gpa-target-settings"]', title: 'Mục tiêu và phạm vi tính', content: 'Nhập GPA mục tiêu, chọn phạm vi rồi yêu cầu UStudy phân bổ điểm khi dùng chế độ Mục tiêu.', beforeAction: 'show-gpa-plan', placement: 'top' },
    { id: 'course-table', route: '/grades', target: '[data-guide="gpa-course-table"]', title: 'Điểm từng môn', content: 'Điểm chính thức được khóa. Các môn còn lại cho phép nhập dự đoán hoặc chỉnh gợi ý mục tiêu.', beforeAction: 'show-gpa-plan', placement: 'top' },
    { id: 'retake', route: '/grades', target: '[data-guide="gpa-retake"]', title: 'Môn cải thiện', content: 'Thêm môn đã học để mô phỏng tác động của lần học cải thiện lên GPA trong phạm vi đang chọn.', beforeAction: 'show-gpa-plan', placement: 'top' },
  ],
};
