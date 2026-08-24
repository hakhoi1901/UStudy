import type { UserGuide } from '../types';

export const GROUP_SCHEDULING_GUIDE: UserGuide = {
  id: 'group-scheduling',
  version: 1,
  title: 'Xếp lịch nhóm',
  shortTitle: 'Xếp lịch nhóm',
  description: 'Thêm thành viên, cấu hình ưu tiên riêng và quyết định ai cần học cùng ai.',
  category: 'study',
  estimatedMinutes: 7,
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
    { id: 'member-form', route: '/study-roadmap/calendar', target: '[data-guide="group-member-form"]', title: 'Thêm từng thành viên', content: 'Nhập nickname, kiểm tra môn và chọn ngày người này không muốn học trước khi thêm vào nhóm.', beforeAction: 'show-group-members', placement: 'top' },
    { id: 'roster', route: '/study-roadmap/calendar', target: '[data-guide="group-roster"]', title: 'Danh sách thành viên', content: 'Roster cho biết mỗi người đã có bao nhiêu môn và cho phép mở lại chi tiết khi cần.', beforeAction: 'show-group-members', prerequisite: 'group-members', placement: 'left' },
    { id: 'preferences', route: '/study-roadmap/calendar', target: '[data-guide="group-preferences"]', title: 'Ưu tiên chung và theo môn', content: 'Đặt ngày tránh, lớp ưu tiên và cấu hình ai cần học cùng ai cho từng môn chung.', beforeAction: 'show-group-preferences', prerequisite: 'group-members', placement: 'top' },
    { id: 'results', route: '/study-roadmap/calendar', target: '[data-guide="group-results"]', title: 'Kết quả và giải thích', content: 'So sánh phương án, xem lịch từng thành viên, đọc đánh đổi rồi lưu toàn bộ phương án nhóm.', beforeAction: 'show-group-results', prerequisite: 'group-result', placement: 'top' },
  ],
};
