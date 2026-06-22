# Lich su thay doi Bookmarklet

## v0.1.1

- Tách cấu hình mặc định cho 2 nhóm dữ liệu
  `Lớp mở` dùng `CLASS_TARGET_YEAR`, `CLASS_TARGET_SEM`;
  `Kết quả ĐKHP` dùng `REG_TARGET_YEAR`, `REG_TARGET_SEM`.
- `BookmarkletButton.tsx` đã thêm 4 key config mới vào bookmarklet thay vi dùng chung với `TARGET_YEAR` và `TARGET_SEM`.
- `Bookmarklet.js` đã bỏ hardcore năm/học kỳ với popup
- `Lop mo` lấy default từ `CONFIG.CLASS_TARGET_YEAR`, `CONFIG.CLASS_TARGET_SEM`.
- `Ket qua DKHP` lầy default từ `CONFIG.REG_TARGET_YEAR`, `CONFIG.REG_TARGET_SEM`.
- Có fallback ngược:
  nếu không có config riêng thì bookmarklet vẫn dùng `CONFIG.TARGET_YEAR` và `CONFIG.TARGET_SEM`.
- Sửa default fallback trong `Bookmarklet.js` tu `TARGET_SEM = "1"` thành `TARGET_SEM = "2"` để đồng bộ với config app hiện tại
