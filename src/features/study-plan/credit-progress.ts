import { AcademicRulesEngine } from '../grades';
import type { CourseMeta } from './types';

export function getRequiredCredits(category: any): number {
    const specializationRequirements = getSpecializationChildren(category)
        .map((child) => getRequiredCredits(child));
    if (specializationRequirements.length > 0) {
        return Math.max(...specializationRequirements);
    }

    return category.total_credits_required || category.credits || category.credits_required || 0;
}

function normalizeCategoryName(name: unknown): string {
    return String(name || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\u0111/g, 'd')
        .toLowerCase();
}

function isSpecializationCategory(category: any): boolean {
    return normalizeCategoryName(category?.name).includes('chuyen nganh');
}

function getSpecializationChildren(category: any): any[] {
    if (!isSpecializationCategory(category) || !category?.breakdown) return [];
    return Object.values(category.breakdown).filter((child: any) => isSpecializationCategory(child));
}

export function getCoursePlanCredits(
    course: CourseMeta,
    manuallyPlannedCourseIds: Set<string>,
    includeAccumulationExcluded: boolean
): { earnedCredits: number; plannedCredits: number } {
    if (!includeAccumulationExcluded && AcademicRulesEngine.isCourseExcludedFromAccumulation(course.course_id)) {
        return { earnedCredits: 0, plannedCredits: 0 };
    }

    const credits = Number(course.credits) || 0;
    if (course.status === 'passed') return { earnedCredits: credits, plannedCredits: 0 };
    if (
        course.status === 'studying' ||
        manuallyPlannedCourseIds.has(course.course_id)
    ) {
        return { earnedCredits: 0, plannedCredits: credits };
    }

    return { earnedCredits: 0, plannedCredits: 0 };
}

export function sumCoursePlanCredits(
    courses: CourseMeta[],
    manuallyPlannedCourseIds: Set<string>,
    includeAccumulationExcluded: boolean
): { earnedCredits: number; plannedCredits: number } {
    return courses.reduce((total, course) => {
        const courseCredits = getCoursePlanCredits(course, manuallyPlannedCourseIds, includeAccumulationExcluded);
        return {
            earnedCredits: total.earnedCredits + courseCredits.earnedCredits,
            plannedCredits: total.plannedCredits + courseCredits.plannedCredits,
        };
    }, { earnedCredits: 0, plannedCredits: 0 });
}

export function getCategoryCreditProgress(
    category: any,
    manuallyPlannedCourseIds: Set<string>
): { earnedCredits: number; plannedCredits: number } {
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
        const childProgresses = Object.values(category.breakdown).map((child: any) => ({
            child,
            progress: getCategoryCreditProgress(child, manuallyPlannedCourseIds),
        }));

        const specializationChildren = childProgresses.filter(({ child }) => isSpecializationCategory(child));
        if (specializationChildren.length > 0) {
            const highestProgress = specializationChildren.reduce((highest, current) => (
                current.progress.earnedCredits + current.progress.plannedCredits >
                highest.earnedCredits + highest.plannedCredits
                    ? current.progress
                    : highest
            ), { earnedCredits: 0, plannedCredits: 0 });

            earnedCredits += highestProgress.earnedCredits;
            plannedCredits += highestProgress.plannedCredits;
        } else {
            childProgresses.forEach(({ child, progress: childProgress }) => {
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
