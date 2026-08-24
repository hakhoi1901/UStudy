import type { UserGuide } from '../types';

export const PERSONAL_SCHEDULING_GUIDE: UserGuide = {
  id: 'personal-scheduling',
  version: 1,
  title: 'Xếp lịch cá nhân',
  shortTitle: 'Xếp lịch cá nhân',
  description: 'Chọn môn, lọc lớp, khóa lựa chọn và tạo các phương án không trùng lịch.',
  category: 'study',
  estimatedMinutes: 6,
  route: '/study-roadmap/selection',
  prerequisite: 'configured',
  sections: [
    {
      id: 'sources',
      title: 'Hai nguồn môn trên lịch',
      blocks: [
        { type: 'paragraph', text: 'Môn trường đã đăng ký là lịch nền cố định. Môn bạn chọn từ danh sách lớp mở được xếp thêm và luôn phải tránh phần lịch nền đó.' },
        { type: 'notice', tone: 'info', title: 'Không thêm trùng môn', text: 'Môn đã có trong kết quả đăng ký học phần không cần chọn lại từ danh sách lớp mở.' },
      ],
    },
    {
      id: 'classes',
      title: 'Lọc và khóa lớp',
      blocks: [
        { type: 'list', items: ['Bỏ dấu tích để loại một lớp khỏi tập lựa chọn.', 'Nhấn thẻ lớp để khóa lớp đó làm lựa chọn bắt buộc.', 'Mở cấu hình để chọn ngày nghỉ, buổi học và chiến lược dồn lịch.'] },
      ],
    },
    {
      id: 'result',
      title: 'Đọc và lưu kết quả',
      blocks: [
        { type: 'paragraph', text: 'Các phương án được sắp theo mức phù hợp với cấu hình. Chuyển qua từng phương án, nhấn lớp trên lịch để xem chi tiết rồi lưu phương án phù hợp.' },
      ],
    },
  ],
  steps: [
    { id: 'course-selection', route: '/study-roadmap/selection', target: '[data-guide="course-selection-list"]', title: 'Chọn môn cần xếp thêm', content: 'Tìm môn trong chương trình và thêm vào giỏ. Môn Portal đã đăng ký được nhận diện để tránh chọn trùng.', placement: 'right' },
    { id: 'selection-basket', route: '/study-roadmap/selection', target: '[data-guide="selection-basket"]', title: 'Giỏ môn và học phí', content: 'Kiểm tra tín chỉ, học phí tham khảo và lớp được phép dùng trước khi chuyển sang xếp lịch.', device: 'desktop', placement: 'left' },
    { id: 'schedule-mode', route: '/study-roadmap/calendar', target: '[data-guide="schedule-mode"]', title: 'Chế độ Cá nhân', content: 'Thanh này chuyển giữa xếp lịch cá nhân và nhóm. Tour đã chọn Cá nhân cho bạn.', beforeAction: 'show-personal-schedule', placement: 'bottom' },
    { id: 'builder-toolbar', route: '/study-roadmap/calendar', target: '[data-guide="schedule-builder-toolbar"]', title: 'Cấu hình và tạo lịch', content: 'Mở cấu hình, xem lịch đã lưu hoặc yêu cầu solver hoàn thiện toàn bộ môn còn thiếu.', beforeAction: 'show-personal-schedule', prerequisite: 'selected-courses', placement: 'bottom' },
    { id: 'builder-workspace', route: '/study-roadmap/calendar', target: '[data-guide="schedule-builder-workspace"]', title: 'Khóa lớp trực tiếp trên lịch', content: 'Chọn lớp trong panel môn, xem xung đột trên lưới và để solver hoàn thiện những môn chưa khóa.', beforeAction: 'show-personal-schedule', prerequisite: 'selected-courses', placement: 'top' },
    { id: 'schedule-options', route: '/study-roadmap/calendar', target: '[data-guide="schedule-options"]', title: 'So sánh phương án', content: 'Khi có nhiều kết quả, bộ chọn phương án xuất hiện phía trên lịch để bạn so sánh rồi lưu phương án muốn giữ lại.', beforeAction: 'show-personal-schedule', prerequisite: 'selected-courses', placement: 'bottom' },
  ],
};
