import type {
    GradeHistoryCategoryIndex,
    GradeHistoryCategoryNode,
    GradeHistoryFilters,
    GradeHistoryStatusFilter,
    StudentCourseGrade,
} from '../types';

export const UNCATEGORIZED_CATEGORY_ID = '__uncategorized__';
const GRADE_MIN = 0;
const GRADE_MAX = 10;
const CREDIT_MIN = 1;
const CREDIT_MAX = 10;

const CATEGORY_KEY_LABELS: Record<string, string> = {
    MANDATORY: 'Bắt buộc',
    ELECTIVE: 'Tự chọn',
    FREE_ELECTIVES: 'Tự chọn tự do',
    THESIS: 'Khóa luận tốt nghiệp',
    INTERNSHIP: 'Thực tập tốt nghiệp',
    PROJECT_AND_ELECTIVES: 'Đồ án và học phần tự chọn',
};

export function createEmptyGradeHistoryFilters(): GradeHistoryFilters {
    return {
        query: '',
        statuses: [],
        gradeRange: { min: GRADE_MIN, max: GRADE_MAX },
        creditRange: { min: CREDIT_MIN, max: CREDIT_MAX },
        categoryIds: [],
    };
}

function normalizeCourseCode(value: unknown): string {
    return String(value ?? '').trim().toUpperCase();
}

function normalizeSearchText(value: unknown): string {
    return String(value ?? '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'D')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, ' ')
        .trim();
}

function getCategoryName(rawCategory: any, key: string, optionIndex?: number): string {
    const explicitName = String(rawCategory?.name ?? '').trim();
    if (explicitName) return explicitName;

    const type = String(rawCategory?.type ?? '').trim().toUpperCase();
    if (type && CATEGORY_KEY_LABELS[type]) return CATEGORY_KEY_LABELS[type];

    const normalizedKey = key.trim().toUpperCase();
    if (CATEGORY_KEY_LABELS[normalizedKey]) return CATEGORY_KEY_LABELS[normalizedKey];
    if (optionIndex !== undefined) return `Lựa chọn ${optionIndex + 1}`;

    return key
        .toLowerCase()
        .split('_')
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');
}

function getDirectCourseCodes(rawCategory: any): Set<string> {
    const result = new Set<string>();
    if (!Array.isArray(rawCategory?.courses)) return result;

    rawCategory.courses.forEach((course: unknown) => {
        const code = normalizeCourseCode(
            typeof course === 'object' && course !== null
                ? (course as any).course_id ?? (course as any).id ?? (course as any).code
                : course,
        );
        if (code) result.add(code);
    });

    return result;
}

export function buildGradeHistoryCategoryIndex(categories: unknown): GradeHistoryCategoryIndex {
    const courseCodesByCategory = new Map<string, Set<string>>();
    const categorizedCourseCodes = new Set<string>();

    const visitCategory = (
        rawCategory: any,
        key: string,
        id: string,
        optionIndex?: number,
    ): GradeHistoryCategoryNode => {
        const children: GradeHistoryCategoryNode[] = [];

        if (rawCategory?.breakdown && typeof rawCategory.breakdown === 'object') {
            Object.entries(rawCategory.breakdown).forEach(([childKey, childCategory]) => {
                children.push(visitCategory(childCategory, childKey, `${id}/${childKey}`));
            });
        }

        if (Array.isArray(rawCategory?.options)) {
            rawCategory.options.forEach((option: unknown, index: number) => {
                if (!option || typeof option !== 'object') return;
                const optionType = String((option as any).type ?? `option-${index + 1}`);
                children.push(visitCategory(option, optionType, `${id}/option-${index + 1}`, index));
            });
        }

        const courseCodes = getDirectCourseCodes(rawCategory);
        children.forEach((child) => {
            child.courseCodes.forEach((code) => courseCodes.add(code));
        });

        courseCodes.forEach((code) => categorizedCourseCodes.add(code));
        courseCodesByCategory.set(id, courseCodes);

        return {
            id,
            key,
            name: getCategoryName(rawCategory, key, optionIndex),
            courseCodes: Array.from(courseCodes),
            children,
        };
    };

    const tree = categories && typeof categories === 'object'
        ? Object.entries(categories as Record<string, unknown>).map(([key, category]) => (
            visitCategory(category, key, key)
        ))
        : [];

    return { tree, courseCodesByCategory, categorizedCourseCodes };
}

function hasRecordedGrade(course: StudentCourseGrade): boolean {
    return course.hasGrade ?? course.grade > 0;
}

function matchesStatus(course: StudentCourseGrade, status: GradeHistoryStatusFilter): boolean {
    const isExempted = course.isExempted === true || course.semester === 'Miễn';
    if (status === 'exempted') return isExempted;
    if (isExempted) return false;
    if (status === 'retake') return course.needsRetake === true || course.status === 'retake';
    if (status === 'ongoing') return !hasRecordedGrade(course) && course.isCurrentSemester === true;
    if (status === 'ungraded') return !hasRecordedGrade(course) && course.isCurrentSemester !== true;
    return course.status === 'passed' && !course.needsRetake;
}

function hasActiveGradeRange(filters: GradeHistoryFilters): boolean {
    return filters.gradeRange.min > GRADE_MIN || filters.gradeRange.max < GRADE_MAX;
}

function hasActiveCreditRange(filters: GradeHistoryFilters): boolean {
    return filters.creditRange.min > CREDIT_MIN || filters.creditRange.max < CREDIT_MAX;
}

function matchesSelectedCategories(
    course: StudentCourseGrade,
    categoryIds: string[],
    categoryIndex: GradeHistoryCategoryIndex,
): boolean {
    if (categoryIds.length === 0) return true;

    const code = normalizeCourseCode(course.code);
    return categoryIds.some((categoryId) => {
        if (categoryId === UNCATEGORIZED_CATEGORY_ID) {
            return !categoryIndex.categorizedCourseCodes.has(code);
        }
        return categoryIndex.courseCodesByCategory.get(categoryId)?.has(code) ?? false;
    });
}

export function applyGradeHistoryFilters(
    courses: StudentCourseGrade[],
    filters: GradeHistoryFilters,
    categoryIndex: GradeHistoryCategoryIndex,
): StudentCourseGrade[] {
    const queryTokens = normalizeSearchText(filters.query).split(' ').filter(Boolean);

    return courses.filter((course) => {
        if (queryTokens.length > 0) {
            const searchableText = normalizeSearchText(`${course.code} ${course.nameVi}`);
            if (!queryTokens.every((token) => searchableText.includes(token))) return false;
        }

        if (filters.statuses.length > 0 && !filters.statuses.some((status) => matchesStatus(course, status))) {
            return false;
        }

        if (hasActiveGradeRange(filters)) {
            if (!hasRecordedGrade(course) || course.isExempted || course.semester === 'Miễn') return false;
            if (course.grade < filters.gradeRange.min || course.grade > filters.gradeRange.max) return false;
        }

        if (hasActiveCreditRange(filters)) {
            if (course.credits < filters.creditRange.min || course.credits > filters.creditRange.max) return false;
        }

        return matchesSelectedCategories(course, filters.categoryIds, categoryIndex);
    });
}

export function countActiveGradeHistoryFilterGroups(filters: GradeHistoryFilters): number {
    return Number(Boolean(filters.query.trim()))
        + Number(filters.statuses.length > 0)
        + Number(hasActiveGradeRange(filters))
        + Number(hasActiveCreditRange(filters))
        + Number(filters.categoryIds.length > 0);
}

export function areGradeHistoryFiltersEqual(a: GradeHistoryFilters, b: GradeHistoryFilters): boolean {
    return a.query === b.query
        && a.statuses.join('|') === b.statuses.join('|')
        && a.gradeRange.min === b.gradeRange.min
        && a.gradeRange.max === b.gradeRange.max
        && a.creditRange.min === b.creditRange.min
        && a.creditRange.max === b.creditRange.max
        && a.categoryIds.join('|') === b.categoryIds.join('|');
}
