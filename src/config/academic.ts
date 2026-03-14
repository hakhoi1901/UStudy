export interface GPAConfig {
    value: number,
    lable: string
}

/**
 * cấu hình điểm GPA hệ 10 và xếp loại
 */
export const GPA_CONFIG: GPAConfig[] = [
    { value: 9.0, lable: 'Xuất sắc' },
    { value: 8.0, lable: 'Giỏi' },
    { value: 7.0, lable: 'Khá' },
    { value: 6.5, lable: 'Trung bình khá' },
    { value: 5.0, lable: 'Trung bình' },
    { value: 4.0, lable: 'Yếu' },
]

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

    /**Số chữ số sau dấu phẩy của GPA */
    GPA_POINT_DECIMAL: 3,

    /**Ngưỡng cảnh báo GPA */
    GPA_WARNING_THRESHOLD: 5.0,

    /**Điểm tối đa của GPA */
    MAX_GPA: 10.0,

    /**Tổng số tín chỉ yêu cầu tốt nghiệp */
    TOTAL_CREDITS: 137,

    /**Điểm hệ 10 tối thiểu để qua môn */
    PASS_GRADE_DECIMAL: 5.0,

    /**Mục tiêu điểm học lực (GPA Targets - Hệ 4) */
    GPA_TARGETS: {
        /**Xuất sắc */
        DISTINCTION: 3.6,
        /**Giỏi */
        VERY_GOOD: 3.2
    },

    /**Điểm GPA giả định lúc load Simulator */
    DEFAULT_SIMULATOR_GPA: 3.68
};
