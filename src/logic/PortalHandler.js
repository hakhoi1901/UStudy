import { getBookmarkletHref, PORTAL_URL } from './Config.js'; 

// Các hàm Export ra ngoài
export async function setupBookmarklet() {
    const btn = document.getElementById('bookmark-btn');
    
    if (btn) {
        // Hiển thị trạng thái đang tải (Optional)
        btn.innerText = "⏳ Đang tạo Bookmarklet...";
        btn.style.opacity = "0.5";

        // Gọi hàm lấy code từ Config.js
        const href = await getBookmarkletHref();
        
        // Gán vào nút
        btn.setAttribute('href', href);
        
        // Khôi phục trạng thái
        btn.innerText = "Bookmark";
        btn.style.opacity = "1";
        
        // Chặn click chuột trái (vì bookmarklet phải kéo thả)
        btn.onclick = (e) => {
            e.preventDefault();
            alert("Đừng bấm! Hãy KÉO nút này thả lên thanh dấu trang (Bookmark Bar) của trình duyệt.");
        };
    }
}

export function openPortal() {
    const statusEl = document.getElementById('status-area');
    if (statusEl) {
        statusEl.style.display = 'block';
        statusEl.className = 'status-msg'; // Reset class
        statusEl.innerText = "Đang kết nối... Vui lòng thao tác trên Portal.";
    }
    // Mở trang portal login
    window.open(PORTAL_URL, 'PortalWindow');
}

window.openPortal = openPortal;
window.setupBookmarklet = setupBookmarklet;