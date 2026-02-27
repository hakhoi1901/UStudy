import { GPA_CONFIG, ACADEMIC_RULES } from '../config';
import type { StudentCourseGrade } from '../types';

/**
 * Domain Service: Các hàm tính toán GPA thuần (Pure Functions)
 * Không phụ thuộc React, có thể test/import độc lập.
 */
export const GPACalculator = {
    /**
     * Tính GPA dự kiến khi kết hợp điểm lịch sử + điểm dự kiến học kỳ tới
     */
    calculateProjectedGPA: (
        gradesHistory: StudentCourseGrade[],
        projectedCourses: { credits: number; projectedGrade: number }[]
    ): number => {
        const currentTotalPoints = gradesHistory
            .filter(c => c.status === 'passed')
            .reduce((sum, c) => sum + (c.grade * c.credits), 0);

        const currentCredits = gradesHistory
            .filter(c => c.status === 'passed')
            .reduce((sum, c) => sum + c.credits, 0);

        const projectedPoints = projectedCourses.reduce(
            (sum, c) => sum + ((c.projectedGrade ?? 0) * c.credits), 0
        );
        const projectedCredits = projectedCourses.reduce(
            (sum, c) => sum + c.credits, 0
        );

        const totalPoints = currentTotalPoints + projectedPoints;
        const totalCredits = currentCredits + projectedCredits;

        return totalCredits > 0 ? totalPoints / totalCredits : 0;
    },

    /**
     * Xếp loại học lực dựa trên điểm GPA (hệ 10)
     */
    getClassification: (gpa: number): string => {
        for (const config of GPA_CONFIG) {
            if (gpa >= config.value) return config.lable;
        }
        return GPA_CONFIG[GPA_CONFIG.length - 1].lable;
    },

    /**
     * Tính số điểm còn thiếu để đạt mốc GPA mục tiêu
     */
    getGradePointsNeeded: (
        targetGPA: number,
        courses: { code: string; credits: number; projectedGrade: number }[]
    ): number => {
        const validCourses = courses.filter(c =>
            !ACADEMIC_RULES.EXCLUDED_COURSE_PREFIXES.some(prefix => c.code.startsWith(prefix.id))
        );
        const totalCredits = validCourses.reduce((sum, c) => sum + c.credits, 0);
        const currentPoints = validCourses.reduce((sum, c) => sum + (c.projectedGrade * c.credits), 0);
        return targetGPA * totalCredits - currentPoints;
    },

    /**
     * Chuyển đổi điểm số sang chữ cái (Hệ 4 → Letter Grade)
     */
    gradeToLetter: (gradePoint: number): string => {
        if (gradePoint >= 4.0) return 'A';
        if (gradePoint >= 3.5) return 'B+';
        if (gradePoint >= 3.0) return 'B';
        if (gradePoint >= 2.5) return 'C+';
        if (gradePoint >= 2.0) return 'C';
        if (gradePoint >= 1.5) return 'D+';
        if (gradePoint >= 1.0) return 'D';
        return 'F';
    },
};
