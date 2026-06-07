# 🚀 Gợi ý Nâng cấp UStudy

Dựa trên phân tích kỹ toàn bộ codebase, dưới đây là các gợi ý được phân loại theo **độ ưu tiên** và **mức độ khó**.

---

## 🔴 Ưu tiên cao — Quick Wins (1-3 ngày/feature)

### 1. Dashboard đang quá "trống" — Cần thêm biểu đồ & insight

**Hiện tại**: Dashboard chỉ có 3 cards tĩnh (GPA, tín chỉ, học phí). Dự án đã cài `recharts` nhưng Dashboard **không hề dùng**.

**Gợi ý**:

| Widget mới | Mô tả |
|------------|-------|
| 📈 **Biểu đồ GPA theo học kỳ** | Line chart hiển thị xu hướng GPA qua các kỳ. Data đã có sẵn (`gpaPerSemester` từ `useStudentGradeData`) |
| 📊 **Phân bổ tín chỉ theo danh mục** | Pie/Donut chart: bao nhiêu TC đại cương, chuyên ngành, tự chọn. Data có sẵn trong `categories` |
| 📅 **Lịch hôm nay** | Mini schedule: "Hôm nay bạn có 3 tiết, môn X lúc 7:30 phòng Y" |
| 🎯 **Tiến độ tốt nghiệp** | Progress ring: Đã hoàn thành bao nhiêu % CTĐT |
| ⏰ **Hạn đóng học phí** | Đang hardcode `tuitionDueDate = 'NaN'` ở `DashboardWidgets.tsx:14` → Cần lấy từ `useTuitionCalculator` |

```
Effort: ★★☆☆☆ (data đã có, chỉ cần thêm UI)
Impact: ★★★★★ (Dashboard là trang đầu tiên user thấy)
```

---

### 2. Dark Mode — Dependency đã cài nhưng chưa dùng

**Hiện tại**: `next-themes` có trong `package.json` nhưng không có logic toggle nào trong app. Toàn bộ UI hardcode light theme.

**Gợi ý**:
- Thêm `ThemeProvider` từ `next-themes` wrap quanh app
- Thêm nút toggle Dark/Light ở Header hoặc Settings
- Dùng CSS variables + Tailwind `dark:` prefix

```
Effort: ★★☆☆☆
Impact: ★★★★☆ (sinh viên hay code đêm → dark mode rất được yêu thích)
```

---

### 3. PWA — Offline-first đúng nghĩa

**Hiện tại**: App đã là client-side pure, data lưu localStorage → thiếu một bước nhỏ để thành PWA.

**Gợi ý**:
- Thêm `manifest.json` + Service Worker (Vite PWA plugin)
- Cho phép "Install to Home Screen"
- Offline access hoàn chỉnh (app + data đã mã hóa)

```
Effort: ★★☆☆☆ (vite-plugin-pwa gần như plug-and-play)
Impact: ★★★★☆ (user mở nhanh hơn, không cần internet)
```

---

### 4. Export dữ liệu đa dạng hơn

**Hiện tại**: TKB xuất `.ics`, Học phí xuất `.txt`

**Gợi ý**:

| Feature | Format |
|---------|--------|
| Bảng điểm | PDF (dùng `jsPDF`) hoặc Excel |
| Học phí | PDF hóa đơn đẹp |
| TKB | Ảnh PNG (dùng `html-to-image`) để share nhanh qua Zalo/Messenger |

```
Effort: ★★☆☆☆
Impact: ★★★☆☆
```

---

## 🟡 Ưu tiên trung bình — Feature nâng tầm (3-7 ngày)

### 5. So sánh TKB trực quan hơn

**Hiện tại**: Genetic Solver trả về top K options, nhưng UI chỉ list ra → user phải tưởng tượng sự khác biệt.

**Gợi ý**:
- **Side-by-side compare**: Hiển thị 2 TKB cạnh nhau, highlight ô khác biệt
- **Score breakdown**: Hiển thị tại sao option A tốt hơn B (ít xung đột, ít buổi trống...)
- **Swipe carousel**: Vuốt qua lại giữa các option TKB

```
Effort: ★★★☆☆
Impact: ★★★★☆
```

---

### 6. Notification thông minh hơn

**Hiện tại**: Chỉ có toast notification đơn giản (import thành công, GPA thấp).

**Gợi ý**:
- ⏰ **Nhắc lịch học**: "Còn 30 phút nữa là tiết 1 - Toán cao cấp tại phòng E301"
- 💰 **Nhắc học phí**: "Còn 3 ngày nữa là hết hạn đóng học phí!"
- 📊 **GPA insight**: "Nếu kỳ này đạt GPA 8.0, GPA tích lũy sẽ tăng lên 7.85"
- Dùng **Web Notifications API** (browser push) hoặc đặt lịch nhắc local

```
Effort: ★★★☆☆
Impact: ★★★★☆
```

---

### 7. Sơ đồ tiên quyết dạng Interactive Graph

**Hiện tại**: `PrerequisiteFlowchart` đã có nhưng bị comment out trong navigation.

**Gợi ý**:
- Dùng thư viện graph visualization (ví dụ `reactflow` hoặc `d3-dag`) để vẽ **dependency tree** đẹp
- Tô màu node: xanh = đã học, vàng = đang học, đỏ = chặn, xám = chưa mở
- Click node → xem chi tiết + môn nào đang bị block bởi nó
- Giúp sinh viên **nhìn rõ con đường tốt nghiệp** thay vì đọc list dài

```
Effort: ★★★★☆
Impact: ★★★★★ (differentiator so với Portal gốc)
```

---

### 8. Data Backup & Sync

**Hiện tại**: Dữ liệu nằm trên 1 trình duyệt duy nhất. Clear cache = mất hết.

**Gợi ý (không cần backend)**:
- **Export/Import backup file**: Xuất toàn bộ encrypted data thành file `.ustudy` → Import lại trên browser khác
- **Google Drive sync** (optional): Dùng Google Drive API (client-side) để sync file backup lên cloud
- **QR Code transfer**: Sinh QR code chứa encrypted data → quét trên thiết bị khác

```
Effort: ★★★☆☆ (export/import file rất đơn giản)
Impact: ★★★★☆ (giải quyết nỗi sợ mất data)
```

---

### 9. Hỗ trợ đa Khoa/Ngành tốt hơn

**Hiện tại**: `DepartmentContext` có hỗ trợ chọn Khoa/Ngành nhưng data chỉ có sẵn cho `khoa-cntt/cong-nghe-thong-tin/k24`. Chọn khoa khác → empty state.

**Gợi ý**:
- Tạo **công cụ tự động generate data** từ CTĐT PDF/Portal
- Hoặc cho phép **cộng đồng đóng góp** data (đã có `DocumentContributionModal`)
- Hiển thị hướng dẫn rõ ràng khi chọn Khoa chưa có data

```
Effort: ★★★★☆
Impact: ★★★★★ (mở rộng user base ra toàn trường)
```

---

## 🟢 Ưu tiên dài hạn — Game Changers (1-2 tuần+)

### 10. 🤖 AI Chatbot — "Trợ lý học tập"

**Gợi ý**:
- Tích hợp **Gemini API** (client-side hoặc qua Cloudflare Worker)
- Chatbot trả lời: "Kỳ sau nên học gì?", "GPA cần bao nhiêu để lên Giỏi?", "Tôi thiếu mấy tín chỉ tự chọn?"
- Feed context = student data (grades, credits, prerequisites) → Gemini phân tích
- **Personality**: "Anh/chị mentor đại học" — nghiêm túc nhưng gần gũi

```
Effort: ★★★★★
Impact: ★★★★★ (tạo differentiator rất lớn)
```

---

### 11. 📱 Responsive / Mobile Support

**Hiện tại**: Block hoàn toàn mobile (check userAgent + screen width ở `App.tsx`). Nhưng sinh viên hay dùng điện thoại.

**Gợi ý phân kỳ**:
1. **Phase 1**: Cho phép xem Dashboard + TKB trên mobile (read-only, đơn giản hóa layout)
2. **Phase 2**: Drawer sidebar + responsive table
3. **Phase 3**: Full mobile experience

```
Effort: ★★★★★
Impact: ★★★★★
```

---

### 12. Onboarding UX tốt hơn

**Hiện tại**: User mới vào → không biết làm gì. Phải tự biết kéo Bookmarklet.

**Gợi ý**:
- **Guided tour** (dùng thư viện như `react-joyride`): Step-by-step hướng dẫn user
- **Video tutorial** embed ngay trong app
- **Demo mode**: Cho phép dùng thử với data mẫu mà không cần đăng nhập Portal
- **Animated onboarding**: Khi chưa có data → thay vì `NoDataCard` trống, hiện hướng dẫn sinh động

```
Effort: ★★★☆☆
Impact: ★★★★☆ (giảm tỷ lệ bounce)
```

---

## 🔧 Technical Debt — Cải thiện Code Quality

### 13. Chuyển sang React Router

**Hiện tại**: State-based routing (`currentPage === 'dashboard'`). Không có URL, không back/forward, không deep link.

**Gợi ý**:
- Dùng `react-router-dom` v6
- URL sạch: `/dashboard`, `/grades`, `/courses/selection`
- Hỗ trợ browser back/forward
- Deep link: share link trực tiếp đến trang cụ thể

```
Effort: ★★★☆☆
Impact: ★★★☆☆
```

---

### 14. Cải thiện Genetic Algorithm Performance

**Hiện tại**: GA chạy trên main thread → có thể block UI khi dataset lớn.

**Gợi ý**:
- Chuyển `GeneticSolver` sang **Web Worker** (đã có `useScheduleSolver` hook → dễ wrap)
- Thêm **progress indicator**: "Đang tìm kiếm... 50/100 thế hệ"
- Cho phép **cancel** giữa chừng
- Adaptive population size dựa trên số môn

```
Effort: ★★★☆☆
Impact: ★★★☆☆
```

---

### 15. Testing

**Hiện tại**: Không có unit test nào.

**Gợi ý**: Vì logic layer đã tách biệt khỏi React → rất dễ test!

| File cần test | Lý do |
|---------------|-------|
| `GPACalculator.ts` | Logic tính GPA critical — sai là ảnh hưởng toàn bộ |
| `FinancialLogic.ts` | Tính tiền phải chính xác |
| `AcademicRulesEngine.ts` | Quy chế phức tạp, nhiều edge case |
| `Recommender.ts` | Logic đệ quy tìm prerequisite chains |
| `GeneticSolver.ts` | Đảm bảo solver không degenerate |

Dùng **Vitest** (đi kèm Vite, zero config).

```
Effort: ★★★☆☆
Impact: ★★★★☆ (confidence khi refactor)
```

---

## 📊 Ma trận ưu tiên

```
                    Impact cao
                        │
         ┌──────────────┼──────────────┐
         │  ❶ Dashboard  │  ⑩ AI Chat  │
         │  ❷ Dark Mode  │  ⑪ Mobile   │
         │  ⑫ Onboarding │  ❼ Graph    │
    Easy ├───────────────┼─────────────┤ Hard
         │  ❹ Export     │  ⑬ Router   │
         │  ❸ PWA       │  ⑭ Worker   │
         │              │  ⑮ Testing   │
         └──────────────┼──────────────┘
                        │
                    Impact thấp
```

---

## 🎯 Lộ trình gợi ý

### Sprint 1 (tuần 1-2): Quick Wins
- ❶ Dashboard charts + ❷ Dark Mode + ❸ PWA
- **Lý do**: Impact cao, data đã sẵn sàng, effort thấp.

### Sprint 2 (tuần 3-4): UX Improvement
- ⑫ Onboarding + ❽ Data Backup + ❻ Notifications
- **Lý do**: Cải thiện UX, giữ chân user.

### Sprint 3 (tuần 5-8): Core Features
- ❼ Prerequisite Graph + ❺ TKB Compare + ⑮ Testing
- **Lý do**: Feature đặc trưng + technical foundation.

### Sprint 4+ (dài hạn): Game Changers
- ⑩ AI Chatbot + ⑪ Mobile + ❾ Đa Khoa/Ngành
- **Lý do**: Tạo differentiator, mở rộng user base.

---

*Tài liệu được tạo tự động bởi AI Assistant — 05/05/2026*
