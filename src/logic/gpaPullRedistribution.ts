import type { GPAPullCourse } from '../types';
import { ACADEMIC_RULES } from '../config';

const MIN_GRADE = 0;
const MAX_GRADE = 10;

/**
 * Phân bổ lại điểm đề xuất (suggestedGrade) cho các môn chưa cố định trong kỳ,
 * sao cho GPA kỳ = requiredAverage.
 * - Môn cố định: isLocked → dùng lockedGrade; hoặc projectedGrade !== null → dùng projectedGrade.
 * - Môn còn lại: suggestedGrade = remainingPoints / editableCredits (clamp 0–10).
 */
export function redistributeSuggestedGrades(
    courses: GPAPullCourse[],
    requiredAverage: number
): GPAPullCourse[] {
    const totalCreditsInSemester = courses.reduce((sum, c) => sum + c.credits, 0);
    if (totalCreditsInSemester <= 0) return courses;

    const pointsNeededForSemester = requiredAverage * totalCreditsInSemester;

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
        return courses.map((c, i) =>
            fixedSet.has(i) ? c : { ...c, suggestedGrade: c.suggestedGrade }
        );
    }

    const suggestedGrade = Math.min(MAX_GRADE, Math.max(MIN_GRADE, remainingPoints / editableCredits));
    const decimals = ACADEMIC_RULES.GPA_POINT_DECIMAL;
    const rounded = Math.round(suggestedGrade * Math.pow(10, decimals)) / Math.pow(10, decimals);

    return courses.map((c, i) =>
        fixedSet.has(i) ? c : { ...c, suggestedGrade: rounded }
    );
}
