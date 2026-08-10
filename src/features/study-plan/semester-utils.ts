import { AcademicRulesEngine } from '../grades';
import type { CourseMeta, StudyPlanStorage, GradeRecord, ParsedSemester, StudyPlanSemester } from './types';

export const DEFAULT_SEMESTER_COUNT = 12;
export const SEMESTERS_PER_STUDY_YEAR = 3;
export const DEFAULT_LEFT_PANEL_PERCENT = 68;
export const MIN_LEFT_PANEL_PERCENT = 45;
export const MAX_LEFT_PANEL_PERCENT = 78;

export function clampPanelPercent(value: number): number {
    if (!Number.isFinite(value)) return DEFAULT_LEFT_PANEL_PERCENT;
    return Math.min(MAX_LEFT_PANEL_PERCENT, Math.max(MIN_LEFT_PANEL_PERCENT, Math.round(value)));
}

export function getCurrentYearAnchor(): ParsedSemester {
    return { yearStart: new Date().getFullYear(), semester: 1 };
}

function toFullYear(rawYear: string): number {
    const year = Number(rawYear);
    return rawYear.length === 2 ? 2000 + year : year;
}

export function parseSemesterLabel(label: string): ParsedSemester | null {
    const trimmed = label.trim();
    if (!trimmed) return null;

    const yearMatch = trimmed.match(/(\d{2,4})\s*[-–]\s*(\d{2,4})/);
    const semesterMatch =
        trimmed.match(/\/\s*([1-3])\b/) ||
        trimmed.match(/học\s*kỳ\s*([1-3])/i) ||
        trimmed.match(/hoc\s*ky\s*([1-3])/i) ||
        trimmed.match(/hk\s*([1-3])/i);

    if (!yearMatch || !semesterMatch) return null;

    return {
        yearStart: toFullYear(yearMatch[1]),
        semester: Number(semesterMatch[1]),
    };
}

export function getSemesterSequenceValue(semester: ParsedSemester): number {
    return semester.yearStart * 3 + semester.semester - 1;
}

export function addSemesters(base: ParsedSemester, offset: number): ParsedSemester {
    const zeroBasedSemester = base.semester - 1 + offset;
    return {
        yearStart: base.yearStart + Math.floor(zeroBasedSemester / 3),
        semester: (zeroBasedSemester % 3) + 1,
    };
}

export function formatAcademicSemesterLabel(semester: ParsedSemester): string {
    const start = String(semester.yearStart).slice(-2);
    const end = String(semester.yearStart + 1).slice(-2);
    return `${start}-${end}/${semester.semester}`;
}

function getStudyYear(semester: ParsedSemester, anchor: ParsedSemester): number {
    const offset = getSemesterSequenceValue(semester) - getSemesterSequenceValue(anchor);
    return Math.max(1, Math.floor(offset / 3) + 1);
}

function getStudySemester(semester: ParsedSemester, anchor: ParsedSemester): number {
    const offset = getSemesterSequenceValue(semester) - getSemesterSequenceValue(anchor);
    return offset % 3 + 1;
}

export function formatSemesterLabel(semester: ParsedSemester, anchor: ParsedSemester = semester): string {
    return `Kì ${getStudySemester(semester, anchor)} - Năm ${getStudyYear(semester, anchor)}`;
}

/** Converts the displayed "Kì X - Năm Y" label into a zero-based study-plan position. */
export function getStudyPlanSemesterIndex(label: string): number | null {
    const normalized = normalizeSemesterId(label);
    const match = normalized.match(/^(?:nhap-)?(?:hoc-ky|ki)-(\d+)(?:-nam-(\d+))?$/);
    if (!match) return null;

    const semester = Number(match[1]);
    const year = Number(match[2] || 1);
    if (semester < 1 || semester > 3 || year < 1) return null;

    return (year - 1) * 3 + semester - 1;
}

export function formatStudyPlanSemesterLabel(index: number): string {
    const safeIndex = Math.max(0, Math.floor(index));
    return `Kì ${(safeIndex % 3) + 1} - Năm ${Math.floor(safeIndex / 3) + 1}`;
}

export function normalizeSemesterId(label: string): string {
    return label
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '') || 'unknown';
}

export function getSemesterId(label: string): string {
    const parsed = parseSemesterLabel(label);
    const idLabel = parsed ? formatAcademicSemesterLabel(parsed) : label;
    return `semester-${normalizeSemesterId(idLabel)}`;
}

export function createDefaultSemesters(
    anchor: ParsedSemester = getCurrentYearAnchor(),
    count = DEFAULT_SEMESTER_COUNT,
    historicalLabels = new Set<string>()
): StudyPlanSemester[] {
    return Array.from({ length: count }, (_, index) => {
        const label = formatSemesterLabel(addSemesters(anchor, index), anchor);
        return {
            id: getSemesterId(label),
            label,
            isHistorical: historicalLabels.has(label),
        };
    });
}

export function isStudyPlanStorage(value: unknown): value is StudyPlanStorage {
    if (!value || typeof value !== 'object') return false;
    const studyPlan = value as StudyPlanStorage;
    return Array.isArray(studyPlan.semesters) && !!studyPlan.plan && typeof studyPlan.plan === 'object';
}

export function getSemesterSortValue(label: string): number {
    const studyPlanIndex = getStudyPlanSemesterIndex(label);
    if (studyPlanIndex !== null) return studyPlanIndex;

    const semester = parseSemesterLabel(label);
    if (!semester) return Number.MAX_SAFE_INTEGER;
    return getSemesterSequenceValue(semester);
}

export function getAnchorSemester(
    rawGrades: GradeRecord[] | undefined,
    rawRegistrations: Array<{ semester?: string }> | undefined = []
): ParsedSemester {
    const parsedSemesters = [...(rawGrades || []), ...(rawRegistrations || [])]
        .map((record) => parseSemesterLabel(String(record.semester || '')))
        .filter((semester): semester is ParsedSemester => !!semester);

    if (parsedSemesters.length === 0) return getCurrentYearAnchor();

    return parsedSemesters.reduce((earliest, current) => (
        getSemesterSequenceValue(current) < getSemesterSequenceValue(earliest) ? current : earliest
    ));
}

export function buildHistoricalStudyPlan(
    rawGrades: GradeRecord[] | undefined,
    courseById: Map<string, CourseMeta>,
    hasBLMExemption: boolean,
    rawRegistrations: Array<{ id?: string; semester?: string }> | undefined = []
): StudyPlanStorage {
    if ((!rawGrades || rawGrades.length === 0) && (!rawRegistrations || rawRegistrations.length === 0)) {
        return { semesters: [], plan: {} };
    }

    const anchor = getAnchorSemester(rawGrades, rawRegistrations);
    const effectiveGrades = AcademicRulesEngine.resolveEffectiveGrades(rawGrades) as GradeRecord[];
    const semesterToCourseIds = new Map<string, string[]>();
    const registrationSemesterLabels = new Set<string>();

    const addCourseToSemester = (courseId: string, rawSemesterLabel: string, isRegistration = false) => {
        const parsedSemester = parseSemesterLabel(rawSemesterLabel);
        const semesterLabel = parsedSemester ? formatSemesterLabel(parsedSemester, anchor) : rawSemesterLabel;
        if (!courseId || !semesterLabel || !courseById.has(courseId)) return;

        if (!semesterToCourseIds.has(semesterLabel)) {
            semesterToCourseIds.set(semesterLabel, []);
        }

        const coursesInSemester = semesterToCourseIds.get(semesterLabel)!;
        if (!coursesInSemester.includes(courseId)) {
            coursesInSemester.push(courseId);
        }

        if (isRegistration) registrationSemesterLabels.add(semesterLabel);
    };

    effectiveGrades.forEach((grade) => {
        const courseId = String(grade.id || '').trim();
        const rawSemesterLabel = String(grade.semester || '').trim();
        const status = AcademicRulesEngine.getCourseStatus(courseId, rawGrades, hasBLMExemption);
        if (status === 'none') return;
        addCourseToSemester(courseId, rawSemesterLabel);
    });

    (rawRegistrations || []).forEach((registration) => {
        addCourseToSemester(
            String(registration.id || '').trim(),
            String(registration.semester || '').trim(),
            true
        );
    });

    const semesters = Array.from(semesterToCourseIds.keys())
        .sort((a, b) => {
            const sortA = getSemesterSortValue(a);
            const sortB = getSemesterSortValue(b);
            if (sortA !== sortB) return sortA - sortB;
            return a.localeCompare(b);
        })
        .map((label) => ({
            id: getSemesterId(label),
            label,
            isHistorical: true,
            isCurrent: registrationSemesterLabels.has(label),
        }));

    return {
        semesters,
        plan: Object.fromEntries(
            semesters.map((semester) => [
                semester.id,
                semesterToCourseIds.get(semester.label) || [],
            ])
        ),
    };
}

function getGenericSemesterIndex(semester: StudyPlanSemester): number | null {
    const studyPlanIndex = getStudyPlanSemesterIndex(semester.label);
    if (studyPlanIndex !== null) return studyPlanIndex;

    const labelMatch =
        semester.label.match(/^(?:nháp\s*)?học\s*kỳ\s*(\d+)/i) ||
        semester.label.match(/^(?:nhap\s*)?hoc\s*ky\s*(\d+)/i);
    const idMatch = semester.id.match(/^studyPlan-semester-(\d+)$/);
    const index = Number(labelMatch?.[1] || idMatch?.[1] || 0);
    return index > 0 ? index - 1 : null;
}

export function mergeHistoricalStudyPlan(previous: StudyPlanStorage, scaffold: StudyPlanSemester[], historical: StudyPlanStorage): StudyPlanStorage {
    const historicalCourseIds = new Set(Object.values(historical.plan).flat());
    const scaffoldById = new Map(scaffold.map((semester) => [semester.id, semester]));
    const scaffoldByLabel = new Map(scaffold.map((semester) => [semester.label, semester]));
    const editableSemesters = scaffold.filter((semester) => !semester.isHistorical);
    const mergedSemesters = [...historical.semesters];
    const mergedPlan: Record<string, string[]> = Object.fromEntries(
        historical.semesters.map((semester) => [semester.id, historical.plan[semester.id] || []])
    );
    const semesterIds = new Set(mergedSemesters.map((semester) => semester.id));

    previous.semesters.forEach((semester) => {
        if (semester.isHistorical) return;

        const parsed = parseSemesterLabel(semester.label);
        const canonicalLabel = parsed ? formatSemesterLabel(parsed, parsed) : null;
        const canonicalId = parsed ? getSemesterId(formatAcademicSemesterLabel(parsed)) : null;
        const genericIndex = getGenericSemesterIndex(semester);
        const targetSemester =
            (canonicalLabel ? scaffoldByLabel.get(canonicalLabel) : undefined) ||
            (canonicalId ? scaffoldById.get(canonicalId) : undefined) ||
            scaffoldById.get(semester.id) ||
            (genericIndex !== null ? editableSemesters[genericIndex] : undefined);

        const mergedSemester = targetSemester && !targetSemester.isHistorical ? targetSemester : semester;
        if (semesterIds.has(mergedSemester.id)) return;

        semesterIds.add(mergedSemester.id);
        mergedSemesters.push(mergedSemester);
        mergedPlan[mergedSemester.id] = [];

        (previous.plan[semester.id] || []).forEach((courseId) => {
            if (historicalCourseIds.has(courseId)) return;
            if (!mergedPlan[mergedSemester.id].includes(courseId)) {
                mergedPlan[mergedSemester.id].push(courseId);
            }
        });
    });

    return {
        semesters: mergedSemesters.sort((a, b) => getSemesterSortValue(a.label) - getSemesterSortValue(b.label)),
        plan: mergedPlan,
    };
}
