import type { StudentCourseGrade, GPAPullCourse, GPAPullSemester, RemainingCourseItem } from '../types';
import { AcademicRulesEngine } from './academic-rules-engine';

/**
 * Lấy danh sách môn còn lại chưa học (chưa qua, không nằm trong simulator).
 * Chỉ lấy môn có credits > 0 và không thuộc passed/simulator.
 */
export function getRemainingCoursesForGpaPull(
    gradesHistory: StudentCourseGrade[],
    simulatorCourseCodes: Set<string>,
    allCoursesMeta: any[]
): RemainingCourseItem[] {
    const passedCodes = new Set(
        gradesHistory
            .filter((g) => g.status === 'passed')
            .map((g) => g.code)
    );

    const remaining: RemainingCourseItem[] = [];

    if (!Array.isArray(allCoursesMeta)) return remaining;

    for (const c of allCoursesMeta) {
        const code = c.course_id ?? c.id ?? '';
        if (!code || typeof code !== 'string') continue;

        const credits = typeof c.credits === 'number' ? c.credits : parseInt(c.credits, 10) || 0;
        if (credits <= 0) continue;

        if (passedCodes.has(code.trim()) || simulatorCourseCodes.has(code.trim())) continue;

        const name =
            c.course_name_vi ?? c.name ?? c.course_name ?? AcademicRulesEngine.extractVietnameseCourseName(c.name ?? '') ?? code;

        remaining.push({ code: code.trim(), name: String(name).trim() || code, credits });
    }

    return remaining.sort((a, b) => a.code.localeCompare(b.code));
}

const DEFAULT_SEMESTERS = 2;
const TARGET_CREDITS_PER_SEMESTER = 20;

/**
 * Chia danh sách môn còn lại thành N kỳ, mỗi kỳ có tổng tín chỉ gần bằng.
 * Trả về mảng GPAPullSemester (không bao gồm "Học kỳ tiếp theo").
 */
export function splitRemainingIntoSemesters(
    remaining: RemainingCourseItem[],
    requiredAverage: number,
    numSemesters?: number
): GPAPullSemester[] {
    if (remaining.length === 0) return [];

    const n = numSemesters ?? Math.max(1, Math.min(DEFAULT_SEMESTERS, Math.ceil(remaining.reduce((s, c) => s + c.credits, 0) / TARGET_CREDITS_PER_SEMESTER)));

    const totalCredits = remaining.reduce((s, c) => s + c.credits, 0);
    const targetPerSem = totalCredits / n;
    const result: GPAPullSemester[] = [];
    let offset = 0;

    for (let i = 0; i < n; i++) {
        let acc = 0;
        const chunk: RemainingCourseItem[] = [];
        while (offset < remaining.length && (chunk.length === 0 || acc < targetPerSem * 1.1)) {
            const item = remaining[offset];
            chunk.push(item);
            acc += item.credits;
            offset++;
        }
        if (chunk.length === 0) continue;

        const totalCreditsK = chunk.reduce((s, c) => s + c.credits, 0);
        const courses: GPAPullCourse[] = chunk.map((c) => ({
            id: `future-${c.code}`,
            code: c.code,
            name: c.name,
            credits: c.credits,
            lockedGrade: null,
            projectedGrade: null,
            suggestedGrade: requiredAverage,
            isLocked: false,
            source: 'future',
        }));

        result.push({
            id: `future-${i + 1}`,
            label: `Kỳ sau ${i + 1}`,
            courses,
            requiredGPA: requiredAverage,
            totalCredits: totalCreditsK,
            pointsNeeded: requiredAverage * totalCreditsK,
        });
    }

    return result;
}
