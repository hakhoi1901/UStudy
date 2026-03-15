import { GPA_CONFIG } from '../config';
import { AcademicRulesEngine } from './AcademicRulesEngine';
import type { StudentCourseGrade } from '../types';

/**
 * Domain Service: Các hàm tính toán GPA thuần (Pure Functions)
 * Không phụ thuộc React, có thể test/import độc lập.
 */
export const GPACalculator = {
    /**
     * Tính GPA dự kiến khi kết hợp điểm lịch sử + điểm dự kiến học kỳ tới.
     */
    calculateProjectedGPA: (
        gradesHistory: StudentCourseGrade[],
        projectedCourses: { code: string; credits: number; projectedGrade: number }[]
    ): number => {
        // ── Phần 1: Tính điểm lịch sử (reuse AcademicRulesEngine) ────────
        // [TN-FIX] Code cũ chỉ filter status === 'passed', không loại
        // GDQP/TC/AV và bỏ qua retake → GPA sai so với currentGPA.
        // const currentTotalPoints = gradesHistory
        //     .filter(c => c.status === 'passed')
        //     .reduce((sum, c) => sum + (c.grade * c.credits), 0);
        // const currentCredits = gradesHistory
        //     .filter(c => c.status === 'passed')
        //     .reduce((sum, c) => sum + c.credits, 0);

        let currentTotalPoints = 0;
        let currentCredits = 0;

        // 1. Tạo Set mã môn được dự đoán để thực hiện thay thế điểm (Grade Replacement)
        const projectedIds = new Set(projectedCourses.map(c => c.code));

        for (const c of gradesHistory) {
            // Chỉ tính môn có điểm số hợp lệ (passed hoặc retake)
            if (c.status === 'ongoing') continue;

            // BỎ QUA nếu môn này đang được dự đoán (cơ chế thay thế thẻ điểm)
            if (projectedIds.has(c.code)) continue;

            const result = AcademicRulesEngine.calculateAccumulationParams(
                c.code, c.credits, c.grade, c.status
            );
            currentTotalPoints += result.pointsForGPA;
            currentCredits += result.creditsForGPA;
        }

        // ── Phần 2: Tính điểm dự kiến (học kỳ mô phỏng) ─────────────────
        const projectedPoints = projectedCourses.reduce(
            (sum, c) => sum + ((c.projectedGrade ?? 0) * c.credits), 0
        );
        const projectedCredits = projectedCourses.reduce(
            (sum, c) => sum + c.credits, 0
        );

        // ── Kết hợp ──────────────────────────────────────────────────────
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
            !AcademicRulesEngine.isCourseExcludedFromGPA(c.code)
        );
        const totalCredits = validCourses.reduce((sum, c) => sum + c.credits, 0);
        const currentPoints = validCourses.reduce((sum, c) => sum + (c.projectedGrade * c.credits), 0);
        return targetGPA * totalCredits - currentPoints;
    },

    /**
     * Công cụ "Kéo" GPA: Tính điểm trung bình tối thiểu cần đạt trong các tín chỉ còn lại
     * để đạt GPA mục tiêu lúc tốt nghiệp.
     * @param gradesHistory - Lịch sử điểm đã tích lũy (cùng cách tính như currentGPA)
     * @param targetGPA - GPA mong muốn lúc ra trường (hệ 10, ví dụ 8.0 cho loại Giỏi)
     * @param totalCredits - Tổng tín chỉ yêu cầu tốt nghiệp (ví dụ 137)
     */
    calculateRequiredAverageForTargetGPA: (
        gradesHistory: StudentCourseGrade[],
        targetGPA: number,
        totalCredits: number
    ): {
        success: boolean;
        remainingCredits?: number;
        requiredAverage?: number;
        currentPoints?: number;
        currentCredits?: number;
        alreadyAchieved?: boolean;
        impossible?: boolean;
        message: string;
    } => {
        const projectedIds = new Set<string>();
        let currentTotalPoints = 0;
        let currentCredits = 0;

        for (const c of gradesHistory) {
            if (c.status === 'ongoing') continue;
            if (projectedIds.has(c.code)) continue;
            const result = AcademicRulesEngine.calculateAccumulationParams(
                c.code, c.credits, c.grade, c.status
            );
            currentTotalPoints += result.pointsForGPA;
            currentCredits += result.creditsForGPA;
        }

        const remainingCredits = totalCredits - currentCredits;
        if (remainingCredits <= 0) {
            return {
                success: false,
                message: 'Bạn đã đủ hoặc vượt số tín chỉ tốt nghiệp. Không cần tính thêm.',
            };
        }

        const totalPointsAtTarget = targetGPA * totalCredits;
        const futurePointsNeeded = totalPointsAtTarget - currentTotalPoints;
        if (futurePointsNeeded <= 0) {
            return {
                success: true,
                alreadyAchieved: true,
                remainingCredits,
                currentPoints: currentTotalPoints,
                currentCredits,
                message: `Bạn đã đạt/ vượt mục tiêu GPA ${targetGPA.toFixed(2)}. Chỉ cần duy trì.`,
            };
        }

        const requiredAverage = futurePointsNeeded / remainingCredits;
        if (requiredAverage > 10) {
            return {
                success: false,
                impossible: true,
                remainingCredits,
                requiredAverage,
                currentPoints: currentTotalPoints,
                currentCredits,
                message: `Để đạt GPA ${targetGPA.toFixed(2)} lúc tốt nghiệp, trung bình các tín chỉ còn lại cần > 10, không khả thi.`,
            };
        }

        return {
            success: true,
            remainingCredits,
            requiredAverage,
            currentPoints: currentTotalPoints,
            currentCredits,
            message: `Trong ${remainingCredits} tín chỉ còn lại, cần đạt trung bình tối thiểu ${requiredAverage.toFixed(2)} điểm để tốt nghiệp với GPA ${targetGPA.toFixed(2)}.`,
        };
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
