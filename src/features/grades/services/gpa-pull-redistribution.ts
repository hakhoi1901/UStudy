import type { GPAPullCourse } from '../types';
import { ACADEMIC_RULES } from '../../../constants';
import { MIN_GRADE_FOR_RETKE_SUGGESTION, MAX_GRADE_FOR_RETKE_SUGGESTION } from '../../../constants/academic';

/**
 * Phân bổ lại điểm đề xuất (suggestedGrade) cho các môn chưa cố định trong kỳ,
 * sao cho trung bình của phần chưa có điểm chính thức = requiredAverage.
 * - Môn có điểm chính thức không tham gia phân bổ.
 * - Môn dự kiến đã nhập được giữ cố định trong phần tín chỉ đang dự đoán.
 * - Môn còn lại: suggestedGrade = remainingPoints / editableCredits (clamp 5–10, vì điểm < 5 phải học lại).
 */
export function redistributeSuggestedGrades(
    courses: GPAPullCourse[],
    requiredAverage: number
): GPAPullCourse[] {
    const pendingCredits = courses.reduce((sum, course) => (
        course.isLocked ? sum : sum + course.credits
    ), 0);
    if (pendingCredits <= 0) return courses;

    const pointsNeededForPendingCourses = requiredAverage * pendingCredits;
    const decimals = ACADEMIC_RULES.GPA_POINT_DECIMAL;
    const roundToDisplay = (n: number) => Math.round(n * Math.pow(10, decimals)) / Math.pow(10, decimals);

    let fixedPoints = 0;
    let fixedCredits = 0;
    const fixedSet = new Set<number>();

    courses.forEach((c, i) => {
        if (c.isLocked) {
            fixedSet.add(i);
            return;
        }
        const grade = c.projectedGrade ?? null;
        if (grade !== null && typeof grade === 'number' && !Number.isNaN(grade)) {
            fixedPoints += grade * c.credits;
            fixedCredits += c.credits;
            fixedSet.add(i);
        }
    });

    const editableCredits = pendingCredits - fixedCredits;
    const remainingPoints = pointsNeededForPendingCourses - fixedPoints;

    if (editableCredits <= 0) {
        return courses.map((c, i) => {
            if (!fixedSet.has(i)) return { ...c, suggestedGrade: c.suggestedGrade };
            if (c.isLocked && c.lockedGrade != null) return { ...c, suggestedGrade: roundToDisplay(c.lockedGrade) };
            if (!c.isLocked && c.projectedGrade != null) return { ...c, suggestedGrade: roundToDisplay(c.projectedGrade) };
            return c;
        });
    }

    const suggestedGrade = Math.min(MAX_GRADE_FOR_RETKE_SUGGESTION, Math.max(MIN_GRADE_FOR_RETKE_SUGGESTION, remainingPoints / editableCredits));
    const rounded = roundToDisplay(suggestedGrade);

    return courses.map((c, i) => {
        if (fixedSet.has(i)) {
            if (c.isLocked && c.lockedGrade != null) return { ...c, suggestedGrade: roundToDisplay(c.lockedGrade) };
            if (!c.isLocked && c.projectedGrade != null) return { ...c, suggestedGrade: roundToDisplay(c.projectedGrade) };
            return c;
        }
        return { ...c, suggestedGrade: rounded };
    });
}

/**
 * Tính cảnh báo khi không thể đạt GPA kỳ với điểm đã nhập/khóa (phạm vi mỗi môn 5–10).
 */
export function getSemesterWarning(
    courses: GPAPullCourse[],
    requiredAverage: number
): string | null {
    const pendingCredits = courses.reduce((sum, course) => (
        course.isLocked ? sum : sum + course.credits
    ), 0);
    if (pendingCredits <= 0) return null;

    const pointsNeededForPendingCourses = requiredAverage * pendingCredits;
    let fixedPoints = 0;
    let fixedCredits = 0;

    courses.forEach((c) => {
        if (c.isLocked) return;
        const grade = c.projectedGrade ?? null;
        if (grade !== null && typeof grade === 'number' && !Number.isNaN(grade)) {
            fixedPoints += grade * c.credits;
            fixedCredits += c.credits;
        }
    });

    const editableCredits = pendingCredits - fixedCredits;
    const remainingPoints = pointsNeededForPendingCourses - fixedPoints;

    if (editableCredits <= 0) {
        const diff = fixedPoints - pointsNeededForPendingCourses;
        // Nếu tổng điểm đã nhập *thấp hơn* mức cần → không thể đạt GPA kỳ yêu cầu.
        if (diff < -0.001) {
            return `Với điểm đã nhập, không thể đạt trung bình ${requiredAverage.toFixed(2)} cho các môn còn lại. Tổng điểm đã nhập: ${fixedPoints.toFixed(2)}; cần: ${pointsNeededForPendingCourses.toFixed(2)}.`;
        }
        // Nếu bằng hoặc cao hơn (diff >= 0) → coi là hợp lệ, không cảnh báo.
        return null;
    }

    if (remainingPoints > 10 * editableCredits) {
        return `Để đạt mức trung bình ${requiredAverage.toFixed(2)}, các môn chưa nhập cần trên 10 điểm (không khả thi). Hãy tăng điểm các môn đã nhập.`;
    }
    return null;
}
