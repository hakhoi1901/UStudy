import { GPA_CONFIG } from '../../../constants';
import { AcademicRulesEngine } from './academic-rules-engine';
import type { StudentCourseGrade, GPAPullResult, SimulatorCourseGrade, GPAPullSemester, GPAPullCourse } from '../types';

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
        let currentTotalPoints = 0;
        let currentCredits = 0;

        const projectedIds = new Set(projectedCourses.map(c => c.code));

        for (const c of gradesHistory) {
            if (c.status === 'ongoing') continue;
            if (projectedIds.has(c.code)) continue;

            const result = AcademicRulesEngine.calculateAccumulationParams(
                c.code, c.credits, c.grade, c.status
            );
            currentTotalPoints += result.pointsForGPA;
            currentCredits += result.creditsForGPA;
        }

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
            !AcademicRulesEngine.isCourseExcludedFromGPA(c.code)
        );
        const totalCredits = validCourses.reduce((sum, c) => sum + c.credits, 0);
        const currentPoints = validCourses.reduce((sum, c) => sum + (c.projectedGrade * c.credits), 0);
        return targetGPA * totalCredits - currentPoints;
    },

    /**
     * Công cụ "Kéo" GPA: Tính điểm trung bình tối thiểu cần đạt trong các tín chỉ còn lại
     * để đạt GPA mục tiêu lúc tốt nghiệp.
     */
    calculateRequiredAverageForTargetGPA: (
        gradesHistory: StudentCourseGrade[],
        targetGPA: number,
        totalCredits: number
    ): GPAPullResult => {
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
     * Công cụ "Kéo" GPA: Tính điểm trung bình tối thiểu cần đạt trong các tín chỉ còn lại
     * để đạt GPA mục tiêu trong một phạm vi (Scope) nhất định.
     */
    calculateRequiredAverageForTargetGPAInScope: (
        gradesHistory: StudentCourseGrade[],
        targetGPA: number,
        totalCredits: number,
        scopeLabel: string
    ): GPAPullResult => {
        if (totalCredits <= 0) {
            return {
                success: false,
                message: `Không có dữ liệu tín chỉ hợp lệ cho phạm vi ${scopeLabel}.`,
            };
        }

        let currentTotalPoints = 0;
        let currentCredits = 0;

        for (const course of gradesHistory) {
            if (course.status === 'ongoing') continue;
            const result = AcademicRulesEngine.calculateAccumulationParams(
                course.code,
                course.credits,
                course.grade,
                course.status
            );
            currentTotalPoints += result.pointsForGPA;
            currentCredits += result.creditsForGPA;
        }

        const remainingCredits = totalCredits - currentCredits;
        if (remainingCredits <= 0) {
            return {
                success: false,
                message: `Bạn đã đủ hoặc vượt số tín chỉ của phạm vi ${scopeLabel}. Không cần tính thêm.`,
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
                message: `Bạn đã đạt/vượt mục tiêu GPA ${targetGPA.toFixed(2)} trong phạm vi ${scopeLabel}. Chỉ cần duy trì.`,
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
                message: `Để đạt GPA ${targetGPA.toFixed(2)} trong phạm vi ${scopeLabel}, trung bình phần tín chỉ còn lại cần > 10, không khả thi.`,
            };
        }

        return {
            success: true,
            remainingCredits,
            requiredAverage,
            currentPoints: currentTotalPoints,
            currentCredits,
            message: `Trong ${remainingCredits} tín chỉ còn lại của phạm vi ${scopeLabel}, cần đạt trung bình tối thiểu ${requiredAverage.toFixed(2)} điểm để đạt GPA ${targetGPA.toFixed(2)}.`,
        };
    },

    /** 
     * Map simulator courses (có tín chỉ) sang GPAPullCourse 
     */
    buildNextSemesterFromSimulator: (
        simulatorCourses: SimulatorCourseGrade[],
        requiredAverage: number
    ): GPAPullSemester | null => {
        const coursesWithCredits = simulatorCourses.filter((c): c is SimulatorCourseGrade & { credits: number } =>
            c.credits != null && c.credits > 0
        );
        if (coursesWithCredits.length === 0) return null;

        const totalCredits = coursesWithCredits.reduce((sum, c) => sum + c.credits!, 0);
        const courses: GPAPullCourse[] = coursesWithCredits.map((c) => ({
            id: c.code,
            code: c.code,
            name: c.name,
            credits: c.credits!,
            lockedGrade: c.currentGrade ?? null,
            projectedGrade: c.projectedGrade ?? null,
            suggestedGrade: undefined,
            isLocked: c.currentGrade != null,
            source: c.source,
        }));

        return {
            id: 'next',
            label: 'Học kỳ tiếp theo',
            courses,
            requiredGPA: requiredAverage,
            totalCredits,
            pointsNeeded: requiredAverage * totalCredits,
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
