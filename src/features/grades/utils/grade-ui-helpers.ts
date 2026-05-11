/**
 * UI Helpers cho Feature Grades
 * Chứa các hàm hỗ trợ hiển thị, màu sắc, class CSS dựa trên dữ liệu điểm số.
 */

export const GradeUIHelpers = {
    /**
     * Trả về CSS class cho text dựa trên điểm số
     */
    getGpaColorClass: (gpa: number): string => {
        if (gpa >= 9.0) return 'text-green-600';
        if (gpa >= 8.0) return 'text-blue-600';
        if (gpa >= 7.0) return 'text-yellow-600';
        if (gpa >= 6.5) return 'text-orange-500';
        if (gpa >= 5.0) return 'text-orange-600';
        return 'text-red-600';
    },

    /**
     * Trả về CSS class cho badge (background + text) dựa trên điểm số
     */
    getGpaBadgeClass: (gpa: number): string => {
        if (gpa >= 9.0) return 'bg-green-100 text-green-700';
        if (gpa >= 8.0) return 'bg-blue-100 text-blue-700';
        if (gpa >= 7.0) return 'bg-yellow-100 text-yellow-700';
        if (gpa >= 6.5) return 'bg-orange-100 text-orange-600';
        if (gpa >= 5.0) return 'bg-orange-100 text-orange-700';
        return 'bg-red-100 text-red-700';
    }
};
