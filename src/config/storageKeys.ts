/**
 * Các Document Key để lưu dữ liệu xuống Local Storage
 */
export const STORAGE_KEYS = {
    // Dữ liệu sinh viên đầy đủ (thông tin cá nhân, điểm thi, lịch thi)
    STUDENT_DB: 'student_db_full',

    // Dữ liệu RAW nguyên vẹn từ Portal (chưa xử lý)
    RAW_STUDENT_DB: 'raw_student_db',

    // Dữ liệu danh sách môn học offline được cào về
    COURSE_DB_OFFLINE: 'course_db_offline',

    // Giỏ môn học đã chọn
    SELECTED_BASKET: 'selected_courses_basket',

    // Thông báo
    APP_NOTIFICATION: 'app_notification',

    PAGE: 'curent_page',

    // Khoa, Ngành, Khóa tuyển và Năm học đã chọn
    FACULTY_ID: 'selected_faculty_id',
    MAJOR_ID: 'selected_major_id',
    COHORT_ID: 'selected_cohort_id',
    ACADEMIC_YEAR: 'selected_academic_year',
    ACADEMIC_SEMESTER: 'selected_semester_number',

    // Metadata từ Bookmarklet (thời gian cào, năm/học kỳ của từng loại dữ liệu)
    IMPORT_META: 'import_meta',
    // Điểm dự đoán do người dùng nhập cho GPA Simulator
    PROJECTED_GRADES: 'gpa_projected_grades',
};