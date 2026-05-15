export interface GPAConfig {
    value: number;
    lable: string;
}

/**
 * Cấu hình điểm GPA hệ 10 và xếp loại
 */
export const GPA_CONFIG: GPAConfig[] = [
    { value: 9.0, lable: 'Xuất sắc' },
    { value: 8.0, lable: 'Giỏi' },
    { value: 7.0, lable: 'Khá' },
    { value: 6.5, lable: 'Trung bình khá' },
    { value: 5.0, lable: 'Trung bình' },
    { value: 4.0, lable: 'Yếu' },
];

/** Mã môn Anh văn dùng cho kiểm tra miễn (BLM) */
export const ENGLISH_COURSE_IDS = ['ADD00031', 'ADD00032', 'ADD00033', 'ADD00034'];


/**
 * Các quy tắc học vụ, tính điểm, và điều kiện tốt nghiệp
 */
export const ACADEMIC_RULES = {
    /**
     * Các mã môn không tính vào Điểm trung bình (GPA) và Tích lũy
     */
    EXCLUDED_COURSE_PREFIXES: [
        { id: 'BAA0002', name: 'Giáo dục quốc phòng - An ninh' },
        { id: 'ADD0003', name: 'Giáo dục thể chất' },
        { id: 'BAA0003', name: 'Ngoại ngữ (Anh văn)' },
        { id: 'CSC00003', name: 'Tin học cơ sở' }
    ],

    /** Số chữ số sau dấu phẩy của GPA */
    GPA_POINT_DECIMAL: 3,

    /** Ngưỡng cảnh báo GPA */
    GPA_WARNING_THRESHOLD: 5.0,

    /** Điểm tối đa của GPA */
    MAX_GPA: 10.0,

    /** Tổng số tín chỉ yêu cầu tốt nghiệp */
    TOTAL_CREDITS: 138,

    /** Điểm hệ 10 tối thiểu để qua môn */
    PASS_GRADE_DECIMAL: 5.0,

    /** Mục tiêu điểm học lực (GPA Targets - Hệ 4) */
    GPA_TARGETS: {
        DISTINCTION: 3.6,
        VERY_GOOD: 3.2
    },

    /** Điểm GPA giả định lúc load Simulator */
    DEFAULT_SIMULATOR_GPA: 3.68,

    /** Cấu hình hiển thị và tính toán chi tiết */
    UI: {
        PULL_DECIMALS: 2,
        HISTORY_DECIMALS: 3,
        EPSILON: 0.05, // Độ lệch cho phép để xác định xu hướng
    },

    /** Danh mục môn học */
    CATEGORIES: {
        FOUNDATION: 'FOUNDATION',
        MAJOR: 'MAJOR'
    }
};

/** Điểm tối thiểu qua môn; dưới mức này phải học lại → đề xuất/dự kiến chỉ trong [MIN_GRADE, 10] */
export const MIN_GRADE_FOR_RETKE_SUGGESTION = ACADEMIC_RULES.PASS_GRADE_DECIMAL;
export const MAX_GRADE_FOR_RETKE_SUGGESTION = ACADEMIC_RULES.MAX_GPA;
