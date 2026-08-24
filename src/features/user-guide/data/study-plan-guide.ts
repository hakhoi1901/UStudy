import type { UserGuide } from '../types';

export const STUDY_PLAN_GUIDE: UserGuide = {
  id: 'study-plan',
  version: 1,
  title: 'Lập kế hoạch học tập theo học kỳ',
  shortTitle: 'Kế hoạch học tập',
  description: 'Đọc tiến độ chương trình, phân bổ môn và kiểm tra tiên quyết theo từng học kỳ.',
  category: 'study',
  estimatedMinutes: 5,
  route: '/study-roadmap/study-plan',
  prerequisite: 'configured',
  sections: [
    {
      id: 'workspace',
      title: 'Hai khu vực chính',
      blocks: [
        { type: 'paragraph', text: 'Danh sách môn nằm bên trái và khung học kỳ nằm bên phải trên máy tính. Trên điện thoại, dùng nút chuyển Môn học và Học kỳ.' },
        { type: 'list', items: ['Danh sách môn hiển thị tiến độ theo nhóm chương trình đào tạo.', 'Khung học kỳ chứa môn từ dữ liệu trường và các môn bạn dự kiến học.', 'Ô tìm kiếm giúp lọc nhanh theo mã hoặc tên môn.'] },
      ],
    },
    {
      id: 'planning',
      title: 'Phân bổ môn an toàn',
      blocks: [
        { type: 'paragraph', text: 'Môn đã học hoặc đang đăng ký được lấy từ dữ liệu trường và được bảo vệ. Môn dự kiến có thể được thêm, di chuyển hoặc xóa khỏi kế hoạch.' },
        { type: 'notice', tone: 'warning', title: 'Kiểm tra tiên quyết', text: 'Cảnh báo tiên quyết xuất hiện khi môn điều kiện chưa nằm ở một học kỳ trước đó hoặc chưa được hoàn thành.' },
      ],
    },
    {
      id: 'manage',
      title: 'Quản lý khung học kỳ',
      blocks: [
        { type: 'list', items: ['Chọn năm để giảm số học kỳ phải nhìn cùng lúc.', 'Thêm học kỳ hoặc năm học từ menu công cụ.', 'Xem bản trực quan trước khi xuất danh sách môn.', 'Đặt lại chỉ khi muốn xóa phần kế hoạch thủ công.'] },
      ],
    },
  ],
  steps: [
    { id: 'roadmap-tabs', route: '/study-roadmap/study-plan', target: '[data-guide="study-roadmap-tabs"]', title: 'Các khu vực của Lộ trình học tập', content: 'Bạn đang ở Kế hoạch học tập. Hai tab còn lại dùng để chọn môn, tính học phí và tạo lịch dự kiến.', placement: 'bottom' },
    { id: 'mobile-switch', route: '/study-roadmap/study-plan', target: '[data-guide="study-plan-mobile-tabs"]', title: 'Chuyển giữa môn và học kỳ', content: 'Trên điện thoại, hai phần được tách thành hai chế độ để nội dung không bị ép hẹp.', device: 'mobile', placement: 'bottom' },
    { id: 'course-list', route: '/study-roadmap/study-plan', target: '[data-guide="study-plan-course-list"]', title: 'Danh sách môn theo chương trình', content: 'Tìm môn, mở từng nhóm và xem trạng thái, tín chỉ cùng môn tiên quyết.', placement: 'right' },
    { id: 'semesters', route: '/study-roadmap/study-plan', target: '[data-guide="study-plan-semesters"]', title: 'Khung học kỳ', content: 'Môn từ dữ liệu trường được giữ cố định; môn dự kiến có thể được sắp xếp lại giữa các học kỳ.', placement: 'left' },
    { id: 'semester-actions', route: '/study-roadmap/study-plan', target: '[data-guide="study-plan-actions"]', title: 'Công cụ kế hoạch', content: 'Tại đây bạn có thể xem trực quan, thêm học kỳ hoặc năm, xuất danh sách môn và đặt lại kế hoạch.', placement: 'bottom' },
  ],
};
