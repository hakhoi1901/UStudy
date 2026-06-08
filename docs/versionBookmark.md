# Lich su thay doi Bookmarklet

## v0.1.2

- Them hang doi concurrency gioi han trong `Bookmarklet.js`.
- Tang toc quet chi tiet `Thuc hanh` / `Bai tap` cua danh sach lop mo bang cach chay song song toi da 3 task mac dinh.
- Giu cac flow phu thuoc ViewState nhu hoc phi va DKHP chay tuan tu de tranh Portal tra sai state.
- Them tai lieu chi tiet logic vao `docs/bookmarklet_logic.md`.

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
