/**
 * Các quy tắc học vụ, tính điểm, và điều kiện tốt nghiệp
 */
export const ACADEMIC_RULES = {
    // Các mã môn không tính vào Điểm trung bình (GPA) và Tích lũy
    EXCLUDED_COURSE_PREFIXES: ['BAA0002', 'ADD0003', 'BAA0003'],

    // Tổng số tín chỉ yêu cầu tốt nghiệp
    TOTAL_REQUIRED_CREDITS: 137,

    // Điểm hệ 10 tối thiểu để qua môn
    PASS_GRADE_DECIMAL: 5.0,

    // Mục tiêu điểm rèn luyện / Học lực (GPA Targets - Hệ 4)
    GPA_TARGETS: {
        DISTINCTION: 3.6, // Xuất sắc
        VERY_GOOD: 3.2    // Giỏi
    },

    // Điểm GPA giả định lúc load Simulator
    DEFAULT_SIMULATOR_GPA: 3.68
};
