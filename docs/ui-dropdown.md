# Dropdown UI dùng chung

Tài liệu này mô tả bộ style cho dropdown tự dựng của UStudy. Bộ style nằm trong `src/index.css` và component dùng lại là `AppSelect` tại `src/components/ui/form/app-select.tsx`.

Mục tiêu là giữ tất cả dropdown cùng màu sắc, khoảng cách và trạng thái chọn, nhưng vẫn cho từng vị trí điều chỉnh kích thước mà không phải chép lại chuỗi Tailwind dài.

## Các class có sẵn

| Class | Dùng cho | Style chính |
| --- | --- | --- |
| `ustudy-dropdown-trigger` | Nút/ô đang hiển thị lựa chọn hiện tại | Nền xám rất nhạt, viền xám, padding, hover |
| `ustudy-dropdown-trigger-open` | Thêm vào trigger khi menu đang mở | Viền xanh thương hiệu và focus ring |
| `ustudy-dropdown-menu` | Danh sách nổi bên dưới trigger | `absolute`, `z-10`, nền trắng, shadow, cao tối đa và scrollbar ẩn |
| `ustudy-dropdown-option` | Mỗi lựa chọn trong danh sách | Padding, cỡ chữ, hover nền xám |
| `ustudy-dropdown-option-active` | Lựa chọn đang được chọn | Nền `#004A98`, chữ trắng, font medium |

Ví dụ khi tự tạo dropdown:

```tsx
<div className="relative">
  <button className="ustudy-dropdown-trigger">
    Công nghệ Thông tin
    <ChevronDown className="h-4 w-4" />
  </button>

  <div className="ustudy-dropdown-menu">
    <button className="ustudy-dropdown-option ustudy-dropdown-option-active">
      Công nghệ Thông tin
    </button>
    <button className="ustudy-dropdown-option">
      Kỹ thuật phần mềm
    </button>
  </div>
</div>
```

`ustudy-dropdown-menu` chỉ phù hợp với menu được đặt trong wrapper `relative`. Nếu menu phải nổi trên modal hoặc panel có `overflow: hidden`, hãy dùng portal hoặc component Radix Select thay vì ép `z-index`.

## Điều chỉnh kích thước

Các class có kích thước mặc định giống dropdown Khoa/Ngành/Khóa hiện tại. Có thể thay đổi riêng cho một dropdown bằng CSS variables đặt tại wrapper gần nhất.

| CSS variable | Mặc định | Ý nghĩa |
| --- | --- | --- |
| `--ustudy-dropdown-trigger-px` | `1rem` | Padding trái/phải của ô đang chọn |
| `--ustudy-dropdown-trigger-py` | `0.625rem` | Padding trên/dưới của ô đang chọn |
| `--ustudy-dropdown-trigger-gap` | `0.75rem` | Khoảng cách giữa nhãn và icon |
| `--ustudy-dropdown-trigger-font-size` | `0.875rem` | Cỡ chữ của ô đang chọn |
| `--ustudy-dropdown-option-px` | `1rem` | Padding trái/phải của từng lựa chọn |
| `--ustudy-dropdown-option-py` | `0.625rem` | Padding trên/dưới của từng lựa chọn |
| `--ustudy-dropdown-option-font-size` | `0.875rem` | Cỡ chữ của từng lựa chọn |
| `--ustudy-dropdown-menu-max-height` | `15rem` | Chiều cao tối đa của danh sách |

### Dropdown compact trong toolbar

```tsx
<div
  className="
    [--ustudy-dropdown-trigger-px:0.75rem]
    [--ustudy-dropdown-trigger-py:0.5rem]
    [--ustudy-dropdown-trigger-font-size:0.75rem]
    [--ustudy-dropdown-option-px:0.75rem]
    [--ustudy-dropdown-option-py:0.5rem]
    [--ustudy-dropdown-option-font-size:0.75rem]
    [--ustudy-dropdown-menu-max-height:12rem]
  "
>
  {/* dropdown */}
</div>
```

### Dropdown lớn trong form

```tsx
<div
  className="
    [--ustudy-dropdown-trigger-px:1.25rem]
    [--ustudy-dropdown-trigger-py:0.75rem]
    [--ustudy-dropdown-trigger-font-size:1rem]
    [--ustudy-dropdown-option-px:1.25rem]
    [--ustudy-dropdown-option-py:0.75rem]
    [--ustudy-dropdown-option-font-size:1rem]
    [--ustudy-dropdown-menu-max-height:20rem]
  "
>
  {/* dropdown */}
</div>
```

## Dùng với `AppSelect`

`AppSelect` đã nhận các prop để chỉnh đúng từng phần, ngoài việc đặt CSS variables ở `className` của wrapper:

```tsx
import { AppSelect } from '@/components/ui/form';

<AppSelect
  label="Khóa tuyển"
  value={cohortId}
  options={cohorts}
  onChange={setCohortId}
  className="[--ustudy-dropdown-menu-max-height:18rem]"
  triggerClassName="min-w-52"
  menuClassName="min-w-64"
  optionClassName="whitespace-normal"
/>
```

| Prop | Phần được thêm class |
| --- | --- |
| `className` | Wrapper `relative`, nên dùng để đặt CSS variables chung |
| `triggerClassName` | Ô đang chọn |
| `menuClassName` | Danh sách nổi |
| `optionClassName` | Mọi lựa chọn trong danh sách |

## Quy ước sử dụng

1. Dùng `ustudy-dropdown-trigger`, `ustudy-dropdown-menu` và `ustudy-dropdown-option` cùng nhau; không chỉ lấy riêng class menu rồi tự dựng item theo một style khác.
2. Khi chỉ khác padding, font size hoặc chiều cao, ưu tiên CSS variables thay vì tạo class mới trong `index.css`.
3. Dùng `triggerClassName`, `menuClassName`, `optionClassName` khi cần layout riêng như `min-w-*`, `whitespace-normal`, vị trí (`left-0`, `right-0`) hoặc màu trạng thái đặc biệt.
4. Menu luôn phải có `z-index` đủ cao so với nội dung cùng panel. `ustudy-dropdown-menu` đã có `z-10`; chỉ tăng thêm khi thật sự cần.
5. Không thêm scrollbar nhìn thấy cho dropdown ngắn. Nếu danh sách dài, tăng `--ustudy-dropdown-menu-max-height` khi cần, scrollbar vẫn được ẩn nhưng danh sách vẫn cuộn được.
