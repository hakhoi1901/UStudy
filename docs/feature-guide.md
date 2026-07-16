# Hướng dẫn Chức năng UStudy

Tài liệu này mô tả các màn hình và tab hiện có trong UStudy theo góc nhìn người dùng. Phần lớn dữ liệu hiển thị được lấy từ dữ liệu sinh viên đã nhập bằng bookmarklet hoặc thiết lập ban đầu.

Tài liệu kỹ thuật về các key, cấu trúc dữ liệu và cơ chế mã hóa trong trình duyệt nằm tại [Cấu trúc lưu trữ cục bộ](./local-storage-schema.md).

## Điều kiện sử dụng

Trước khi dùng các chức năng học tập, hãy vào **Cài đặt** để chọn chương trình đào tạo và nhập dữ liệu sinh viên. Khi chưa có dữ liệu, những màn hình cần bảng điểm, học phần hoặc lịch sẽ hiển thị trạng thái hướng dẫn thay vì dữ liệu giả định.

## Menu Chính

### Tổng quan (`/dashboard`)

Trang nhìn nhanh tình hình học tập và tài chính hiện tại.

- Xem điểm trung bình, tín chỉ tích lũy và tiến độ hoàn thành chương trình.
- Xem phân bổ tín chỉ theo nhóm học phần.
- Xem lịch học trong ngày.
- Xem tóm tắt học phí và hạn thanh toán của học kỳ đang chọn.

### Lộ trình học tập (`/study-roadmap/*`)

Đây là khu vực lập kế hoạch học tập và xếp thời khóa biểu. Menu chính dẫn thẳng đến tab **Chọn môn & Học phí**; các tab bên trong dùng URL riêng nên có thể mở lại trực tiếp.

#### Kế hoạch học tập (`/study-roadmap/study-plan`)

Lập và theo dõi kế hoạch học theo từng học kỳ.

- Xem các học kỳ từ dữ liệu đã nhập, bao gồm môn đã hoàn thành và môn đã đăng ký.
- Tạo thêm học kỳ dự kiến, thêm hoặc bỏ môn trong học kỳ dự kiến.
- Theo dõi tín chỉ theo học kỳ, tiến độ tích lũy và tiến độ theo từng nhóm yêu cầu của chương trình đào tạo.
- Phân biệt trạng thái môn đã hoàn thành, đang học/từ dữ liệu đăng ký và môn dự kiến.
- Mở rộng hoặc thu gọn các nhóm môn; trạng thái giao diện này được lưu cục bộ cho lần mở sau.
- Xuất danh sách môn trong kế hoạch dưới dạng TXT, CSV hoặc XLSX.
- Đặt lại phần kế hoạch do người dùng tạo. Dữ liệu học tập đã nhập không bị xem như môn dự kiến để xóa bằng thao tác này.

#### Chọn môn & Học phí (`/study-roadmap/selection`)

Chọn học phần cho một phương án thời khóa biểu cá nhân.

- Tìm môn theo mã hoặc tên.
- Chuyển giữa danh sách toàn bộ môn và danh sách được gợi ý.
- Thêm hoặc bỏ môn bằng giỏ môn học.
- Xem điều kiện tiên quyết của môn từ sơ đồ quan hệ.
- Chọn/lọc lớp học phần được phép cho từng môn trước khi xếp lịch.
- Dùng giỏ môn học để chuyển sang tab **Xếp lịch & Lịch dự kiến** và chạy xếp lịch.
- Trên điện thoại, giỏ môn học mở dưới dạng ngăn kéo để dành diện tích cho danh sách môn.

#### Xếp lịch & Lịch dự kiến (`/study-roadmap/calendar`)

Tạo, so sánh và lưu các phương án lịch học.

**Chế độ lịch cá nhân**

- Chạy thuật toán xếp lịch từ các môn trong giỏ.
- Đặt ưu tiên như buổi học, chiến lược chọn lịch, tránh khoảng trống và ngày/buổi nghỉ.
- Xem các phương án, phát hiện xung đột, xem thống kê lịch và chuyển giữa các phương án.
- Lưu phương án lịch với tên gợi nhớ; mở lại hoặc xóa lịch đã lưu.

**Chế độ xếp lịch nhóm**

Luồng này nằm trong cùng tab lịch và có ba bước:

1. **Thêm thành viên**: đặt biệt danh, thêm môn của từng người, dùng link nhóm khi cần và quản lý roster thành viên.
2. **Ưu tiên**: đặt ưu tiên chung của nhóm, các thời gian nghỉ và lớp học phần cấm/ưu tiên/bắt buộc cho môn chung.
3. **Kết quả**: xem các phương án theo lịch tổng quát, theo môn hoặc theo thành viên; chọn phương án, lưu lịch nhóm và mở lại lịch đã lưu.

Môn trùng giữa thành viên được ưu tiên xếp cùng lớp. Cần tối thiểu hai thành viên để chạy xếp lịch nhóm.

### Quản lý điểm (`/grades`)

Theo dõi điểm và thử các kịch bản cải thiện GPA.

- Xem GPA theo học kỳ và GPA tích lũy.
- Xem lịch sử điểm và các môn cần học lại.
- Dùng công cụ mô phỏng GPA cho học kỳ tiếp theo hoặc tình huống học lại.
- Xuất bảng điểm theo mẫu dưới dạng PDF, Word hoặc Excel.

### Lịch thi (`/exam-schedule`)

Theo dõi các lịch thi lấy từ dữ liệu học tập.

- Xem các môn sắp thi và tiến độ kỳ thi.
- Lọc danh sách theo tất cả, giữa kỳ hoặc cuối kỳ.
- Xem ngày giờ, phòng thi, hình thức thi và các lưu ý liên quan khi dữ liệu có sẵn.

## Tài Chính

### Học phí (`/tuition`)

Quản lý thông tin học phí theo học kỳ.

- Xem tổng quan các khoản học phí và trạng thái thanh toán.
- Xem chi tiết từng khoản/đợt khi dữ liệu có sẵn.
- Xuất hóa đơn học phí.

## Công Cụ

### Thời khóa biểu (`/schedule`)

Xem thời khóa biểu đã chốt cho học kỳ.

- Hiển thị lịch trực quan theo ngày và tiết.
- Xem thông tin lớp học phần và lịch học liên quan.
- Quản lý lịch nghỉ chung và lịch nghỉ tự nhập theo ngày, phạm vi môn và tùy chọn bù lịch. Xem [hướng dẫn quản lý lịch nghỉ](holiday-management.md).
- Xuất thời khóa biểu.

### Cài đặt (`/settings`)

Thiết lập dữ liệu và các tùy chọn cá nhân.

- Chọn hoặc cập nhật khoa, ngành, khóa tuyển và năm học.
- Nhập/cập nhật dữ liệu bằng bookmarklet.
- Báo lỗi hoặc gửi phản hồi.
- Đổi mã PIN và khóa ứng dụng ngay.

### Bảo mật & Quyền (`/privacy`)

Quản lý việc lưu trữ và bảo vệ dữ liệu cục bộ.

- Xem giải thích về dữ liệu được lưu và quyền riêng tư.
- Quản lý dữ liệu ứng dụng trên thiết bị.
- Kiểm tra hoặc điều chỉnh các lựa chọn bảo mật có sẵn.

## Dữ liệu Và Lưu Trữ

- Dữ liệu học tập nhập từ Portal được xử lý và lưu cục bộ trên thiết bị.
- Các lựa chọn giao diện và dữ liệu thao tác như giỏ môn, ưu tiên xếp lịch, lịch đã lưu, tab đang mở hoặc nhóm môn thu gọn cũng được lưu cục bộ để khôi phục ở lần dùng sau.
- Không nên coi dữ liệu dự kiến là dữ liệu kết quả học tập chính thức; môn hiện tại chưa có điểm vẫn giữ trạng thái đang học.
