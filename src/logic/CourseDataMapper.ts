/**
 * CourseDataMapper.ts
 *
 * Domain Logic: Mapping và grouping dữ liệu khóa học.
 * Trích xuất từ useCourseData.ts để có thể test/import độc lập.
 */

import { FinancialLogic, type TuitionRates, type CourseMeta } from './FinancialLogic';
import type { Course } from '../types';

// ─── Types ───────────────────────────────────────────────────────────

export interface CourseGroupState {
    core: Course[];
    major: Course[];
    electives: Course[];
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
        recMap: Map<string, string>,
        isAllView: boolean
    ): Course => {
        const cid = sourceCourse.id || sourceCourse.course_id;
        const meta = allCoursesMeta.find(m => m.course_id === cid);
        const isFailed = failed.has(cid);
        const recStatus = recMap.get(cid);

        const prereqIds = prerequisites
            .filter(p => p.course_id === cid)
            .map(p => p.prereq_id);

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
        recMap: Map<string, string>,
        isAllView: boolean = false
    ): Course[] => {
        return sourceList.map(sourceCourse =>
            CourseDataMapper.mapRawCourseToModel(
                sourceCourse, allCoursesMeta, prerequisites,
                tuitionRates, failed, recMap, isAllView
            )
        );
    },

    /**
     * Phân nhóm courses theo category.
     * Trích xuất từ useCourseData.ts groupCourses (L115-128).
     */
    groupCoursesByCategory: (courseList: Course[]): CourseGroupState => {
        const grouped: CourseGroupState = { core: [], major: [], electives: [] };
        courseList.forEach(c => {
            const cat = c.category || 'OTHER';
            if (cat === 'FOUNDATION' || cat === 'GENERAL_IT') {
                grouped.core.push(c);
            } else if (cat.startsWith('MAJOR_') || cat === 'GRADUATION' || cat.startsWith('SPECIALIZED_')) {
                grouped.major.push(c);
            } else {
                grouped.electives.push(c);
            }
        });
        return grouped;
    },
};
