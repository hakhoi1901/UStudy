/**
 * CourseDataMapper.ts
 *
 * Domain Logic: Mapping và grouping dữ liệu khóa học.
 * Trích xuất từ useCourseData.ts để có thể test/import độc lập.
 */

import { FinancialLogic, type TuitionRates, type CourseMeta } from './FinancialLogic';
import type { Course } from '../types';

function normalizeCourseId(value: unknown): string {
    return String(value ?? '').trim().toUpperCase();
}

// ─── Types ───────────────────────────────────────────────────────────

export interface CourseGroupState {
    core: Course[];
    major: Course[];
    electives: Course[];
}

export type CourseGroupKey = keyof CourseGroupState;

function normalizeCategoryText(value: unknown): string {
    return String(value ?? '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'D')
        .toLowerCase();
}

function resolveCategoryGroup(
    categoryKey: string,
    category: any,
    inheritedGroup: CourseGroupKey,
): CourseGroupKey {
    const descriptor = normalizeCategoryText(
        `${categoryKey} ${category?.type ?? ''} ${category?.name ?? ''}`,
    );

    if (descriptor.includes('elective') || descriptor.includes('tu chon')) return 'electives';
    if (descriptor.includes('foundation') || descriptor.includes('co so nganh')) return 'core';
    if (
        descriptor.includes('major')
        || descriptor.includes('marjor')
        || descriptor.includes('specialized')
        || descriptor.includes('chuyen nganh')
        || descriptor.includes('graduation')
        || descriptor.includes('tot nghiep')
    ) {
        return 'major';
    }

    return inheritedGroup;
}

function getCategoryCourseId(value: unknown): string {
    if (typeof value === 'string' || typeof value === 'number') return normalizeCourseId(value);
    if (!value || typeof value !== 'object') return '';
    const course = value as Record<string, unknown>;
    return normalizeCourseId(course.course_id ?? course.id ?? course.code);
}

function traverseCategoryNode(
    categoryKey: string,
    category: any,
    inheritedGroup: CourseGroupKey,
    courseGroups: Map<string, CourseGroupKey>,
) {
    if (!category || typeof category !== 'object') return;

    const group = resolveCategoryGroup(categoryKey, category, inheritedGroup);
    if (Array.isArray(category.courses)) {
        category.courses.forEach((course: unknown) => {
            const courseId = getCategoryCourseId(course);
            if (courseId && !courseGroups.has(courseId)) courseGroups.set(courseId, group);
        });
    }

    if (category.breakdown && typeof category.breakdown === 'object') {
        Object.entries(category.breakdown).forEach(([childKey, child]) => {
            traverseCategoryNode(childKey, child, group, courseGroups);
        });
    }

    if (Array.isArray(category.sub_groups)) {
        category.sub_groups.forEach((child: any, index: number) => {
            const childKey = String(child?.id ?? child?.type ?? child?.name ?? index);
            traverseCategoryNode(childKey, child, group, courseGroups);
        });
    }

    if (Array.isArray(category.options)) {
        category.options.forEach((child: any, index: number) => {
            const childKey = String(child?.id ?? child?.type ?? child?.name ?? index);
            traverseCategoryNode(childKey, child, group, courseGroups);
        });
    }
}

export function buildCourseGroupIndex(categories: any): Map<string, CourseGroupKey> {
    const courseGroups = new Map<string, CourseGroupKey>();
    if (!categories || typeof categories !== 'object') return courseGroups;

    Object.entries(categories).forEach(([categoryKey, category]) => {
        traverseCategoryNode(categoryKey, category, 'electives', courseGroups);
    });

    return courseGroups;
}

// ─── Core Functions ──────────────────────────────────────────────────


export const CourseDataMapper = {

    /**
     * Map raw course data sang Course model chuẩn.
     * Trích xuất từ useCourseData.ts mapCourseList (L60-108).
     */
    mapRawCourseToModel: (
        sourceCourse: any,
        allCoursesMeta: CourseMeta[],
        prerequisites: any[],
        tuitionRates: TuitionRates | null,
        failed: Set<string>,
        recMap: ReadonlyMap<string, string>,
        isAllView: boolean
    ): Course => {
        const cid = normalizeCourseId(sourceCourse.id || sourceCourse.course_id);
        const meta = allCoursesMeta.find(m => normalizeCourseId(m.course_id) === cid);
        const isFailed = failed.has(cid);
        const recStatus = recMap.get(cid);

        const prereqIds = prerequisites
            .filter(p => normalizeCourseId(p.course_id) === cid)
            .flatMap(p => String(p.prereq_id ?? '').split(/[,;/\s]+/))
            .map(normalizeCourseId)
            .filter(Boolean);

        const needsRetake = isFailed || recStatus === 'RETAKE';

        const isAvailable = isAllView
            ? !needsRetake
            : !!recStatus && recStatus !== 'RETAKE';

        const _credits = parseInt((meta?.credits || sourceCourse.credits) as any) || 0;

        const theory_hours = parseInt((meta?.theory_hours || sourceCourse.theory_hours) as any) || 0;
        const lab_hours = parseInt((meta?.lab_hours || sourceCourse.lab_hours) as any) || 0;
        const exercise_hours = parseInt((meta?.exercise_hours || sourceCourse.exercise_hours) as any) || 0;

        const { courseFee: price } = FinancialLogic.calculateCourseFee(
            cid, _credits, tuitionRates, allCoursesMeta
        );

        return {
            id: cid,
            code: cid,
            name: meta?.course_name_vi || sourceCourse.course_name_vi || sourceCourse.name || cid,
            nameVi: meta?.course_name_vi || sourceCourse.course_name_vi || sourceCourse.name || cid,
            credits: _credits,
            theory_hours,
            lab_hours,
            exercise_hours,
            price,
            prerequisites: prereqIds,
            needsRetake: needsRetake,
            isAvailable: isAvailable,
            recommendationStatus: recStatus,
            description: meta?.description || sourceCourse.description || '',
            descriptionVi: meta?.description || sourceCourse.description || '',
            instructor: 'Chưa cập nhật',
            category: meta?.category || sourceCourse.category || 'OTHER',
            isOpen: true
        };
    },

    /**
     * Map danh sách courses sang Course models.
     */
    mapCourseList: (
        sourceList: any[],
        allCoursesMeta: CourseMeta[],
        prerequisites: any[],
        tuitionRates: TuitionRates | null,
        failed: Set<string>,
        recMap: ReadonlyMap<string, string>,
        isAllView: boolean = false
    ): Course[] => {
        const mappedCourses = new Map<string, Course>();

        sourceList.forEach(sourceCourse => {
            const course = CourseDataMapper.mapRawCourseToModel(
                sourceCourse, allCoursesMeta, prerequisites,
                tuitionRates, failed, recMap, isAllView
            );
            if (course.id && !mappedCourses.has(course.id)) mappedCourses.set(course.id, course);
        });

        return Array.from(mappedCourses.values());
    },

    /**
     * Phân nhóm courses theo category.
     * Trích xuất từ useCourseData.ts groupCourses (L115-128).
     */
    groupCoursesByCategory: (courseList: Course[], categories?: any): CourseGroupState => {
        const grouped: CourseGroupState = { core: [], major: [], electives: [] };
        const courseGroups = buildCourseGroupIndex(categories);
        courseList.forEach(c => {
            const group = courseGroups.get(normalizeCourseId(c.id)) ?? 'electives';
            grouped[group].push(c);
        });
        return grouped;
    },
};
