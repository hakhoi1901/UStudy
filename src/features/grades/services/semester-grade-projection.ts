import type { GPAProjectionSemester, SimulatorCourseGrade, StudentCourseGrade } from '../types';
import { AcademicRulesEngine } from './academic-rules-engine';

interface BuildProjectionSemestersInput {
    rawGrades: any[];
    registrations: any[];
    gradesHistory: StudentCourseGrade[];
    allCoursesMeta: any[];
    projectedGrades: Record<string, number>;
    legacyProjectedGrades?: Record<string, number>;
    fallbackRegistrationSemester?: string;
}

const UNKNOWN_SEMESTER = 'unknown';

export function normalizeProjectionSemester(value: unknown): string {
    const raw = String(value ?? '').trim();
    if (!raw) return UNKNOWN_SEMESTER;

    const normalized = raw
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .toLowerCase()
        .replace(/\s+/g, ' ');

    const yearMatch = normalized.match(/(?:20)?(\d{2})\s*[-/]\s*(?:20)?(\d{2})/);
    const slashSemester = normalized.match(/\/\s*([123])(?:\D|$)/);
    const namedSemester = normalized.match(/(?:hoc ky|hk|semester|ky)\s*([123])/);
    const semester = slashSemester?.[1] ?? namedSemester?.[1];

    if (yearMatch && semester) return `${yearMatch[1]}-${yearMatch[2]}/${semester}`;
    return raw.replace(/\s+/g, ' ');
}

export function formatProjectionSemesterLabel(semester: string): string {
    const match = semester.match(/^(\d{2})-(\d{2})\/([123])$/);
    if (!match) return semester === UNKNOWN_SEMESTER ? 'Chưa rõ học kỳ' : semester;
    return `HK${match[3]} 20${match[1]}-20${match[2]}`;
}

export function createGradeAttemptKey(semester: string, courseCode: string): string {
    return `${normalizeProjectionSemester(semester)}|${normalizeCourseCode(courseCode)}`;
}

function normalizeCourseCode(value: unknown): string {
    return String(value ?? '').trim().toUpperCase();
}

function getSemesterSortValue(semester: string): number {
    const match = semester.match(/^(\d{2})-(\d{2})\/([123])$/);
    if (!match) return Number.MIN_SAFE_INTEGER;
    return Number(match[1]) * 10 + Number(match[3]);
}

function getCourseCredits(code: string, value: unknown, allCoursesMeta: any[]): number | null {
    const direct = Number(value);
    if (Number.isFinite(direct) && direct > 0) return direct;
    const meta = allCoursesMeta.find((course) => normalizeCourseCode(course?.course_id ?? course?.id) === code);
    const fallback = Number(meta?.credits);
    return Number.isFinite(fallback) && fallback > 0 ? fallback : null;
}

function getCourseName(code: string, value: unknown, allCoursesMeta: any[]): string {
    const rawName = String(value ?? '').trim();
    if (rawName) return AcademicRulesEngine.extractVietnameseCourseName(rawName);
    const meta = allCoursesMeta.find((course) => normalizeCourseCode(course?.course_id ?? course?.id) === code);
    return String(meta?.course_name_vi ?? meta?.name_vi ?? meta?.name ?? code).trim() || code;
}

function summarizeSemester(id: string, courses: SimulatorCourseGrade[]): GPAProjectionSemester {
    let totalCredits = 0;
    let knownCredits = 0;
    let officialCredits = 0;
    let projectedCredits = 0;
    let knownPoints = 0;
    let officialCourseCount = 0;
    let projectedCourseCount = 0;
    let missingCourseCount = 0;

    courses.forEach((course) => {
        const credits = course.credits ?? 0;
        totalCredits += credits;
        if (course.currentGrade !== null) {
            officialCourseCount += 1;
            officialCredits += credits;
            knownCredits += credits;
            knownPoints += course.currentGrade * credits;
        } else if (course.projectedGrade !== null) {
            projectedCourseCount += 1;
            projectedCredits += credits;
            knownCredits += credits;
            knownPoints += course.projectedGrade * credits;
        } else {
            missingCourseCount += 1;
        }
    });

    return {
        id,
        label: formatProjectionSemesterLabel(id),
        courses,
        totalCredits,
        knownCredits,
        officialCredits,
        projectedCredits,
        officialCourseCount,
        projectedCourseCount,
        missingCourseCount,
        semesterGPA: knownCredits > 0 ? knownPoints / knownCredits : null,
    };
}

export function buildProjectionSemesters({
    rawGrades,
    registrations,
    gradesHistory,
    allCoursesMeta,
    projectedGrades,
    legacyProjectedGrades = {},
    fallbackRegistrationSemester,
}: BuildProjectionSemestersInput): GPAProjectionSemester[] {
    const attempts = new Map<string, SimulatorCourseGrade>();

    const upsert = (
        semesterValue: unknown,
        codeValue: unknown,
        patch: Partial<SimulatorCourseGrade> & Pick<SimulatorCourseGrade, 'name'>,
    ) => {
        const code = normalizeCourseCode(codeValue);
        if (!code || code === 'BAA00100') return;
        const semester = normalizeProjectionSemester(semesterValue);
        const attemptKey = createGradeAttemptKey(semester, code);
        const existing = attempts.get(attemptKey);
        attempts.set(attemptKey, {
            id: attemptKey,
            attemptKey,
            code,
            name: patch.name || existing?.name || code,
            semester,
            semesterLabel: formatProjectionSemesterLabel(semester),
            credits: patch.credits ?? existing?.credits ?? null,
            currentGrade: patch.currentGrade !== undefined ? patch.currentGrade : existing?.currentGrade ?? null,
            projectedGrade: null,
            source: existing?.source === 'official' && patch.currentGrade === undefined
                ? 'official'
                : patch.source ?? existing?.source ?? 'registration',
        });
    };

    rawGrades.forEach((grade) => {
        const code = normalizeCourseCode(grade?.id ?? grade?.code);
        if (!code) return;
        const score = AcademicRulesEngine.parseRawScore(grade?.score);
        upsert(grade?.semester, code, {
            name: getCourseName(code, grade?.name, allCoursesMeta),
            credits: getCourseCredits(code, grade?.credits, allCoursesMeta),
            currentGrade: score,
            source: score === null ? 'ongoing' : 'official',
        });
    });

    gradesHistory
        .filter((grade) => grade.status === 'ongoing')
        .forEach((grade) => {
            upsert(grade.semester, grade.code, {
                name: grade.nameVi,
                credits: getCourseCredits(grade.code, grade.credits, allCoursesMeta),
                currentGrade: null,
                source: 'ongoing',
            });
        });

    registrations.forEach((registration) => {
        if (registration?.courseType && String(registration.courseType).trim().toUpperCase() !== 'LT') return;
        const code = normalizeCourseCode(registration?.id ?? registration?.code);
        if (!code) return;
        upsert(registration?.semester || fallbackRegistrationSemester, code, {
            name: getCourseName(code, registration?.name, allCoursesMeta),
            credits: getCourseCredits(code, registration?.credits, allCoursesMeta),
            source: 'registration',
        });
    });

    const openSemesterIds = new Set(
        Array.from(attempts.values())
            .filter((course) => course.currentGrade === null)
            .map((course) => course.semester),
    );
    const openAttempts = Array.from(attempts.values()).filter((course) => openSemesterIds.has(course.semester));
    const attemptCountByCode = openAttempts.reduce((counts, course) => {
        counts.set(course.code, (counts.get(course.code) ?? 0) + 1);
        return counts;
    }, new Map<string, number>());

    openAttempts.forEach((course) => {
        if (course.currentGrade !== null) return;
        const direct = projectedGrades[course.attemptKey];
        const legacy = attemptCountByCode.get(course.code) === 1 ? legacyProjectedGrades[course.code] : undefined;
        const projectedGrade = direct ?? legacy;
        course.projectedGrade = Number.isFinite(projectedGrade) ? projectedGrade : null;
    });

    const coursesBySemester = new Map<string, SimulatorCourseGrade[]>();
    openAttempts.forEach((course) => {
        if (!coursesBySemester.has(course.semester)) coursesBySemester.set(course.semester, []);
        coursesBySemester.get(course.semester)!.push(course);
    });

    return Array.from(coursesBySemester.entries())
        .map(([semester, courses]) => summarizeSemester(
            semester,
            [...courses].sort((left, right) => left.code.localeCompare(right.code)),
        ))
        .sort((left, right) => (
            getSemesterSortValue(right.id) - getSemesterSortValue(left.id)
            || right.id.localeCompare(left.id)
        ));
}

export function refreshProjectionSemester(
    semester: GPAProjectionSemester,
    projectedGrades: Record<string, number>,
): GPAProjectionSemester {
    const courses = semester.courses.map((course) => ({
        ...course,
        projectedGrade: course.currentGrade !== null
            ? null
            : Number.isFinite(projectedGrades[course.attemptKey])
                ? projectedGrades[course.attemptKey]
                : null,
    }));
    return summarizeSemester(semester.id, courses);
}
