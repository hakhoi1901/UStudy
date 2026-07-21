import portalSyncConfig from '../portal-sync/config.json';

/**
 * Cấu hình chung cho toàn bộ ứng dụng
 */
export const APP_CONFIG = {
    /**
     * Đường dẫn đăng nhập Portal
     */
    PORTAL_LOGIN_URL: portalSyncConfig.portalLoginUrl,

    /**
     * Danh sách học kỳ hiển thị trên dropdown
     */
    AVAILABLE_SEMESTERS: [
        'Học kỳ 3, 2025-2026',
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
    DEFAULT_SEMESTER: 3,

    /**
     * Năm/Học kỳ mặc định cho Bookmarklet
     */
    DEFAULT_TARGET_YEAR: portalSyncConfig.defaults.academicYear,
    DEFAULT_TARGET_SEM: portalSyncConfig.defaults.semester,
    DEFAULT_CLASS_TARGET_YEAR: portalSyncConfig.defaults.academicYear,
    DEFAULT_CLASS_TARGET_SEM: portalSyncConfig.defaults.semester,
    DEFAULT_REG_TARGET_YEAR: portalSyncConfig.defaults.academicYear,
    DEFAULT_REG_TARGET_SEM: portalSyncConfig.defaults.semester,

    /**
     * Phiên bản hiện tại của Bookmarklet
     */
    BOOKMARKLET_VERSION: portalSyncConfig.scraperVersion,
    PORTAL_SYNC_PROTOCOL_VERSION: portalSyncConfig.protocolVersion,
    EXTENSION_VERSION: portalSyncConfig.extensionVersion,

    /**
     * Thông tin liên hệ và báo cáo
     */
    CONTACT: {
        GROUP_EMAIL: 'unopia.contact@gmail.com',
        REPORT_SUBJECT_PREFIX: '[Báo cáo] - ',
        DOCUMENT_CONTRIBUTION_SUBJECT_PREFIX: '[Đóng góp tài liệu] - ',
    }
};
