# Hướng dẫn quản lý lịch nghỉ

Trang **Thời khóa biểu** hỗ trợ hai cách khai báo lịch nghỉ:

- **Nhập trực tiếp trên giao diện**: dành cho lịch nghỉ cá nhân hoặc thay đổi tạm thời. Dữ liệu được lưu trong trình duyệt hiện tại.
- **Khai báo trong `public/holidays.json`**: dành cho lịch nghỉ chung được đóng gói cùng UStudy. Người dùng chỉ xem, không sửa hoặc xóa trên giao diện.

Hai nguồn được sắp chung theo ngày trong danh sách **Tất cả lịch nghỉ**.

## Nhập lịch nghỉ trực tiếp trên web

1. Mở tab **Thời khóa biểu** (`/schedule`).
2. Nhấn nút **Quản lý nghỉ lễ** ở góc trên của trang.
3. Dùng biểu mẫu **Thêm ngày nghỉ** ở cột trái.
4. Điền tên kỳ nghỉ, ngày bắt đầu và ngày kết thúc.
5. Chọn phạm vi áp dụng cho tất cả môn hoặc một số môn cụ thể.
6. Chọn có bù buổi đã nghỉ ở cuối lịch hay không.
7. Nhấn **Thêm ngày nghỉ**.

Ngày nghỉ vừa thêm xuất hiện ngay trong danh sách bên phải. Mục do người dùng thêm có nút chỉnh sửa và xóa; lịch nghỉ chung chỉ có thể xem.

### Ý nghĩa các trường

| Trường | Cách dùng |
| --- | --- |
| Tên kỳ nghỉ | Tên dễ nhận biết, ví dụ `Nghỉ Tết Nguyên đán` hoặc `Nghỉ riêng môn CSC101`. |
| Từ ngày | Ngày đầu tiên bắt đầu nghỉ. |
| Đến ngày | Ngày cuối cùng của kỳ nghỉ, có tính ngày này. Chọn cùng ngày bắt đầu nếu chỉ nghỉ một ngày. |
| Tất cả môn | Mọi buổi học rơi vào khoảng nghỉ đều bị ẩn. |
| Chọn môn | Chỉ những môn được đánh dấu mới chịu ảnh hưởng. |
| Bù buổi đã nghỉ ở cuối lịch | Buổi bị nghỉ không tiêu hao số tuần học và lịch của đúng buổi đó được kéo dài. |

Nếu tắt **Bù buổi đã nghỉ ở cuối lịch**, buổi trùng ngày nghỉ vẫn bị ẩn nhưng ngày kết thúc môn không được kéo dài.

Dữ liệu nhập trên giao diện được lưu trong `localStorage` với khóa `schedule_overrides`. Vì vậy dữ liệu chỉ tồn tại trên trình duyệt hoặc thiết bị đang sử dụng, trừ khi người dùng xuất và nhập lại toàn bộ dữ liệu UStudy.

## Khai báo lịch nghỉ chung bằng file

File nguồn nằm tại:

```text
public/holidays.json
```

File phải chứa một mảng JSON. Ví dụ:

```json
[
  {
    "id": "tet-nguyen-dan-2027",
    "reason": "Nghỉ Tết Nguyên đán",
    "startDate": "2027-02-05",
    "endDate": "2027-02-12",
    "affectedCourseCodes": "all",
    "makeUp": true
  },
  {
    "id": "csc101-nghi-2027-03-15",
    "reason": "Nghỉ riêng môn CSC101",
    "startDate": "2027-03-15",
    "endDate": "2027-03-15",
    "affectedCourseCodes": ["CSC101"],
    "makeUp": false
  }
]
```

### Cấu trúc một mục

| Thuộc tính | Bắt buộc | Ý nghĩa |
| --- | --- | --- |
| `id` | Có | Mã duy nhất của mục, không trùng với mục khác. |
| `reason` | Có | Tên hoặc lý do nghỉ hiển thị trên giao diện. |
| `startDate` | Có | Ngày bắt đầu theo định dạng `YYYY-MM-DD`. |
| `endDate` | Không | Ngày kết thúc. Nếu nghỉ một ngày, có thể đặt bằng `startDate`. |
| `affectedCourseCodes` | Có | Dùng `"all"` hoặc mảng mã môn như `["CSC101", "MTH101"]`. |
| `makeUp` | Không | `true` để kéo dài lịch bù buổi nghỉ; `false` để giữ nguyên ngày kết thúc. Mặc định được hiểu là `true`. |

Sau khi chỉnh file, chạy lại dev server hoặc build/deploy lại ứng dụng rồi tải lại trang Thời khóa biểu. Lịch từ file sẽ có nhãn **Lịch chung** và không có nút sửa, xóa.

## Quy tắc tính lịch

- Khoảng nghỉ được so với ngày thực tế của từng buổi học, không ẩn toàn bộ tuần.
- Môn học nhiều buổi trong một tuần chỉ nghỉ buổi thực sự rơi vào khoảng ngày đã khai báo.
- Hai mục nghỉ trùng cùng một buổi không làm lịch bị kéo dài hai lần.
- Lịch nghỉ chỉ áp dụng cho các mã môn trong `affectedCourseCodes`.
- Nên dùng `id` ổn định và tránh khai báo cùng một kỳ nghỉ ở cả file chung lẫn giao diện cá nhân.

## Xử lý khi lịch nghỉ không có tác dụng

1. Kiểm tra ngày có nằm trong thời gian môn đang học hay không.
2. Kiểm tra mã môn trong `affectedCourseCodes` có đúng với mã trên thời khóa biểu không.
3. Kiểm tra `startDate` và `endDate` có đúng định dạng `YYYY-MM-DD` không.
4. Nếu vừa sửa `public/holidays.json`, tải lại trang hoặc khởi động lại dev server.
5. Nếu nhập trên giao diện, mở lại **Quản lý nghỉ lễ** và kiểm tra mục đã xuất hiện trong **Tất cả lịch nghỉ** chưa.
