/**
 * Cấu hình chung cho toàn bộ ứng dụng
 */
export const APP_CONFIG = {
    /**
     * Đường dẫn đăng nhập Portal
     */
    PORTAL_LOGIN_URL: 'https://new-portal4.hcmus.edu.vn/',

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
    DEFAULT_TARGET_SEM: "2",
    DEFAULT_CLASS_TARGET_YEAR: "25-26",
    DEFAULT_CLASS_TARGET_SEM: "2",
    DEFAULT_REG_TARGET_YEAR: "25-26",
    DEFAULT_REG_TARGET_SEM: "2",

    /**
     * Phiên bản hiện tại của Bookmarklet
     */
    BOOKMARKLET_VERSION: '0.1.1',

    /**
     * Thông tin liên hệ và báo cáo
     */
    CONTACT: {
        GROUP_EMAIL: 'unopia.contact@gmail.com',
        REPORT_SUBJECT_PREFIX: '[Báo cáo] - ',
        DOCUMENT_CONTRIBUTION_SUBJECT_PREFIX: '[Đóng góp tài liệu] - ',
    }
};
