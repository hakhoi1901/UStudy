# Hướng dẫn cập nhật bản đồ khuôn viên

## Các tệp liên quan

| Tệp | Vai trò |
| --- | --- |
| `src/features/campus-map/campus-data.ts` | Nguồn dữ liệu tòa nhà, tầng, phòng và toàn bộ bản vẽ tầng. Đây là nơi chỉnh sửa chính. |
| `src/features/campus-map/campusmap.tsx` | Giao diện bản đồ khuôn viên và chọn tòa nhà. |
| `src/features/campus-map/FloorPlanView.tsx` | Component dùng chung để hiển thị sơ đồ tầng. Không tạo layout riêng cho từng tòa trong tệp này. |

## Cách hoạt động của sơ đồ tầng

Mỗi tầng có thể có một trường `plan` độc lập. `plan` là một canvas SVG với kích thước và danh sách thành phần riêng, vì vậy mỗi tòa có thể có hành lang, cầu thang và phòng khác nhau.

Giao diện không tự tạo hành lang, lưới phòng hoặc sơ đồ mẫu. Nếu một tầng chưa có `plan`, trang chỉ hiển thị trạng thái chưa thiết kế.

```ts
{
  number: 1,
  rooms: [],
  plan: {
    width: 900,
    height: 600,
    elements: [
      {
        id: 'vien-ngoai',
        type: 'path',
        d: 'M40 40 H860 V560 H40 Z',
        fill: '#FFFFFF',
        stroke: '#64748B',
        strokeWidth: 3,
      },
      {
        id: 'hanh-lang',
        type: 'area',
        x: 80,
        y: 260,
        width: 740,
        height: 70,
        label: 'Hành lang',
        fill: '#F1F5F9',
      },
      {
        id: 'a101',
        type: 'room',
        code: 'A101',
        label: 'Phòng học 101',
        aliases: ['Phòng 101'],
        x: 90,
        y: 90,
        width: 180,
        height: 130,
      },
      {
        id: 'thang-bo',
        type: 'label',
        x: 750,
        y: 160,
        text: 'Thang bộ',
        size: 15,
      },
    ],
  },
}
```

## Các thành phần có thể vẽ

- `room`: Phòng hình chữ nhật. Bắt buộc có `code`; có thể thêm `label`, `aliases`, `roomType` và `fill`.
- `area`: Khu vực hình chữ nhật có nhãn, phù hợp cho hành lang, sảnh thang máy, nhà vệ sinh hoặc khu chờ.
- `path`: Đường SVG tùy ý, dùng khi cần vẽ tường, cầu thang, phòng méo, mũi tên hoặc hình không phải hình chữ nhật.
- `label`: Chữ tự do tại đúng tọa độ SVG.

Thứ tự trong `elements` cũng là thứ tự vẽ. Nên đặt nền, viền hoặc tường ở trước; phòng và nhãn đặt sau để chúng hiển thị phía trên.

## Vẽ hành lang và đường đi

### Hành lang bao quanh một khu vực

Dùng `path` với một hình ngoài và một hình trong. `fillRule: 'evenodd'` khiến hình trong trở thành phần rỗng, tạo thành hành lang bao quanh. Đặt phần tử này trước các phòng để phòng được vẽ phía trên hành lang.

```ts
{
  id: 'hanh-lang-quanh-san',
  type: 'path',
  // Hình ngoài 700 x 400, chừa rỗng một khối giữa 520 x 220.
  d: 'M100 100 H800 V500 H100 Z M190 190 H710 V410 H190 Z',
  fill: '#E2E8F0',
  fillRule: 'evenodd',
  stroke: '#CBD5E1',
  strokeWidth: 2,
}
```

Sau đó vẽ phòng hoặc khu vực vào phần rỗng ở giữa, ví dụ `x: 190`, `y: 190`, `width: 520`, `height: 220`.

### Đường đi dạng nét

Dùng `path` mở, không có `fill`, rồi tăng `strokeWidth`. Cách này phù hợp để chỉ lối đi ngoài trời, lối thoát hoặc đường nối giữa các khu.

```ts
{
  id: 'loi-di-chinh',
  type: 'path',
  d: 'M90 520 H360 V430 H690',
  fill: 'none',
  stroke: '#CBD5E1',
  strokeWidth: 28,
}
```

Tọa độ trong `d` dùng cùng hệ với `plan.width` và `plan.height`. Có thể dùng một công cụ vẽ SVG để lấy chuỗi `d`, sau đó dán vào đây.

## Phòng học và tìm kiếm

Có hai cách khai báo phòng:

1. Thêm vào `floors[].rooms` nếu mới có dữ liệu phòng nhưng chưa có bản vẽ.
2. Thêm phần tử `type: 'room'` trong `plan.elements` nếu phòng đã có vị trí trên sơ đồ.

Phòng được vẽ trong `plan` tự động tham gia tìm kiếm. Không cần khai báo lại cùng mã phòng trong `rooms`, trừ khi cần dữ liệu bổ sung.

`label` là tên hiển thị của phòng. `aliases` là các tên gọi khác để tìm kiếm và không được hiển thị thành phòng riêng.

## Tọa độ bản đồ khuôn viên

Tọa độ các tòa trên bản đồ tổng dùng hệ `viewBox="0 0 760 560"` trong `campusmap.tsx`. Chỉnh `x`, `y`, `width`, `height` và `rotate` của tòa tương ứng trong `CAMPUS_BUILDINGS`; không ghi cứng thông tin tòa trong JSX SVG.

## Kiểm tra sau khi chỉnh sửa

Sau khi cập nhật dữ liệu hoặc UI, chạy:

```powershell
npx tsc --noEmit
npm run build
```
