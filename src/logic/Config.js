// ================= CONFIG.JS =================
// Cấu hình hệ thống và tạo Bookmarklet
// =============================================

// CÁC URL QUAN TRỌNG
export const PORTAL_TAB_URL = {
    URL_DIEM: "/SinhVien.aspx?pid=211",
    URL_LICHTHI: "/SinhVien.aspx?pid=212",
    URL_HOCPHI: "/SinhVien.aspx?pid=331",
    URL_LOPMO: "/SinhVien.aspx?pid=327"
};

export const PORTAL_URL = 'https://new-portal1.hcmus.edu.vn/Login.aspx?ReturnUrl=%2fSinhVien.aspx%3fpid%3d211&pid=211';

// Hàm nội bộ (Private)
function createBookmarklet(sourceCode) {
    if (!sourceCode) return "";

    // Bước 1: Làm sạch comment
    let code = sourceCode
        .replace(/\/\*[\s\S]*?\*\//g, '')   // Xóa block comment
        .replace(/\/\/.*$/gm, '');          // Xóa line comment

    // Bước 2: Nén cơ bản (Xóa xuống dòng, tab, khoảng trắng thừa)
    code = code
        .replace(/\s+/g, ' ')
        .trim();

    // Bước 3: Mã hóa URI
    // Thay thế các ký tự đặc biệt để chạy được trên thanh địa chỉ
    const encodedCode = encodeURIComponent(code)
        .replace(/'/g, '%27')
        .replace(/\(/g, '%28')
        .replace(/\)/g, '%29');

    // Bước 4: Tạo prefix
    return `javascript:${encodedCode}`;
}

// Các hàm Export ra ngoài
export async function getBookmarkletHref() {
    try {
        // Tải nội dung file js/Bookmarklet.js về dạng text
        const response = await fetch('./js/Bookmarklet.js');
        
        if (!response.ok) {
            throw new Error("Không thể tải file Bookmarklet.js");
        }

        const fullCode = await response.text();
        
        // Chuyển đổi thành dạng link bookmarklet
        return createBookmarklet(fullCode);

    } catch (error) {
        console.error("Lỗi tạo bookmarklet:", error);
        return "javascript:alert('Lỗi tải Bookmarklet! Vui lòng kiểm tra console.');";
    }
}