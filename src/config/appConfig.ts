/**
 * Cấu hình chung cho toàn bộ ứng dụng
 */
export const APP_CONFIG = {
    /**
     * Đường dẫn đăng nhập Portal
     */
    PORTAL_LOGIN_URL: 'https://new-portal.hcmus.edu.vn/Login.aspx?ReturnUrl=%2fSinhVien.aspx%3fpid%3d211&pid=211',

    /**
     * Danh sách học kỳ hiển thị trên dropdown
     */
    AVAILABLE_SEMESTERS: [
        'Học kỳ 2, 2025-2026',
        'Học kỳ 1, 2025-2026',
        'Học kỳ 3, 2024-2025',
        'Học kỳ 2, 2024-2025',
        'Học kỳ 1, 2024-2025',
    ],

    /**
     * Cấu hình học kỳ mặc định toàn app
     */
    DEFAULT_ACADEMIC_YEAR: '2025-2026',
    DEFAULT_SEMESTER: 2,

    /**
     * Năm/Học kỳ mặc định cho Bookmarklet
     */
    DEFAULT_TARGET_YEAR: "25-26",
    DEFAULT_TARGET_SEM: "2"
};
