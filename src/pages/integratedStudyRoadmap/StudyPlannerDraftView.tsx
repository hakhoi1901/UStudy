import { useEffect, useMemo, useRef, useState, type CSSProperties, type DragEvent, type PointerEvent as ReactPointerEvent } from 'react';
import {
    AlertTriangle,
    CheckCircle2,
    ChevronDown,
    ChevronRight,
    ChevronUp,
    Clock,
    DatabaseBackup,
    Info,
    Plus,
    RotateCcw,
    Search,
    Trash2,
    X,
    XCircle,
} from 'lucide-react';
import { useDepartmentData } from '../../context/DepartmentContext';
import { readFromStorage, saveToStorage } from '../../helpers/localStorage/save';
import { STORAGE_KEYS } from '../../config';
import { AcademicRulesEngine } from '../../features/grades';

type CourseStatus = 'passed' | 'studying' | 'failed' | 'none';

interface CourseMeta {
    course_id: string;
    course_name_vi: string;
    credits: number;
    theory_hours: number;
    lab_hours: number;
    exercise_hours: number;
    course_type: string;
    category: string;
    description: string;
    status?: CourseStatus;
}

interface SemesterDraft {
    id: string;
    label: string;
    isHistorical?: boolean;
}

interface DraftStorage {
    semesters: SemesterDraft[];
    plan: Record<string, string[]>;
}

interface PrerequisiteRule {
    course_id: string;
    prereq_id: string;
    type: string;
}

interface GradeRecord {
    id: string;
    semester?: string;
    score?: string | number | null;
    type?: string;
}

interface ParsedSemester {
    yearStart: number;
    semester: number;
}

const DEFAULT_SEMESTER_COUNT = 12;
const DEFAULT_LEFT_PANEL_PERCENT = 68;
const MIN_LEFT_PANEL_PERCENT = 45;
const MAX_LEFT_PANEL_PERCENT = 78;

function clampPanelPercent(value: number): number {
    if (!Number.isFinite(value)) return DEFAULT_LEFT_PANEL_PERCENT;
    return Math.min(MAX_LEFT_PANEL_PERCENT, Math.max(MIN_LEFT_PANEL_PERCENT, Math.round(value)));
}

function getCurrentYearAnchor(): ParsedSemester {
    return { yearStart: new Date().getFullYear(), semester: 1 };
}

function toFullYear(rawYear: string): number {
    const year = Number(rawYear);
    return rawYear.length === 2 ? 2000 + year : year;
}

function parseSemesterLabel(label: string): ParsedSemester | null {
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

function getSemesterSequenceValue(semester: ParsedSemester): number {
    return semester.yearStart * 3 + semester.semester - 1;
}

function addSemesters(base: ParsedSemester, offset: number): ParsedSemester {
    const zeroBasedSemester = base.semester - 1 + offset;
    return {
        yearStart: base.yearStart + Math.floor(zeroBasedSemester / 3),
        semester: (zeroBasedSemester % 3) + 1,
    };
}

function formatAcademicSemesterLabel(semester: ParsedSemester): string {
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
    return offset % 3 + 1
}

function formatSemesterLabel(semester: ParsedSemester, anchor: ParsedSemester = semester): string {
    return `Kì ${getStudySemester(semester, anchor)} - Năm ${getStudyYear(semester, anchor)}`;
}

function getSemesterId(label: string): string {
    const parsed = parseSemesterLabel(label);
    const idLabel = parsed ? formatAcademicSemesterLabel(parsed) : label;
    return `semester-${normalizeSemesterId(idLabel)}`;
}

function createDefaultSemesters(anchor: ParsedSemester = getCurrentYearAnchor(), count = DEFAULT_SEMESTER_COUNT, historicalLabels = new Set<string>()): SemesterDraft[] {
    return Array.from({ length: count }, (_, index) => {
        const label = formatSemesterLabel(addSemesters(anchor, index), anchor);
        return {
            id: getSemesterId(label),
            label,
            isHistorical: historicalLabels.has(label),
        };
    });
}

function isDraftStorage(value: unknown): value is DraftStorage {
    if (!value || typeof value !== 'object') return false;
    const draft = value as DraftStorage;
    return Array.isArray(draft.semesters) && !!draft.plan && typeof draft.plan === 'object';
}

function normalizeSemesterId(label: string): string {
    return label
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '') || 'unknown';
}

function getSemesterSortValue(label: string): number {
    const semester = parseSemesterLabel(label);
    if (!semester) return Number.MAX_SAFE_INTEGER;
    return getSemesterSequenceValue(semester);
}

function getAnchorSemester(rawGrades: GradeRecord[] | undefined): ParsedSemester {
    const parsedSemesters = (rawGrades || [])
        .map((grade) => parseSemesterLabel(String(grade.semester || '')))
        .filter((semester): semester is ParsedSemester => !!semester);

    if (parsedSemesters.length === 0) return getCurrentYearAnchor();

    return parsedSemesters.reduce((earliest, current) => (
        getSemesterSequenceValue(current) < getSemesterSequenceValue(earliest) ? current : earliest
    ));
}

function buildHistoricalDraft(rawGrades: GradeRecord[] | undefined, courseById: Map<string, CourseMeta>, hasBLMExemption: boolean): DraftStorage {
    if (!rawGrades || rawGrades.length === 0) {
        return { semesters: [], plan: {} };
    }

    const anchor = getAnchorSemester(rawGrades);
    const effectiveGrades = AcademicRulesEngine.resolveEffectiveGrades(rawGrades) as GradeRecord[];
    const semesterToCourseIds = new Map<string, string[]>();

    effectiveGrades.forEach((grade) => {
        const courseId = String(grade.id || '').trim();
        const rawSemesterLabel = String(grade.semester || '').trim();
        const parsedSemester = parseSemesterLabel(rawSemesterLabel);
        const semesterLabel = parsedSemester ? formatSemesterLabel(parsedSemester, anchor) : rawSemesterLabel;
        if (!courseId || !semesterLabel || !courseById.has(courseId)) return;

        const status = AcademicRulesEngine.getCourseStatus(courseId, rawGrades, hasBLMExemption);
        if (status === 'none') return;

        if (!semesterToCourseIds.has(semesterLabel)) {
            semesterToCourseIds.set(semesterLabel, []);
        }

        const coursesInSemester = semesterToCourseIds.get(semesterLabel)!;
        if (!coursesInSemester.includes(courseId)) {
            coursesInSemester.push(courseId);
        }
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

function getGenericSemesterIndex(semester: SemesterDraft): number | null {
    const labelMatch =
        semester.label.match(/^(?:nháp\s*)?học\s*kỳ\s*(\d+)/i) ||
        semester.label.match(/^(?:nhap\s*)?hoc\s*ky\s*(\d+)/i);
    const idMatch = semester.id.match(/^draft-semester-(\d+)$/);
    const index = Number(labelMatch?.[1] || idMatch?.[1] || 0);
    return index > 0 ? index - 1 : null;
}

function mergeHistoricalDraft(previous: DraftStorage, scaffold: SemesterDraft[], historical: DraftStorage): DraftStorage {
    const historicalCourseIds = new Set(Object.values(historical.plan).flat());
    const historicalPlan = historical.plan;
    const scaffoldById = new Map(scaffold.map((semester) => [semester.id, semester]));
    const scaffoldByLabel = new Map(scaffold.map((semester) => [semester.label, semester]));
    const editableSemesters = scaffold.filter((semester) => !semester.isHistorical);

    const mergedPlan: Record<string, string[]> = Object.fromEntries(
        scaffold.map((semester) => [
            semester.id,
            semester.isHistorical ? (historicalPlan[semester.id] || []) : [],
        ])
    );

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

        if (!targetSemester || targetSemester.isHistorical) return;

        (previous.plan[semester.id] || []).forEach((courseId) => {
            if (historicalCourseIds.has(courseId)) return;
            if (!mergedPlan[targetSemester.id].includes(courseId)) {
                mergedPlan[targetSemester.id].push(courseId);
            }
        });
    });

    return {
        semesters: scaffold,
        plan: mergedPlan,
    };
}

function StatusBadge({
    status,
    rootCompleted = false,
    isPlanned = false,
}: {
    status: CourseStatus;
    rootCompleted?: boolean;
    isPlanned?: boolean;
}) {
    if (isPlanned) {
        return (
            <span className="flex items-center justify-center gap-1 w-full px-1 md:px-2 py-0.5 md:py-1 bg-indigo-100 text-indigo-700 text-[9px] md:text-xs rounded-full font-medium whitespace-nowrap">
                <CheckCircle2 className="w-3 h-3 md:w-3.5 md:h-3.5 flex-shrink-0" />
                <span className="hidden md:inline">Đã lên lịch</span>
                <span className="md:hidden">Đã lịch</span>
            </span>
        );
    }

    if (status === 'passed') {
        return (
            <span className="flex items-center justify-center gap-1 w-full px-1 md:px-2 py-0.5 md:py-1 bg-green-100 text-green-700 text-[9px] md:text-xs rounded-full font-medium whitespace-nowrap">
                <CheckCircle2 className="w-3 h-3 md:w-3.5 md:h-3.5 flex-shrink-0" />
                <span className="hidden md:inline">Đã tích lũy</span>
                <span className="md:hidden">Đạt</span>
            </span>
        );
    }

    if (status === 'studying') {
        return (
            <span className="flex items-center justify-center gap-1 w-full px-1 md:px-2 py-0.5 md:py-1 bg-blue-100 text-[#004A98] text-[9px] md:text-xs rounded-full font-medium whitespace-nowrap">
                <Clock className="w-3 h-3 md:w-3.5 md:h-3.5 flex-shrink-0" />
                Đang học
            </span>
        );
    }

    if (status === 'failed') {
        return (
            <span className="flex items-center justify-center gap-1 w-full px-1 md:px-2 py-0.5 md:py-1 bg-red-100 text-red-700 text-[9px] md:text-xs rounded-full font-medium whitespace-nowrap">
                <XCircle className="w-3 h-3 md:w-3.5 md:h-3.5 flex-shrink-0" />
                Học lại
            </span>
        );
    }

    if (rootCompleted) {
        return (
            <span className="flex items-center justify-center gap-1 w-full px-1 md:px-2 py-0.5 md:py-1 bg-green-100 text-green-700 text-[9px] md:text-xs rounded-full font-medium whitespace-nowrap">
                Hoàn thành
            </span>
        );
    }

    return (
        <span className="block w-full text-center px-1 md:px-2 py-0.5 md:py-1 bg-gray-100 text-gray-500 text-[9px] md:text-xs rounded-full font-medium whitespace-nowrap">
            <span className="hidden md:inline">Chưa học</span>
            <span className="md:hidden">Chưa</span>
        </span>
    );
}

function DraftCourseRow({
    course,
    isPlanned,
    rootCompleted = false,
    onDragStart,
    onRemoveFromPlan,
}: {
    course: CourseMeta;
    isPlanned: boolean;
    rootCompleted?: boolean;
    onDragStart: (courseId: string, event: DragEvent<HTMLDivElement>) => void;
    onRemoveFromPlan: (courseId: string) => void;
}) {
    const [showDetails, setShowDetails] = useState(false);
    const status = course.status || 'none';
    const isLocked = status === 'passed' || status === 'studying' || rootCompleted;
    const getContainerStyle = () => {
        if (isPlanned) return 'border-indigo-200 bg-indigo-50/80 hover:bg-indigo-100 shadow-sm';
        if (status === 'passed' || rootCompleted) return 'border-green-300 bg-green-50/80 hover:bg-green-100 shadow-sm';
        if (status === 'failed') return 'border-red-200 bg-red-50 hover:bg-red-100';
        if (status === 'studying') return 'border-blue-200 bg-blue-50/50 hover:bg-blue-50';
        return 'border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300';
    };

    return (
        <div className="group">
            <div
                draggable={!isLocked}
                onClick={() => setShowDetails((value) => !value)}
                onDragStart={(event) => onDragStart(course.course_id, event)}
                className={`flex items-center gap-1.5 md:gap-3 px-2 md:px-4 py-2 md:py-2.5 border rounded-lg transition-all ${getContainerStyle()} ${isLocked ? 'cursor-pointer' : 'cursor-grab active:cursor-grabbing'}`}
            >
                <div className="flex-1 min-w-0 flex flex-col md:flex-row md:items-center gap-0.5 md:gap-3">
                    <div className="md:w-24 flex-shrink-0">
                        <p className="text-[11px] md:text-sm font-semibold text-gray-900 leading-tight md:leading-normal">
                            {course.course_id}
                        </p>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-[10px] md:text-sm text-gray-500 md:text-gray-900 truncate font-medium leading-tight md:leading-normal">
                            {course.course_name_vi}
                        </p>
                    </div>
                </div>

                <div className="hidden md:block w-16 flex-shrink-0 text-center">
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded font-medium whitespace-nowrap">
                        {course.credits} TC
                    </span>
                </div>

                <div className="hidden md:block w-10 flex-shrink-0">
                    <span className="px-1 py-1 bg-gray-100 text-gray-700 text-xs rounded-md font-medium inline-block truncate w-full text-center" title={course.course_type}>
                        {course.course_type || '-'}
                    </span>
                </div>

                <div className="hidden flex-shrink-0 md:block">
                    <div className="w-28">
                        <StatusBadge status={status} rootCompleted={rootCompleted} isPlanned={isPlanned} />
                    </div>
                </div>

                <div className="flex items-center flex-shrink-0">
                    {isPlanned && (
                        <button
                            type="button"
                            onClick={(event) => {
                                event.stopPropagation();
                                onRemoveFromPlan(course.course_id);
                            }}
                            className="p-1 md:p-1.5 hover:bg-red-50 rounded transition-colors text-gray-500 hover:text-red-600"
                            title="Xóa khỏi kế hoạch"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={(event) => {
                            event.stopPropagation();
                            setShowDetails((value) => !value);
                        }}
                        className="p-1 md:p-1.5 hover:bg-gray-200/60 rounded transition-colors"
                        title="Xem chi tiết"
                    >
                        {showDetails ? (
                            <ChevronUp className="w-4 h-4 text-gray-600" />
                        ) : (
                            <ChevronDown className="w-4 h-4 text-gray-600" />
                        )}
                    </button>
                </div>
            </div>

            {showDetails && (
                <div className="mt-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-3 text-sm">
                    <div className="grid grid-cols-2 gap-3 border-b border-gray-200 pb-3 md:grid-cols-4">
                        <div>
                            <p className="text-[10px] font-medium uppercase text-gray-500">Tín chỉ</p>
                            <p className="mt-1 text-xs font-semibold text-gray-900">{course.credits} TC</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-medium uppercase text-gray-500">Loại môn</p>
                            <p className="mt-1 text-xs font-semibold text-gray-900">{course.course_type || '-'}</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-medium uppercase text-gray-500">Trạng thái</p>
                            <div className="mt-1">
                                <StatusBadge status={status} rootCompleted={rootCompleted} isPlanned={isPlanned} />
                            </div>
                        </div>
                        <div>
                            <p className="text-[10px] font-medium uppercase text-gray-500">Danh mục</p>
                            <p className="mt-1 truncate text-xs font-semibold text-gray-900">{course.category || '-'}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 border-b border-gray-200 py-3">
                        <div>
                            <p className="text-[10px] font-medium uppercase text-gray-500">Lý thuyết</p>
                            <p className="mt-1 text-xs font-semibold text-gray-900">{course.theory_hours || 0} tiết</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-medium uppercase text-gray-500">Thực hành</p>
                            <p className="mt-1 text-xs font-semibold text-gray-900">{course.lab_hours || 0} tiết</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-medium uppercase text-gray-500">Bài tập</p>
                            <p className="mt-1 text-xs font-semibold text-gray-900">{course.exercise_hours || 0} tiết</p>
                        </div>
                    </div>

                    <div className="pt-3">
                        <p className="text-[10px] font-medium uppercase text-gray-500">Ghi chú từ CTĐT</p>
                        <p className="mt-1 text-xs leading-relaxed text-gray-700">
                            {course.description || 'Chưa có ghi chú cho môn học này.'}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}

function getRequiredCredits(category: any): number {
    return category.total_credits_required || category.credits || category.credits_required || 0;
}

function getCoursePlanCredits(course: CourseMeta, manuallyPlannedCourseIds: Set<string>, includeAccumulationExcluded: boolean): { earnedCredits: number; plannedCredits: number } {
    if (!includeAccumulationExcluded && AcademicRulesEngine.isCourseExcludedFromAccumulation(course.course_id)) {
        return { earnedCredits: 0, plannedCredits: 0 };
    }

    const credits = Number(course.credits) || 0;
    if (course.status === 'passed') return { earnedCredits: credits, plannedCredits: 0 };
    if (
        course.status === 'studying' ||
        (manuallyPlannedCourseIds.has(course.course_id) && course.status !== 'passed' && course.status !== 'studying')
    ) {
        return { earnedCredits: 0, plannedCredits: credits };
    }

    return { earnedCredits: 0, plannedCredits: 0 };
}

function sumCoursePlanCredits(courses: CourseMeta[], manuallyPlannedCourseIds: Set<string>, includeAccumulationExcluded: boolean): { earnedCredits: number; plannedCredits: number } {
    return courses.reduce((total, course) => {
        const courseCredits = getCoursePlanCredits(course, manuallyPlannedCourseIds, includeAccumulationExcluded);
        return {
            earnedCredits: total.earnedCredits + courseCredits.earnedCredits,
            plannedCredits: total.plannedCredits + courseCredits.plannedCredits,
        };
    }, { earnedCredits: 0, plannedCredits: 0 });
}

function getCategoryCreditProgress(category: any, manuallyPlannedCourseIds: Set<string>): { earnedCredits: number; plannedCredits: number } {
    let earnedCredits = 0;
    let plannedCredits = 0;
    const countExcludedInThisCategory = Boolean(category.name && AcademicRulesEngine.isCategoryExcludedFromAccumulation(category.name));

    if (category.allCoursesData || category.coursesData) {
        const coursesForCredits = (category.allCoursesData || category.coursesData) as CourseMeta[];
        const ownProgress = sumCoursePlanCredits(coursesForCredits, manuallyPlannedCourseIds, countExcludedInThisCategory);
        earnedCredits += ownProgress.earnedCredits;
        plannedCredits += ownProgress.plannedCredits;
    }

    if (category.breakdown) {
        Object.values(category.breakdown).forEach((child: any) => {
            const childProgress = getCategoryCreditProgress(child, manuallyPlannedCourseIds);
            const childEarnedCredits = childProgress.earnedCredits;
            const childPlannedCredits = childProgress.plannedCredits;
            earnedCredits += childEarnedCredits;
            plannedCredits += childPlannedCredits;

            if (child.name && AcademicRulesEngine.isCategoryExcludedFromAccumulation(child.name)) {
                earnedCredits -= childEarnedCredits;
                plannedCredits -= childPlannedCredits;
            }
        });
    }

    if (Array.isArray(category.options)) {
        category.options.forEach((option: any) => {
            const optionCourses = (option.allCoursesData || option.coursesData || []) as CourseMeta[];
            const optionProgress = sumCoursePlanCredits(optionCourses, manuallyPlannedCourseIds, countExcludedInThisCategory);
            const optionEarnedCredits = optionProgress.earnedCredits;
            const optionPlannedCredits = optionProgress.plannedCredits;

            if (optionEarnedCredits + optionPlannedCredits > earnedCredits + plannedCredits) {
                earnedCredits = optionEarnedCredits;
                plannedCredits = optionPlannedCredits;
            }
        });
    }

    return { earnedCredits, plannedCredits };
}

function DraftCategoryNode({
    category,
    depth = 0,
    manuallyPlannedCourseIds,
    onDragStart,
    onRemoveFromPlan,
}: {
    category: any;
    depth?: number;
    manuallyPlannedCourseIds: Set<string>;
    onDragStart: (courseId: string, event: DragEvent<HTMLDivElement>) => void;
    onRemoveFromPlan: (courseId: string) => void;
}) {
    const [isExpanded, setIsExpanded] = useState(true);
    const coursesToRender = (category.coursesData || []) as CourseMeta[];
    const childCategories = category.breakdown ? Object.entries(category.breakdown) : [];
    const optionCategories = Array.isArray(category.options) ? category.options : [];
    const requiredCredits = getRequiredCredits(category);
    const { earnedCredits, plannedCredits } = getCategoryCreditProgress(category, manuallyPlannedCourseIds);
    const displayCredits = earnedCredits + plannedCredits;
    const isCompleted = requiredCredits > 0 && earnedCredits >= requiredCredits;
    const hasContent =
        coursesToRender.length > 0 ||
        childCategories.length > 0 ||
        optionCategories.some((option: any) => option.coursesData?.length > 0);

    if (!hasContent) return null;

    return (
        <div className={depth === 0 ? 'rounded-xl border border-gray-200 bg-white p-3 shadow-sm md:p-4' : 'border-l-2 border-gray-100 pl-3'}>
            <button
                type="button"
                onClick={() => setIsExpanded((value) => !value)}
                className="flex w-full items-start gap-2 text-left"
            >
                {isExpanded ? (
                    <ChevronDown className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-500" />
                ) : (
                    <ChevronRight className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-500" />
                )}
                <div className="min-w-0 flex-1">
                    <h3 className={`${depth === 0 ? 'text-sm font-bold text-[#004A98]' : 'text-sm font-semibold text-gray-800'} flex items-center gap-1.5`}>
                        {category.name || 'Danh mục chưa tên'}
                        {isCompleted && <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-green-500" />}
                    </h3>
                    {category.note && <p className="mt-0.5 text-xs text-gray-500">{category.note}</p>}
                </div>
                {requiredCredits > 0 && (
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${isCompleted ? 'bg-green-100 text-green-700' : 'bg-[#004A98] text-white'}`}>
                        {displayCredits} / {requiredCredits} TC
                    </span>
                )}
            </button>

            {isExpanded && (
                <div className="mt-3 space-y-3">
                    {coursesToRender.length > 0 && (
                        <div className="space-y-2">
                            {coursesToRender.map((course) => (
                                <DraftCourseRow
                                    key={course.course_id}
                                    course={course}
                                    isPlanned={manuallyPlannedCourseIds.has(course.course_id)}
                                    rootCompleted={isCompleted}
                                    onDragStart={onDragStart}
                                    onRemoveFromPlan={onRemoveFromPlan}
                                />
                            ))}
                        </div>
                    )}

                    {optionCategories.map((option: any, index: number) => {
                        const optionCourses = (option.coursesData || []) as CourseMeta[];
                        if (optionCourses.length === 0) return null;
                        const optionRequiredCredits = Number(option.credits) || 0;
                        const optionProgress = sumCoursePlanCredits(
                            (option.allCoursesData || option.coursesData || []) as CourseMeta[],
                            manuallyPlannedCourseIds,
                            Boolean(category.name && AcademicRulesEngine.isCategoryExcludedFromAccumulation(category.name))
                        );
                        const optionEarnedCredits = optionProgress.earnedCredits;
                        const optionPlannedCredits = optionProgress.plannedCredits;
                        const optionDisplayCredits = optionEarnedCredits + optionPlannedCredits;
                        const optionCompleted = optionRequiredCredits > 0 && optionEarnedCredits >= optionRequiredCredits;

                        return (
                            <div key={`${option.type || 'option'}-${index}`} className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                                <div className="mb-2 flex flex-wrap items-center gap-2 text-xs font-semibold text-gray-700">
                                    <span>Lựa chọn {index + 1}</span>
                                    {optionRequiredCredits > 0 && (
                                        <span className={`rounded-full px-2 py-0.5 text-[10px] ${optionCompleted ? 'bg-green-100 text-green-700' : 'bg-white text-gray-600'}`}>
                                            {optionDisplayCredits} / {optionRequiredCredits} TC
                                        </span>
                                    )}
                                    {optionCompleted && (
                                        <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-[10px] text-green-700">
                                            <CheckCircle2 className="h-3 w-3" />
                                            Hoàn thành
                                        </span>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    {optionCourses.map((course) => (
                                        <DraftCourseRow
                                            key={course.course_id}
                                            course={course}
                                            isPlanned={manuallyPlannedCourseIds.has(course.course_id)}
                                            rootCompleted={optionCompleted}
                                            onDragStart={onDragStart}
                                            onRemoveFromPlan={onRemoveFromPlan}
                                        />
                                    ))}
                                </div>
                            </div>
                        );
                    })}

                    {childCategories.map(([key, child]) => (
                        <DraftCategoryNode
                            key={String(key)}
                            category={child}
                            depth={depth + 1}
                            manuallyPlannedCourseIds={manuallyPlannedCourseIds}
                            onDragStart={onDragStart}
                            onRemoveFromPlan={onRemoveFromPlan}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

export function StudyPlannerDraftView() {
    const { data: { courses, categories, prerequisites } } = useDepartmentData() as ReturnType<typeof useDepartmentData> & {
        data: ReturnType<typeof useDepartmentData>['data'] & { prerequisites: PrerequisiteRule[] };
    };
    const layoutRef = useRef<HTMLDivElement>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeDropId, setActiveDropId] = useState<string | null>(null);
    const [isResizingLayout, setIsResizingLayout] = useState(false);
    const [leftPanelPercent, setLeftPanelPercent] = useState(() => {
        const saved = readFromStorage<number>(STORAGE_KEYS.STUDY_PLAN_DRAFT_LAYOUT, DEFAULT_LEFT_PANEL_PERCENT);
        return clampPanelPercent(saved);
    });
    const [draft, setDraft] = useState<DraftStorage>(() => {
        const saved = readFromStorage<unknown>(STORAGE_KEYS.STUDY_PLAN_DRAFT, null);
        if (isDraftStorage(saved)) return saved;

        const semesters = createDefaultSemesters();
        return {
            semesters,
            plan: Object.fromEntries(semesters.map((semester) => [semester.id, []])),
        };
    });

    const studentDb = useMemo(() => readFromStorage<any>(STORAGE_KEYS.STUDENT_DB, null), []);
    const hasBLMExemption = useMemo(() => {
        if (!studentDb?.grades) return false;
        return AcademicRulesEngine.checkBLMExemption(studentDb.grades);
    }, [studentDb]);

    const getCourseStatus = useMemo(() => (courseId: string): CourseStatus => {
        if (!studentDb?.grades) return 'none';
        return AcademicRulesEngine.getCourseStatus(courseId, studentDb.grades, hasBLMExemption);
    }, [studentDb, hasBLMExemption]);

    const courseById = useMemo(() => {
        return new Map(courses.map((course: CourseMeta) => [course.course_id, course]));
    }, [courses]);

    const historicalDraft = useMemo(() => {
        return buildHistoricalDraft(studentDb?.grades, courseById, hasBLMExemption);
    }, [courseById, hasBLMExemption, studentDb]);

    const semesterScaffold = useMemo(() => {
        const anchor = getAnchorSemester(studentDb?.grades);
        const historicalLabels = new Set(historicalDraft.semesters.map((semester) => semester.label));
        return createDefaultSemesters(anchor, DEFAULT_SEMESTER_COUNT, historicalLabels);
    }, [historicalDraft.semesters, studentDb]);

    useEffect(() => {
        setDraft((previous) => mergeHistoricalDraft(previous, semesterScaffold, historicalDraft));
    }, [historicalDraft, semesterScaffold]);

    useEffect(() => {
        saveToStorage(STORAGE_KEYS.STUDY_PLAN_DRAFT, draft);
    }, [draft]);

    useEffect(() => {
        saveToStorage(STORAGE_KEYS.STUDY_PLAN_DRAFT_LAYOUT, leftPanelPercent);
    }, [leftPanelPercent]);

    const plannedCourseIds = useMemo(() => {
        return new Set(Object.values(draft.plan).flat());
    }, [draft.plan]);

    const manuallyPlannedCourseIds = useMemo(() => {
        const ids = new Set<string>();

        draft.semesters
            .filter((semester) => !semester.isHistorical)
            .forEach((semester) => {
                (draft.plan[semester.id] || []).forEach((courseId) => {
                    const status = getCourseStatus(courseId);
                    if (status !== 'passed' && status !== 'studying') {
                        ids.add(courseId);
                    }
                });
            });

        return ids;
    }, [draft.plan, draft.semesters, getCourseStatus]);

    const getAccumulationCredits = useMemo(() => (courseId: string) => {
        const course = courseById.get(courseId);
        if (!course || AcademicRulesEngine.isCourseExcludedFromAccumulation(courseId)) return 0;
        return Number(course.credits) || 0;
    }, [courseById]);

    const plannedStats = useMemo(() => {
        const totalCredits = Array.from(plannedCourseIds).reduce((sum, courseId) => {
            return sum + getAccumulationCredits(courseId);
        }, 0);

        return {
            courses: plannedCourseIds.size,
            credits: totalCredits,
        };
    }, [getAccumulationCredits, plannedCourseIds]);

    const prereqByCourse = useMemo(() => {
        const map = new Map<string, PrerequisiteRule[]>();
        prerequisites.forEach((rule) => {
            if (!map.has(rule.course_id)) map.set(rule.course_id, []);
            map.get(rule.course_id)!.push(rule);
        });
        return map;
    }, [prerequisites]);

    const getMissingPrerequisites = (courseId: string, semesterIndex: number) => {
        const rules = prereqByCourse.get(courseId) || [];
        if (rules.length === 0) return [];

        const completedBefore = new Set<string>();
        draft.semesters.slice(0, semesterIndex).forEach((semester) => {
            (draft.plan[semester.id] || []).forEach((plannedId) => completedBefore.add(plannedId));
        });

        return rules
            .filter((rule) => !completedBefore.has(rule.prereq_id))
            .map((rule) => rule.prereq_id);
    };

    const preprocessedCategories = useMemo(() => {
        const lowerSearch = searchTerm.trim().toLowerCase();

        const attachCoursesData = (category: any): any => {
            const processedCategory = { ...category };
            const buildCourseList = (courseIds: string[]) =>
                courseIds
                    .map((id) => courseById.get(id))
                    .filter((course): course is CourseMeta => !!course)
                    .map((course) => ({ ...course, status: getCourseStatus(course.course_id) }));

            const filterCourseList = (courseList: CourseMeta[]) => {
                if (!lowerSearch) return courseList;

                return courseList.filter((course) => (
                    course.course_id.toLowerCase().includes(lowerSearch) ||
                    course.course_name_vi.toLowerCase().includes(lowerSearch)
                ));
            };

            if (Array.isArray(processedCategory.courses)) {
                const allCoursesData = buildCourseList(processedCategory.courses);
                processedCategory.allCoursesData = allCoursesData;
                processedCategory.coursesData = filterCourseList(allCoursesData);
            }

            if (processedCategory.breakdown) {
                processedCategory.breakdown = Object.entries(processedCategory.breakdown).reduce((acc: Record<string, any>, [key, child]) => {
                    acc[key] = attachCoursesData(child);
                    return acc;
                }, {});
            }

            if (Array.isArray(processedCategory.options)) {
                processedCategory.options = processedCategory.options.map((option: any) => {
                    if (!Array.isArray(option.courses)) return option;
                    const allCoursesData = buildCourseList(option.courses);
                    return {
                        ...option,
                        allCoursesData,
                        coursesData: filterCourseList(allCoursesData),
                    };
                });
            }

            return processedCategory;
        };

        return Object.entries(categories).reduce((acc: Record<string, any>, [key, category]) => {
            acc[key] = attachCoursesData(category);
            return acc;
        }, {});
    }, [categories, courseById, getCourseStatus, searchTerm]);

    const handleDragStart = (courseId: string, event: DragEvent<HTMLDivElement>) => {
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData('text/plain', courseId);
    };

    const addCourseToSemester = (courseId: string, semesterId: string) => {
        if (!courseById.has(courseId)) return;
        if (draft.semesters.find((semester) => semester.id === semesterId)?.isHistorical) return;
        const status = getCourseStatus(courseId);
        if (status === 'passed' || status === 'studying') return;

        setDraft((previous) => ({
            ...previous,
            plan: Object.fromEntries(
                previous.semesters.map((semester) => {
                    const currentCourseIds = previous.plan[semester.id] || [];
                    const withoutCourse = semester.isHistorical
                        ? currentCourseIds
                        : currentCourseIds.filter((id) => id !== courseId);
                    return [
                        semester.id,
                        semester.id === semesterId ? [...withoutCourse, courseId] : withoutCourse,
                    ];
                })
            ),
        }));
    };

    const removeCourseFromPlan = (courseId: string) => {
        setDraft((previous) => ({
            ...previous,
            plan: Object.fromEntries(
                previous.semesters.map((semester) => [
                    semester.id,
                    semester.isHistorical
                        ? (previous.plan[semester.id] || [])
                        : (previous.plan[semester.id] || []).filter((id) => id !== courseId),
                ])
            ),
        }));
    };

    const removeCourseFromSemester = (courseId: string, semesterId: string) => {
        if (draft.semesters.find((semester) => semester.id === semesterId)?.isHistorical) return;

        setDraft((previous) => ({
            ...previous,
            plan: {
                ...previous.plan,
                [semesterId]: (previous.plan[semesterId] || []).filter((id) => id !== courseId),
            },
        }));
    };

    const addSemester = () => {
        setDraft((previous) => {
            const parsedSemesters = previous.semesters
                .map((semester) => parseSemesterLabel(semester.label))
                .filter((semester): semester is ParsedSemester => !!semester);
            const sortedSemesters = parsedSemesters.sort((a, b) => getSemesterSequenceValue(a) - getSemesterSequenceValue(b));
            const anchorSemester = sortedSemesters[0] || getAnchorSemester(studentDb?.grades);
            const lastParsedSemester = sortedSemesters[sortedSemesters.length - 1];
            const nextSemester = addSemesters(lastParsedSemester || anchorSemester, lastParsedSemester ? 1 : previous.semesters.length);
            const label = formatSemesterLabel(nextSemester, anchorSemester);
            const newSemester = {
                id: getSemesterId(label),
                label,
            };

            return {
                semesters: [...previous.semesters, newSemester],
                plan: {
                    ...previous.plan,
                    [newSemester.id]: [],
                },
            };
        });
    };

    const clearDraft = () => {
        setDraft((previous) => ({
            ...previous,
            plan: Object.fromEntries(previous.semesters.map((semester) => [
                semester.id,
                semester.isHistorical ? (historicalDraft.plan[semester.id] || previous.plan[semester.id] || []) : [],
            ])),
        }));
    };

    const updateLayoutWidth = (clientX: number) => {
        const rect = layoutRef.current?.getBoundingClientRect();
        if (!rect || rect.width <= 0) return;
        const nextPercent = ((clientX - rect.left) / rect.width) * 100;
        setLeftPanelPercent(clampPanelPercent(nextPercent));
    };

    const handleLayoutResizeStart = (event: ReactPointerEvent<HTMLButtonElement>) => {
        event.preventDefault();
        setIsResizingLayout(true);
        updateLayoutWidth(event.clientX);

        const handlePointerMove = (moveEvent: PointerEvent) => {
            updateLayoutWidth(moveEvent.clientX);
        };

        const handlePointerUp = () => {
            setIsResizingLayout(false);
            document.removeEventListener('pointermove', handlePointerMove);
            document.removeEventListener('pointerup', handlePointerUp);
        };

        document.addEventListener('pointermove', handlePointerMove);
        document.addEventListener('pointerup', handlePointerUp);
    };

    const layoutStyle = {
        '--draft-planner-grid-template': `minmax(320px, ${leftPanelPercent}fr) 1rem minmax(300px, ${100 - leftPanelPercent}fr)`,
    } as CSSProperties & Record<string, string>;

    if (courses.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-blue-200 bg-white p-8 shadow-sm">
                <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-blue-50 shadow-sm ring-4 ring-white">
                    <DatabaseBackup className="h-10 w-10 text-blue-500" />
                </div>
                <h2 className="mb-2 text-xl font-bold text-gray-900">Đang cập nhật dữ liệu</h2>
                <p className="max-w-md text-center leading-relaxed text-gray-500">
                    Chương trình đào tạo cho chuyên ngành và khóa học này hiện đang trong quá trình thu thập.
                </p>
            </div>
        );
    }

    return (
        <div
            ref={layoutRef}
            style={layoutStyle}
            className={`animate-in fade-in grid gap-y-5 duration-500 lg:gap-x-0 lg:[grid-template-columns:var(--draft-planner-grid-template)] ${isResizingLayout ? 'select-none' : ''}`}
        >
            <section className="min-w-0 lg:pr-3">
                <div className="mb-4 flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4 shadow-sm">
                    <Info className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#004A98]" />
                    <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-bold text-[#004A98]">Bản nháp kế hoạch học tập</h3>
                        <p className="mt-1 text-sm text-blue-800/80">
                            Kéo môn chưa học từ chương trình đào tạo sang từng học kỳ ở khung bên phải để phác thảo lộ trình tương lai. Tiến độ tín chỉ trong tab này tạm tính cả môn đã tích lũy, môn đang học và môn đã lên lịch trong bản nháp. Môn không tính tín chỉ tích lũy như BAA0002 vẫn hiện trong nhóm/học kỳ, nhưng không cộng lên tổng.
                        </p>
                    </div>
                </div>

                <div className="mb-5 flex flex-col gap-3 sm:flex-row">
                    <div className="relative flex-1">
                        <Search className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm theo mã môn hoặc tên môn..."
                            value={searchTerm}
                            onChange={(event) => setSearchTerm(event.target.value)}
                            className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-10 text-sm shadow-sm transition-all focus:border-[#004A98] focus:outline-none focus:ring-2 focus:ring-[#004A98]/20"
                        />
                        {searchTerm && (
                            <button
                                type="button"
                                onClick={() => setSearchTerm('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 transition-colors hover:bg-gray-100"
                            >
                                <X className="h-4 w-4 text-gray-500" />
                            </button>
                        )}
                    </div>
                </div>

                <div className="space-y-4">
                    {Object.entries(preprocessedCategories).map(([key, category]) => (
                        <DraftCategoryNode
                            key={key}
                            category={category}
                            manuallyPlannedCourseIds={manuallyPlannedCourseIds}
                            onDragStart={handleDragStart}
                            onRemoveFromPlan={removeCourseFromPlan}
                        />
                    ))}
                </div>
            </section>

            <div className="hidden items-stretch justify-center lg:flex">
                <button
                    type="button"
                    onPointerDown={handleLayoutResizeStart}
                    className={`group flex h-full min-h-[28rem] w-4 cursor-col-resize items-center justify-center rounded-lg transition-colors ${isResizingLayout ? 'bg-blue-50' : 'hover:bg-gray-100'}`}
                    title="Kéo để chỉnh chiều rộng"
                    aria-label="Kéo để chỉnh chiều rộng danh sách môn và khung học kỳ"
                >
                    <span className={`h-14 w-1 rounded-full transition-colors ${isResizingLayout ? 'bg-[#004A98]' : 'bg-gray-300 group-hover:bg-gray-400'}`} />
                </button>
            </div>

            <aside className="lg:sticky lg:top-0 lg:max-h-[calc(100vh-11rem)] lg:pl-3">
                <div className="flex h-full flex-col rounded-xl border border-gray-200 bg-white shadow-sm">
                    <div className="border-b border-gray-100 p-4">
                        <div className="mb-3 flex items-start justify-between gap-3">
                            <div>
                                <h2 className="text-base font-bold text-gray-900">Khung học kỳ</h2>
                                <p className="mt-0.5 text-xs text-gray-500">
                                    {plannedStats.courses} môn · {plannedStats.credits} tín chỉ tích lũy
                                </p>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <button
                                    type="button"
                                    onClick={addSemester}
                                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-700 transition-colors hover:bg-gray-50"
                                    title="Thêm học kỳ"
                                >
                                    <Plus className="h-4 w-4" />
                                </button>
                                <button
                                    type="button"
                                    onClick={clearDraft}
                                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-700 transition-colors hover:bg-gray-50"
                                    title="Xóa nháp"
                                >
                                    <RotateCcw className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                        <p className="rounded-lg bg-gray-50 px-3 py-2 text-xs leading-relaxed text-gray-600">
                            Các học kỳ đã/đang học được tự điền từ dữ liệu điểm. Môn thiếu tiên quyết sẽ hiện cảnh báo ngay trong học kỳ.
                        </p>
                    </div>

                    <div className="flex-1 space-y-3 overflow-y-auto p-4">
                        {draft.semesters.map((semester, semesterIndex) => {
                            const plannedIds = draft.plan[semester.id] || [];
                            const totalCredits = plannedIds.reduce((sum, courseId) => sum + getAccumulationCredits(courseId), 0);
                            const warningCount = plannedIds.filter((courseId) => getMissingPrerequisites(courseId, semesterIndex).length > 0).length;

                            return (
                                <div
                                    key={semester.id}
                                    onDragOver={(event) => {
                                        if (semester.isHistorical) return;
                                        event.preventDefault();
                                        setActiveDropId(semester.id);
                                    }}
                                    onDragLeave={() => setActiveDropId(null)}
                                    onDrop={(event) => {
                                        if (semester.isHistorical) return;
                                        event.preventDefault();
                                        const courseId = event.dataTransfer.getData('text/plain');
                                        addCourseToSemester(courseId, semester.id);
                                        setActiveDropId(null);
                                    }}
                                    className={`rounded-lg border bg-gray-50 p-3 transition-all ${activeDropId === semester.id
                                        ? 'border-[#004A98] bg-blue-50 ring-2 ring-[#004A98]/15'
                                        : 'border-gray-200'
                                        }`}
                                >
                                    <div className="mb-2 flex items-center justify-between gap-2">
                                        <div>
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h3 className="text-sm font-bold text-gray-900">{semester.label}</h3>
                                                {semester.isHistorical && (
                                                    <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-medium text-[#004A98]">
                                                        Từ dữ liệu
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-500">
                                                {plannedIds.length} môn · {totalCredits} TC tích lũy
                                            </p>
                                        </div>
                                        {warningCount > 0 && (
                                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-700">
                                                <AlertTriangle className="h-3 w-3" />
                                                {warningCount}
                                            </span>
                                        )}
                                    </div>

                                    {plannedIds.length === 0 ? (
                                        <div className="rounded-lg border border-dashed border-gray-300 bg-white px-3 py-5 text-center text-xs text-gray-500">
                                            {semester.isHistorical ? 'Chưa có dữ liệu môn trong kỳ này' : 'Thả môn vào đây'}
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            {plannedIds.map((courseId) => {
                                                const course = courseById.get(courseId);
                                                if (!course) return null;

                                                const missingPrereqs = getMissingPrerequisites(courseId, semesterIndex);
                                                return (
                                                    <div
                                                        key={courseId}
                                                        draggable={!semester.isHistorical}
                                                        onDragStart={(event) => handleDragStart(courseId, event)}
                                                        className="rounded-lg border border-gray-200 bg-white p-2 shadow-sm"
                                                    >
                                                        <div className="flex items-start gap-2">
                                                            <div className="min-w-0 flex-1">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-xs font-bold text-gray-900">{course.course_id}</span>
                                                                    <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-600">
                                                                        {course.credits} TC
                                                                    </span>
                                                                </div>
                                                                <p className="mt-0.5 truncate text-xs font-medium text-gray-600">
                                                                    {course.course_name_vi}
                                                                </p>
                                                            </div>
                                                            {!semester.isHistorical && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => removeCourseFromSemester(courseId, semester.id)}
                                                                    className="rounded-md p-1 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
                                                                    title="Xóa khỏi học kỳ"
                                                                >
                                                                    <Trash2 className="h-3.5 w-3.5" />
                                                                </button>
                                                            )}
                                                        </div>

                                                        {missingPrereqs.length > 0 && (
                                                            <div className="mt-2 rounded-md bg-amber-50 px-2 py-1.5 text-[11px] leading-relaxed text-amber-800">
                                                                Thiếu: {missingPrereqs.join(', ')}
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </aside>
        </div>
    );
}
