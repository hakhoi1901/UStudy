import type { UserGuide } from '../types';

export const GROUP_SCHEDULING_GUIDE: UserGuide = {
  id: 'group-scheduling',
  version: 2,
  title: 'Xếp lịch nhóm',
  shortTitle: 'Xếp lịch nhóm',
  description: 'Thêm thành viên, cấu hình ưu tiên riêng và quyết định ai cần học cùng ai.',
  category: 'study',
  estimatedMinutes: 10,
  route: '/study-roadmap/calendar',
  prerequisite: 'configured',
  sections: [
    {
      id: 'members',
      title: 'Dữ liệu của từng thành viên',
      blocks: [
        { type: 'paragraph', text: 'Mỗi thành viên có nickname, danh sách môn, lớp được phép, lớp ưu tiên và ngày không muốn học riêng.' },
        { type: 'notice', tone: 'warning', title: 'Lịch bận cá nhân', text: 'Lớp bị loại và lịch bận của một người chỉ áp dụng cho người đó, không tự động cấm cho cả nhóm.' },
      ],
    },
    {
      id: 'sharing',
      title: 'Ai cần học cùng ai',
      blocks: [
        { type: 'list', items: ['Bắt buộc cùng lớp: solver phải giữ nhóm đã chọn trong cùng một lớp.', 'Ưu tiên cùng lớp: có thể tách khi cần để tìm phương án tốt hơn.', 'Ai cũng được: mỗi người được chọn lớp độc lập.', 'Có thể chia cùng một môn thành nhiều nhóm thành viên khác nhau.'] },
      ],
    },
    {
      id: 'explanation',
      title: 'Hiểu kết quả',
      blocks: [
        { type: 'paragraph', text: 'UStudy giải thích những đánh đổi đáng chú ý, chẳng hạn phải học vào ngày tránh vì các lớp còn lại trùng môn khác hoặc không thỏa ràng buộc học chung.' },
      ],
    },
  ],
  steps: [
    { id: 'mode', route: '/study-roadmap/calendar', target: '[data-guide="schedule-mode"]', title: 'Chuyển sang xếp lịch nhóm', content: 'Chế độ nhóm dùng cùng dữ liệu lớp mở nhưng tạo lịch riêng cho từng thành viên.', beforeAction: 'show-group-schedule', placement: 'bottom' },
    { id: 'stepper', route: '/study-roadmap/calendar', target: '[data-guide="group-stepper"]', title: 'Ba bước rõ ràng', content: 'Thêm thành viên, đặt ưu tiên, sau đó xem và lưu kết quả. Có thể quay lại bước trước để chỉnh.', beforeAction: 'show-group-members', placement: 'bottom' },
    { id: 'course-basket-source', route: '/study-roadmap/calendar', target: '[data-guide="group-course-basket"]', title: 'Nguồn môn học', content: 'Danh sách môn học mặc định được lấy từ "Giỏ môn" mà bạn đã chọn trước đó. Hãy về tab Chọn môn nếu cần sửa giỏ!', beforeAction: 'show-group-members', placement: 'top' },
    { id: 'member-nickname', route: '/study-roadmap/calendar', target: '[data-guide="group-member-nickname"]', title: 'Thêm từng thành viên', content: 'Nhập nickname cho thành viên rồi nhấn Thêm. Nhớ thêm đủ mọi người vào nhóm nhé!', beforeAction: 'show-group-members', placement: 'top' },
    { id: 'member-days-off', route: '/study-roadmap/calendar', target: '[data-guide="group-member-days-off"]', title: 'Lịch bận cá nhân', content: 'Chọn ngày mà người này bận hoặc không muốn học. Việc này chỉ trừ điểm trên lịch cá nhân, không tự động cấm toàn nhóm.', beforeAction: 'show-group-members', placement: 'top' },
    { id: 'roster', route: '/study-roadmap/calendar', target: '[data-guide="group-roster"]', title: 'Danh sách thành viên', content: 'Roster cho biết mỗi người đã có bao nhiêu môn và cho phép mở lại chi tiết khi cần.', beforeAction: 'show-group-members', prerequisite: 'group-members', placement: 'left' },
    { id: 'group-general-prefs', route: '/study-roadmap/calendar', target: '[data-guide="group-general-prefs"]', title: 'Ưu tiên chung của nhóm', content: 'Bạn có thể chọn buổi học ưu tiên, chiến thuật xếp lịch và ngày nhóm muốn nghỉ ở đây. Nó áp dụng cho tất cả thành viên.', beforeAction: 'show-group-preferences', prerequisite: 'group-members', placement: 'bottom' },
    { id: 'group-class-preference', route: '/study-roadmap/calendar', target: '[data-guide="group-class-preference"]', title: 'Cấm hoặc ưu tiên lớp', content: 'Với từng môn, bạn có thể cấm hoặc bắt buộc một lớp cụ thể. Tuỳ chọn này có thể áp dụng cho toàn nhóm hoặc chỉ cho một thành viên.', beforeAction: 'show-group-preferences', prerequisite: 'group-members', placement: 'top' },
    { id: 'group-course-sharing', route: '/study-roadmap/calendar', target: '[data-guide="group-course-sharing"]', title: 'Ai học cùng ai', content: 'Nếu nhiều người cùng học một môn, bạn có thể ép họ học chung một lớp, tách ra, hoặc chia thành các nhóm nhỏ hơn.', beforeAction: 'show-group-preferences', prerequisite: 'group-members', placement: 'top' },
    { id: 'results', route: '/study-roadmap/calendar', target: '[data-guide="group-results"]', title: 'Kết quả và giải thích', content: 'So sánh các phương án khả dụng và xem cảnh báo nếu có xung đột lợi ích.', beforeAction: 'show-group-results', prerequisite: 'group-result', placement: 'top' },
    { id: 'result-comparison', route: '/study-roadmap/calendar', target: '[data-guide="group-result-comparison"]', title: 'So sánh phương án', content: 'Bảng này giúp bạn thấy rõ sự đánh đổi (trade-offs) giữa các lịch gợi ý để chọn ra phương án tốt nhất.', beforeAction: 'show-group-results', prerequisite: 'group-result', placement: 'top' },
    { id: 'save-schedule', route: '/study-roadmap/calendar', target: '[data-guide="group-save-schedule"]', title: 'Lưu lịch', content: 'Lưu lại phương án nhóm đã thống nhất. Bạn có thể đặt tên gợi nhớ cho lịch này.', beforeAction: 'show-group-results', prerequisite: 'group-result', placement: 'left' },
    { id: 'saved-schedules', route: '/study-roadmap/calendar', target: '[data-guide="group-saved-schedules"]', title: 'Xem lại lịch đã lưu', content: 'Mở danh sách các lịch nhóm đã lưu tại đây. Bạn cũng có thể xoá chúng khi không cần.', beforeAction: 'show-group-results', prerequisite: 'group-result', placement: 'bottom' },
  ],
};

