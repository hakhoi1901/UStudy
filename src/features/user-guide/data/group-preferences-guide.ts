import type { UserGuide } from '../types';

export const GROUP_PREFERENCES_GUIDE: UserGuide = {
  id: 'group-preferences',
  version: 1,
  title: 'Cẩm nang Cấu hình nhóm',
  shortTitle: 'Ưu tiên chi tiết',
  description: 'Khám phá cách sử dụng linh hoạt chiến thuật xếp lịch, giới hạn người học chung, và áp dụng ngoại lệ cho từng thành viên.',
  category: 'study',
  estimatedMinutes: 5,
  route: '/study-roadmap/calendar',
  prerequisite: 'configured',
  sections: [
    {
      id: 'advanced-tactics',
      title: 'Hiểu về cấu hình nâng cao',
      blocks: [
        { type: 'paragraph', text: 'Khu vực này cho phép bạn tác động sâu vào thuật toán xếp lịch để đáp ứng những nhu cầu khắt khe nhất của nhóm.' },
        { type: 'list', items: ['Ưu tiên lịch học dàn trải hay dồn ép.', 'Chọn ngày nghỉ chung cho cả nhóm.', 'Chỉ định chính xác lớp nào được phép học, lớp nào cấm.', 'Ép các thành viên học chung một lớp hoặc tách nhỏ thành các nhóm con.'] },
      ],
    },
    {
      id: 'tradeoffs',
      title: 'Ràng buộc chéo (Cực kỳ quan trọng)',
      blocks: [
        { type: 'notice', tone: 'warning', title: 'Cẩn thận với ràng buộc quá chặt', text: 'Nếu bạn cấu hình "Bắt buộc học cùng 1 lớp", nhưng lại thiết lập Cấm lớp đó đối với 1 người duy nhất, thuật toán sẽ không thể xếp lớp đó cho toàn nhóm.' },
      ],
    },
  ],
  steps: [
    { id: 'prefs-intro', route: '/study-roadmap/calendar', target: '[data-guide="group-general-prefs"]', title: 'Tổng quan ưu tiên chung', content: 'Khu vực này thiết lập các điều kiện cơ bản nhất cho cả nhóm: Bạn thích học Sáng hay Chiều hơn?', beforeAction: 'show-group-preferences', placement: 'top' },
    { id: 'prefs-strategy', route: '/study-roadmap/calendar', target: '[data-guide="group-prefs-strategy"]', title: 'Chiến thuật thời gian', content: 'Dồn lịch: Cố gắng gom các môn vào ít ngày nhất có thể. Trải đều: Rải các môn ra nhiều ngày để giảm tải học tập. Bạn cũng có thể yêu cầu thuật toán hạn chế tiết trống.', beforeAction: 'show-group-preferences', placement: 'bottom' },
    { id: 'prefs-days-off', route: '/study-roadmap/calendar', target: '[data-guide="group-prefs-days-off"]', title: 'Ngày nghỉ chung', content: 'Khác với lịch bận cá nhân, nếu bạn chọn ngày nghỉ ở đây, thuật toán sẽ CẤM xếp bất cứ môn nào vào ngày đó cho toàn bộ nhóm. Hãy click nhiều lần để đổi giữa Nghỉ cả ngày / Nghỉ sáng / Nghỉ chiều.', beforeAction: 'show-group-preferences', placement: 'top' },
    { id: 'prefs-class-intro', route: '/study-roadmap/calendar', target: '[data-guide="group-class-preference"]', title: 'Ưu tiên cấp độ lớp', content: 'Để bắt đầu thiết lập cấm hay bắt buộc một lớp cụ thể nào đó (ví dụ để né giảng viên khó), hãy xem khu vực này.', beforeAction: 'show-group-preferences', placement: 'top' },
    { id: 'prefs-class-toggle', route: '/study-roadmap/calendar', target: '[data-guide="group-class-preference-toggle"]', title: 'Mở rộng lớp học', content: 'Bấm vào "Chọn lớp ưu tiên" để hiển thị toàn bộ danh sách các lớp mở của môn này.', beforeAction: 'show-group-preferences', placement: 'top' },
    { id: 'prefs-class-target', route: '/study-roadmap/calendar', target: '[data-guide="group-class-preference-target"]', title: 'Phạm vi áp dụng', content: 'Dropdown "Áp dụng cho" quyết định người bị ảnh hưởng. Nếu chọn "Toàn nhóm", luật áp dụng chung. Nhưng nếu chọn riêng "Thành viên A", lệnh Cấm lớp X sẽ chỉ ảnh hưởng A, các bạn khác vẫn có thể học lớp đó!', beforeAction: 'expand-group-class-preference', placement: 'bottom' },
    { id: 'prefs-class-actions', route: '/study-roadmap/calendar', target: '[data-guide="group-class-preference-actions"]', title: 'Tác vụ cấm/ưu tiên', content: 'Với mỗi lớp, bạn có thể chọn "Cấm" (tuyệt đối không xếp), "Ưu tiên" (cố gắng xếp nếu có thể), hoặc "Bắt buộc" (phải có lớp này mới chịu).', beforeAction: 'expand-group-class-preference', placement: 'left' },
    { id: 'prefs-sharing-modes', route: '/study-roadmap/calendar', target: '[data-guide="group-course-sharing-modes"]', title: 'Chiến lược học chung', content: 'Mặc định thuật toán có thể xếp mọi người vào các lớp ngẫu nhiên (Ai cũng được). Nếu chọn "Bắt buộc cùng lớp", thuật toán ép toàn bộ thành viên đang đăng ký môn này phải vào chung 1 lớp!', beforeAction: 'show-group-preferences', placement: 'top' },
    { id: 'prefs-sharing-split', route: '/study-roadmap/calendar', target: '[data-guide="group-course-sharing-split"]', title: 'Tách nhóm nhỏ', content: 'Nhưng nếu nhóm có 4 người, bạn muốn 2 người học lớp này, 2 người học lớp kia thì sao? Hãy chọn chế độ "Chia nhóm"!', beforeAction: 'show-group-preferences', placement: 'bottom' },
    { id: 'prefs-sharing-dnd', route: '/study-roadmap/calendar', target: '[data-guide="group-course-sharing-dnd"]', title: 'Kéo thả thành viên', content: 'Khi chế độ chia nhóm bật lên, bạn có thể dễ dàng kéo thả để phân bổ từng người vào các nhóm nhỏ khác nhau, hoặc cho học riêng lẻ.', beforeAction: 'enable-course-sharing-split', placement: 'top' },
    { id: 'prefs-interdependent', route: '/study-roadmap/calendar', target: '[data-guide="group-course-sharing"]', title: 'Xung đột lợi ích', content: 'Lưu ý: Hai khu vực Cấm Lớp và Học Chung ràng buộc lẫn nhau! Nếu bạn bắt buộc "Cùng 1 lớp" nhưng lại Cấm lớp đó với 1 cá nhân, toàn nhóm sẽ mất đi lựa chọn đó. Hãy để ý cảnh báo màu vàng nhé.', beforeAction: 'show-group-preferences', placement: 'left' },
  ],
};
