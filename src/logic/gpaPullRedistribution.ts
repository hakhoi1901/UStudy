import type { GPAPullCourse } from '../types';
import { ACADEMIC_RULES } from '../config';

/** Điểm tối thiểu qua môn; dưới mức này phải học lại → đề xuất/dự kiến chỉ trong [MIN_GRADE, 10] */
const MIN_GRADE = ACADEMIC_RULES.PASS_GRADE_DECIMAL;
const MAX_GRADE = 10;

/**
 * Phân bổ lại điểm đề xuất (suggestedGrade) cho các môn chưa cố định trong kỳ,
 * sao cho GPA kỳ = requiredAverage.
 * - Môn cố định: isLocked → dùng lockedGrade; hoặc projectedGrade !== null → dùng projectedGrade.
 * - Môn còn lại: suggestedGrade = remainingPoints / editableCredits (clamp 5–10, vì điểm < 5 phải học lại).
 */
export function redistributeSuggestedGrades(
    courses: GPAPullCourse[],
    requiredAverage: number
): GPAPullCourse[] {
    const totalCreditsInSemester = courses.reduce((sum, c) => sum + c.credits, 0);
    if (totalCreditsInSemester <= 0) return courses;

    const pointsNeededForSemester = requiredAverage * totalCreditsInSemester;
    const decimals = ACADEMIC_RULES.GPA_POINT_DECIMAL;
    const roundToDisplay = (n: number) => Math.round(n * Math.pow(10, decimals)) / Math.pow(10, decimals);

    let fixedPoints = 0;
    let fixedCredits = 0;
    const fixedSet = new Set<number>();

    courses.forEach((c, i) => {
        const grade = c.isLocked ? (c.lockedGrade ?? null) : (c.projectedGrade ?? null);
        if (grade !== null && typeof grade === 'number' && !Number.isNaN(grade)) {
            fixedPoints += grade * c.credits;
            fixedCredits += c.credits;
            fixedSet.add(i);
        }
    });

    const editableCredits = totalCreditsInSemester - fixedCredits;
    const remainingPoints = pointsNeededForSemester - fixedPoints;

    if (editableCredits <= 0) {
        return courses.map((c, i) => {
            if (!fixedSet.has(i)) return { ...c, suggestedGrade: c.suggestedGrade };
            if (c.isLocked && c.lockedGrade != null) return { ...c, suggestedGrade: roundToDisplay(c.lockedGrade) };
            if (!c.isLocked && c.projectedGrade != null) return { ...c, suggestedGrade: roundToDisplay(c.projectedGrade) };
            return c;
        });
    }

    const suggestedGrade = Math.min(MAX_GRADE, Math.max(MIN_GRADE, remainingPoints / editableCredits));
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
    const totalCreditsInSemester = courses.reduce((sum, c) => sum + c.credits, 0);
    if (totalCreditsInSemester <= 0) return null;

    const pointsNeededForSemester = requiredAverage * totalCreditsInSemester;
    let fixedPoints = 0;
    let fixedCredits = 0;

    courses.forEach((c) => {
        const grade = c.isLocked ? (c.lockedGrade ?? null) : (c.projectedGrade ?? null);
        if (grade !== null && typeof grade === 'number' && !Number.isNaN(grade)) {
            fixedPoints += grade * c.credits;
            fixedCredits += c.credits;
        }
    });

    const editableCredits = totalCreditsInSemester - fixedCredits;
    const remainingPoints = pointsNeededForSemester - fixedPoints;

    if (editableCredits <= 0) {
        const diff = fixedPoints - pointsNeededForSemester;
        if (Math.abs(diff) > 0.001) {
            return `Với điểm đã nhập, không thể đạt GPA kỳ ${requiredAverage.toFixed(2)}. Tổng điểm đã nhập: ${fixedPoints.toFixed(2)}; cần: ${pointsNeededForSemester.toFixed(2)}.`;
        }
        return null;
    }

    if (remainingPoints < 0) {
        return `Tổng điểm đã nhập/khóa vượt quá điểm cần cho GPA kỳ ${requiredAverage.toFixed(2)}. Cần giảm điểm một số môn đã nhập.`;
    }
    if (remainingPoints > 10 * editableCredits) {
        return `Để đạt GPA kỳ ${requiredAverage.toFixed(2)}, các môn còn lại cần trung bình trên 10 điểm (không khả thi). Hãy tăng điểm các môn đã nhập.`;
    }
    if (remainingPoints < MIN_GRADE * editableCredits) {
        return `Để đạt GPA kỳ ${requiredAverage.toFixed(2)} với điểm tối thiểu ${MIN_GRADE} (qua môn), không đủ điểm cần phân bổ. Hãy giảm điểm một số môn đã nhập.`;
    }
    return null;
}
