/**
 * Các Document Key để lưu dữ liệu xuống Local Storage
 */
export const STORAGE_KEYS = {
    /** Dữ liệu sinh viên đầy đủ (thông tin cá nhân, điểm thi, lịch thi) */
    STUDENT_DB: 'student_db_full',

    /** Dữ liệu RAW nguyên vẹn từ Portal (chưa xử lý) */
    RAW_STUDENT_DB: 'raw_student_db',

    /** Dữ liệu danh sách môn học offline được cào về */
    COURSE_DB_OFFLINE: 'course_db_offline',

    /** Giỏ môn học đã chọn */
    SELECTED_BASKET: 'selected_courses_basket',

    /** Thông báo */
    APP_NOTIFICATION: 'app_notification',

    /** Trang hiện tại */
    PAGE: 'curent_page',

    /** Khoa đã chọn */
    FACULTY_ID: 'selected_faculty_id',
    /** Ngành đã chọn */
    MAJOR_ID: 'selected_major_id',
    /** Khóa tuyển đã chọn */
    COHORT_ID: 'selected_cohort_id',
    /** Năm học đã chọn */
    ACADEMIC_YEAR: 'selected_academic_year',
    /** Học kỳ đã chọn */
    ACADEMIC_SEMESTER: 'selected_semester_number',
    /** Khoa đã cấu hình */
    DEPARTMENT_CONFIGURED: 'department_configured',

    /** Metadata từ Bookmarklet (thời gian cào, năm/học kỳ của từng loại dữ liệu) */
    IMPORT_META: 'import_meta',
    /** Điểm dự đoán do người dùng nhập cho GPA Simulator */
    PROJECTED_GRADES: 'gpa_projected_grades',
    /** Tab đang mở trong Quản lý điểm */
    GRADE_MAIN_TAB: 'grade_main_tab',
    /** Điểm dự kiến cho các kỳ tương lai trong Công cụ Kéo GPA (môn chưa có trong simulator) */
    GPA_PULL_FUTURE_GRADES: 'gpa_pull_future_grades',
    /** Cấu hình ưu tiên xếp lịch */
    SOLVER_PREFERENCES: 'solver_preferences',
    /** Bản nháp kế hoạch học tập theo học kỳ */
    STUDY_PLAN: 'study_plan_draft',
    /** Tỷ lệ chiều rộng danh sách môn/khung học kỳ trong bản nháp */
    STUDY_PLAN_LAYOUT: 'study_plan_draft_layout',
    STUDY_PLAN_CATEGORY_EXPANSION: 'study_plan_category_expansion',
    /** Bản đồ các lớp được chọn cho mỗi môn (filter) */
    ALLOWED_CLASSES_MAP: 'allowed_classes_map',
    /** Danh sách các lịch đã lưu */
    SAVED_SCHEDULES: 'saved_schedules',
    ACTIVE_GROUP_SCHEDULE: 'active_group_schedule',
    /** Lịch sử chat của chatbot */
    CHAT_HISTORY: 'chatbot_chat_history',
    /** Các tùy chỉnh ghi đè thời khóa biểu (phòng, tiết, ngày nghỉ) */
    SCHEDULE_OVERRIDES: 'schedule_overrides',
    /** Thành viên nhóm (lưu tạm) */
    GROUP_SCHEDULER_MEMBERS: 'group_scheduler_members',
    /** Trạng thái UI (chế độ xem, tab đang mở, trạng thái ẩn/hiện) của Xếp lịch Nhóm */
    GROUP_SCHEDULE_UI_STATE: 'group_schedule_ui_state',
    /** Chế độ xếp lịch (Cá nhân hoặc Nhóm) */
    SCHEDULE_MODE: 'schedule_mode',
};
