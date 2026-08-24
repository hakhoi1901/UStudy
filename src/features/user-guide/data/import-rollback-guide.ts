import type { UserGuide } from '../types';

export const IMPORT_ROLLBACK_GUIDE: UserGuide = {
  id: 'import-rollback',
  version: 1,
  title: 'Lịch sử nhập và hoàn tác dữ liệu',
  shortTitle: 'Hoàn tác dữ liệu',
  description: 'Xem snapshot gần nhất và khôi phục toàn bộ hoặc từng nhóm nguồn dữ liệu.',
  category: 'data',
  estimatedMinutes: 4,
  route: '/settings',
  prerequisite: 'import-history',
  sections: [
    {
      id: 'history',
      title: 'Mỗi dòng là một lần nhập hoàn chỉnh',
      blocks: [
        { type: 'paragraph', text: 'Lịch sử ghi thời gian, phương thức nhập, nguồn liên quan và số bản ghi thêm, cập nhật, xóa hoặc bỏ qua.' },
        { type: 'list', items: ['Đổi tên bản sao lưu để dễ nhận biết.', 'Mở từng nguồn để xem lịch sử riêng.', 'Snapshot hoàn tác gần nhất chứa trạng thái trước lần nhập.'] },
      ],
    },
    {
      id: 'partial',
      title: 'Hoàn tác một phần',
      blocks: [
        { type: 'paragraph', text: 'Chỉ chọn những nguồn cần khôi phục, ví dụ Bảng điểm nhưng giữ nguyên Lịch thi và Lớp mở vừa cập nhật.' },
      ],
    },
    {
      id: 'full',
      title: 'Hoàn tác toàn bộ',
      blocks: [
        { type: 'paragraph', text: 'Khôi phục tất cả nguồn có trong snapshot về trạng thái trước lần import gần nhất.' },
        { type: 'notice', tone: 'warning', title: 'Chỉ snapshot gần nhất', text: 'Hoàn tác không phải lịch sử phiên bản vô hạn. Hãy kiểm tra tên, thời gian và các nguồn trước khi xác nhận.' },
      ],
    },
  ],
  steps: [
    { id: 'center', route: '/settings', target: '[data-guide="data-source-center"]', title: 'Mở Trung tâm dữ liệu', content: 'Trung tâm dữ liệu gom trạng thái nguồn và lịch sử nhập vào cùng một nơi.', beforeAction: 'open-data-center', placement: 'top' },
    { id: 'history', route: '/settings', target: '[data-guide="import-history"]', title: 'Lịch sử cập nhật chung', content: 'Mỗi dòng cho biết lần nhập đã tác động bao nhiêu bản ghi ở những nguồn nào.', beforeAction: 'open-data-center', placement: 'top' },
    { id: 'undo-actions', route: '/settings', target: '[data-guide="import-undo-actions"]', title: 'Chọn phạm vi hoàn tác', content: 'Hoàn tác một phần cho phép chọn nguồn; hoàn tác toàn bộ khôi phục tất cả dữ liệu trong snapshot.', beforeAction: 'open-data-center', placement: 'left' },
  ],
};
