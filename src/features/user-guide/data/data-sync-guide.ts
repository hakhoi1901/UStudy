import type { UserGuide } from '../types';

export const DATA_SYNC_GUIDE: UserGuide = {
  id: 'data-sync',
  version: 1,
  title: 'Đồng bộ dữ liệu từ HCMUS Portal',
  shortTitle: 'Đồng bộ dữ liệu',
  description: 'Chọn phương thức phù hợp, xem trước thay đổi và kiểm tra dữ liệu sau khi nhập.',
  category: 'getting-started',
  estimatedMinutes: 4,
  route: '/settings',
  prerequisite: 'configured',
  sections: [
    {
      id: 'methods',
      title: 'Chọn phương thức đồng bộ',
      blocks: [
        { type: 'paragraph', text: 'Extension phù hợp khi dùng máy tính thường xuyên; Bookmarklet là phương án thủ công nhẹ; file JSON dùng để chuyển dữ liệu giữa thiết bị hoặc khôi phục bản sao.' },
        { type: 'list', items: ['Extension: nhận diện Portal và có thể đồng bộ nhiều nguồn trong một phiên.', 'Bookmarklet: kéo lên thanh dấu trang rồi chạy khi đang mở Portal.', 'JSON: xuất từ thiết bị đã có dữ liệu và nhập trên thiết bị còn lại.'] },
        { type: 'notice', tone: 'info', title: 'Dữ liệu nằm trên thiết bị', text: 'UStudy xử lý dữ liệu trong trình duyệt hoặc ứng dụng. Hãy kiểm tra màn hình xem trước trước khi xác nhận nhập.' },
      ],
    },
    {
      id: 'preview',
      title: 'Xem trước thay đổi',
      blocks: [
        { type: 'paragraph', text: 'Gói dữ liệu được chia theo Bảng điểm, Đăng ký học phần, Lịch thi, Lớp mở và Học phí. Bạn có thể chọn cả nhóm hoặc từng bản ghi.' },
        { type: 'list', items: ['Thêm mới: bản ghi chưa có trên thiết bị.', 'Cập nhật: cùng bản ghi nhưng nội dung đã đổi.', 'Xóa: bản ghi từng có nhưng không còn trong snapshot mới.', 'Bỏ qua: bản ghi trùng hoặc không thay đổi.'] },
      ],
    },
    {
      id: 'verify',
      title: 'Kiểm tra sau khi nhập',
      blocks: [
        { type: 'paragraph', text: 'Mở Trung tâm dữ liệu để xem nguồn nào đã có dữ liệu, học kỳ được nhận diện, thời gian cập nhật và lịch sử từng lần nhập.' },
        { type: 'notice', tone: 'warning', title: 'Đừng nhập lặp khi chưa cần', text: 'Nếu dữ liệu không đổi, UStudy sẽ đánh dấu là bỏ qua. Khi có sai sót, dùng lịch sử nhập để hoàn tác thay vì nhập thêm một gói khác.' },
      ],
    },
  ],
  steps: [
    { id: 'sync-tools', route: '/settings', target: '[data-guide="settings-sync-tools"]', title: 'Công cụ đồng bộ dữ liệu', content: 'Ba phương thức đồng bộ được đặt cùng một khu vực để bạn chọn theo thiết bị và thói quen sử dụng.', placement: 'bottom' },
    { id: 'portal-tools', route: '/settings', target: '[data-guide="portal-sync-tools"]', title: 'Extension hoặc Bookmarklet', content: 'Mở Portal, đăng nhập rồi dùng Extension hoặc kéo Bookmarklet để lấy dữ liệu thủ công.', placement: 'bottom' },
    { id: 'file-import', route: '/settings', target: '[data-guide="file-import"]', title: 'Nhập và xuất file', content: 'Dùng JSON khi cần chuyển dữ liệu sang thiết bị khác hoặc khôi phục một bản sao đã xuất.', placement: 'top' },
    { id: 'optical-transfer', route: '/settings', target: '[data-guide="optical-transfer"]', title: 'Truyền trực tiếp bằng màn hình', content: 'Máy tính có thể gửi và điện thoại có thể nhận dữ liệu bằng mã hiển thị mà không cần gửi file qua ứng dụng khác.', placement: 'top' },
    { id: 'data-center', route: '/settings', target: '[data-guide="data-source-center"]', title: 'Kiểm tra dữ liệu đã nhận', content: 'Trung tâm dữ liệu cho biết nguồn nào đã có, nguồn nào cũ và lần nhập gần nhất.', beforeAction: 'open-data-center', placement: 'top' },
  ],
};
