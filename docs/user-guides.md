# Hệ thống hướng dẫn sử dụng UStudy

Hệ thống hướng dẫn gồm hai lớp dùng chung một nguồn dữ liệu:

1. **Trang tài liệu** tại `/guide` và `/guide/:guideId` để người dùng đọc toàn bộ nội dung theo nhu cầu.
2. **Tour tương tác** để tự mở đúng trang, làm nổi bật đúng control và lưu bước đang xem.

Không viết nội dung hướng dẫn trực tiếp trong page nghiệp vụ. Mỗi hướng dẫn phải được khai báo trong `src/features/user-guide/data/` rồi đăng ký tại `guide-registry.ts`.

## 1. Các hướng dẫn hiện có

| ID | Route | Nội dung |
| --- | --- | --- |
| `data-sync` | `/guide/data-sync` | Extension, Bookmarklet, JSON, truyền trực tiếp và Trung tâm dữ liệu |
| `study-plan` | `/guide/study-plan` | Chọn môn, giỏ môn và phân bổ theo học kỳ |
| `gpa` | `/guide/gpa` | Mục tiêu GPA, phạm vi tính, điểm dự kiến và môn cải thiện |
| `personal-scheduling` | `/guide/personal-scheduling` | Xếp lịch cá nhân và duyệt phương án |
| `group-scheduling` | `/guide/group-scheduling` | Thành viên, ưu tiên nhóm và kết quả xếp lịch |
| `import-rollback` | `/guide/import-rollback` | Lịch sử nhập, hoàn tác một phần và hoàn tác toàn bộ |

Route `/guide` được phép mở trước khi hoàn thành thiết lập lần đầu. Nội dung tĩnh vẫn đọc được; tour nghiệp vụ sẽ giải thích điều kiện còn thiếu trước khi chạy.

## 2. Cấu trúc thư mục

```text
src/features/user-guide/
  components/
    GuideLauncher.tsx       Nút mở tour dùng lại trong feature
    GuideTooltip.tsx        Giao diện tooltip UStudy
    GuideTour.tsx           Adapter react-joyride, desktop popover/mobile sheet
  context/
    GuideProvider.tsx       Điều phối route, step, progress và lỗi target
    guide-context.ts        Contract context
  data/                     Nội dung từng hướng dẫn
  hooks/
    use-guide-action.ts     Đăng ký hành động mở tab/panel trước một step
  services/
    guide-analytics.ts      Event Vercel Analytics không chứa dữ liệu sinh viên
    guide-availability.ts   Kiểm tra điều kiện chạy guide/step
    guide-demo.ts           Bộ dữ liệu mẫu tạm thời cho tour thực hành
    guide-storage.ts        Đọc, chuẩn hóa và cập nhật tiến độ
  guide-registry.ts         Registry duy nhất
  types.ts                  Schema và ID type-safe

src/pages/guide/GuidePage.tsx
  Trang danh mục và trang chi tiết
```

## 3. Khai báo một hướng dẫn mới

### Bước 1: thêm ID và type cần thiết

Thêm ID vào `GUIDE_IDS` trong `types.ts`. Nếu guide cần tự mở một tab hoặc panel, thêm `GuideActionId`. Nếu cần dữ liệu đầu vào mới, thêm `GuidePrerequisite` và cài điều kiện tương ứng trong `guide-availability.ts`.

### Bước 2: tạo file data

```ts
import type { UserGuide } from '../types';

export const exampleGuide: UserGuide = {
  id: 'example',
  version: 1,
  title: 'Tên đầy đủ',
  shortTitle: 'Tên ngắn',
  description: 'Kết quả người dùng đạt được sau hướng dẫn.',
  category: 'study',
  estimatedMinutes: 3,
  route: '/guide/example',
  prerequisite: 'configured',
  sections: [
    {
      id: 'overview',
      title: 'Nội dung cần biết',
      blocks: [
        { type: 'paragraph', text: 'Mô tả ngắn, trực tiếp.' },
        { type: 'list', items: ['Bước thứ nhất', 'Bước thứ hai'] },
        { type: 'notice', tone: 'warning', title: 'Lưu ý', text: 'Điều dễ nhầm.' },
      ],
    },
  ],
  steps: [
    {
      id: 'example-control',
      route: '/example-route',
      target: '[data-guide="example-control"]',
      title: 'Tên control',
      content: 'Giải thích một thao tác và kết quả của thao tác đó.',
      placement: 'bottom-start',
    },
  ],
};
```

Sau đó export file trong `data/index.ts` nếu có và thêm guide vào `USER_GUIDES` trong `guide-registry.ts`. Test registry sẽ bắt ID trùng, route trùng, step trùng và target không hợp lệ.

## 4. Gắn target vào giao diện

Dùng thuộc tính ổn định, có ý nghĩa theo chức năng:

```tsx
<section data-guide="example-control">...</section>
```

Không dùng class Tailwind, `nth-child`, text hiển thị hay ID được sinh ngẫu nhiên làm selector. Target nên nằm trên container còn tồn tại khi dữ liệu rỗng để tour không thất bại chỉ vì người dùng chưa có kết quả.

Quy tắc đặt tên:

- Dùng kebab-case: `gpa-course-table`, `group-preferences`.
- Một target chỉ đại diện cho một vùng chức năng.
- Có thể đặt target trên cùng element với style hiện tại; không cần thêm wrapper chỉ để chạy tour.
- Không làm thay đổi kích thước hoặc bố cục khi target được spotlight.

## 5. Mở tab hoặc panel trước khi tới step

Nếu target chỉ xuất hiện sau khi người dùng chọn tab, feature đăng ký action:

```tsx
useGuideAction('show-example-panel', () => {
  setActiveTab('example');
  setIsPanelOpen(true);
});
```

Step tham chiếu action đó:

```ts
{
  id: 'example-panel',
  route: '/example-route',
  target: '[data-guide="example-panel"]',
  beforeAction: 'show-example-panel',
  title: 'Panel ví dụ',
  content: '...',
}
```

`GuideProvider` sẽ điều hướng trước, chờ feature đăng ký action, chạy action rồi mới để Joyride tìm target. Handler phải idempotent: gọi nhiều lần vẫn đưa UI về cùng trạng thái và không được tự lưu dữ liệu nghiệp vụ.

## 6. Đặt nút hướng dẫn trong feature

```tsx
<GuideLauncher guideId="gpa" source="gpa-header" />
<GuideLauncher guideId="study-plan" variant="icon" source="study-plan-toolbar" />
<GuideLauncher guideId="import-rollback" variant="text" />
```

Các variant:

- `button`: nút viền có nhãn trên desktop, “Trợ giúp” trên mobile.
- `icon`: nút icon nhỏ, bắt buộc có tooltip và `aria-label` từ component.
- `text`: action chữ trong vùng phụ trợ.

Launcher tự đổi thành “Tiếp tục hướng dẫn” nếu còn một phiên cùng version chưa hoàn thành.

## 7. Điều kiện và hành vi khi thiếu dữ liệu

Điều kiện cấp guide chặn tour ngay từ đầu. Điều kiện cấp step chỉ bỏ qua step không phù hợp với thiết bị hoặc trạng thái hiện tại.

Các điều kiện đang dùng:

| Điều kiện | Ý nghĩa |
| --- | --- |
| `configured` | Đã chọn khóa, khoa và ngành |
| `student-data` | Có dữ liệu sinh viên đã nhập |
| `selected-courses` | Giỏ môn có ít nhất một môn |
| `group-members` | Nhóm đã có thành viên |
| `group-result` | Đã có kết quả xếp lịch nhóm |
| `import-history` | Có lịch sử nhập để hoàn tác |

Khi guide bị chặn, dialog phải nói rõ điều kiện còn thiếu và đưa người dùng đến hướng dẫn nền tảng phù hợp. Ở trung tâm hướng dẫn, guide phù hợp có thêm nút `Demo`: nó chạy tour với dữ liệu mẫu để người dùng mới vẫn thấy được giao diện thật.

### Dữ liệu mẫu cho guide

`guide-demo.ts` tạo một phiên demo có điểm đã chấm/chưa chấm, lớp mở, giỏ môn và thành viên nhóm. Phiên này dùng `beginTransientStorageSession()`:

- Dữ liệu chỉ nằm trong RAM; không ghi đè `localStorage`, kể cả các key mã hóa như `student_db_full`.
- Các thao tác UI trong demo chỉ cập nhật overlay của các key đã khai báo trong `GUIDE_DEMO_MANAGED_KEYS`.
- Thoát hoặc hoàn thành tour sẽ hủy overlay và trả app về đúng dữ liệu thật. Refresh hoặc đóng tab cũng tự xóa demo vì overlay không được lưu.
- Không mock kết quả solver. Người dùng có thể bấm xếp lịch trong demo để thấy kết quả do thuật toán thật tạo ra.

Khi thêm một feature có thể ghi state trong demo, phải thêm key của nó vào `GUIDE_DEMO_MANAGED_KEYS` trước. Không dùng `localStorage.setItem()` trực tiếp cho state nghiệp vụ mới; hãy đi qua `savePlain`/`saveToStorage` để overlay chặn đúng lúc.

Khi target không xuất hiện sau thời gian chờ, người dùng được chọn thử lại, bỏ qua bước hoặc kết thúc. Đây là lỗi phục hồi được, không được làm crash page nghiệp vụ.

## 8. Lưu tiến độ và version nội dung

Tiến độ được lưu plain JSON qua `savePlain` với key:

```text
ustudy_user_guide_progress_v1
```

Schema:

```ts
interface UserGuideProgress {
  schemaVersion: 1;
  guides: {
    [guideId]?: {
      guideVersion: number;
      status: 'in-progress' | 'completed' | 'dismissed';
      lastStepId: string | null;
      startedAt: string;
      updatedAt: string;
      completedAt: string | null;
    };
  };
}
```

`schemaVersion` là phiên bản định dạng lưu trữ. `guideVersion` là phiên bản nội dung của riêng từng hướng dẫn.

Tăng `guideVersion` khi:

- workflow hoặc thứ tự thao tác thay đổi đáng kể;
- target cũ không còn tương ứng với UI;
- có bước quan trọng mới mà người đã hoàn thành cần được giới thiệu lại.

Không tăng version khi chỉ sửa chính tả, khoảng cách hoặc màu sắc. Khi version tăng, trạng thái cũ không được dùng để resume.

## 9. Analytics và quyền riêng tư

Các event gồm mở, bắt đầu, xem bước, hoàn thành, bỏ qua, bị chặn và thiếu target. Payload chỉ chứa:

- `guideId`;
- `guideVersion`;
- `stepId` hoặc số thứ tự khi cần;
- `source` của launcher.

Không gửi tên, MSSV, mã môn, điểm, lịch học, nội dung import hoặc giá trị localStorage lên analytics.

## 10. Giao diện responsive và accessibility

- Desktop dùng popover cạnh target; mobile dùng bottom sheet cố định phía dưới.
- Nội dung dài cuộn bên trong tooltip, không đẩy cả trang.
- Nút đóng có tên truy cập “Thoát hướng dẫn”.
- Các action dùng `button`, route dùng `Link` và tooltip dùng `role="alertdialog"`.
- Mọi bước đều có nút bỏ qua; target không tồn tại không khóa người dùng trong tour.
- Text hướng dẫn mô tả hành động và kết quả, không mô tả màu sắc hoặc vị trí đơn thuần.

## 11. Kiểm thử bắt buộc

### Unit test

- Registry không có ID/route/step trùng.
- Progress lỗi hoặc schema cũ được normalize an toàn.
- Start, resume, complete, dismiss và reset lưu đúng.
- Mỗi prerequisite trả về đúng trạng thái và hướng dẫn đề xuất.
- Analytics không làm hỏng tour nếu SDK ném lỗi.

### E2E

- `/guide` mở được trước khi thiết lập.
- Tour điều hướng sang đúng feature.
- Target thật được tìm thấy trên desktop và mobile.
- Tooltip có thể đóng và không để overlay chặn UI.

Chạy:

```powershell
npm run typecheck:test
npm run test:unit
npm run test:coverage
npm run test:e2e
npm run build
```

## 12. Checklist review một guide mới

1. Nội dung tĩnh đủ để hiểu mà không cần chạy tour.
2. Mỗi step chỉ giải thích một quyết định hoặc thao tác.
3. Route, target và action đã được kiểm tra ở cả desktop/mobile.
4. Target vẫn tồn tại ở empty, loading và result state cần thiết.
5. Guide không tự ghi hoặc thay đổi dữ liệu nghiệp vụ.
6. Có prerequisite thay vì giả định người dùng đã có dữ liệu.
7. `guideVersion` được chọn đúng với mức thay đổi.
8. Unit test và E2E đã cập nhật.
9. Analytics không chứa dữ liệu học tập hay định danh.
10. Link hoặc launcher xuất hiện tại nơi người dùng dễ mắc kẹt nhất.
