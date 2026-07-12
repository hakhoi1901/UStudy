import { useState } from 'react';
import { CheckCircle2, ChevronDown, ChevronRight } from 'lucide-react';
import { AcademicRulesEngine } from '../grades';
import { getCategoryCreditProgress, getRequiredCredits, sumCoursePlanCredits } from './credit-progress';
import { DraftCourseRow } from './DraftCourseRow';
import type { CourseDragStartHandler, CourseMeta, MobilePlannerOpenHandler } from './types';

interface DraftCategoryNodeProps {
    category: any;
    depth?: number;
    manuallyPlannedCourseIds: Set<string>;
    onDragStart: CourseDragStartHandler;
    onRemoveFromPlan: (courseId: string) => void;
    onOpenMobilePlanner: MobilePlannerOpenHandler;
}

export function DraftCategoryNode({
    category,
    depth = 0,
    manuallyPlannedCourseIds,
    onDragStart,
    onRemoveFromPlan,
    onOpenMobilePlanner,
}: DraftCategoryNodeProps) {
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
        <div className={depth === 0 ? 'rounded-xl border border-gray-200 bg-white p-3 shadow-sm md:p-4' : 'border-l-2 border-gray-100 pl-5'}>
            <button
                type="button"
                onClick={() => setIsExpanded((value) => !value)}
                className="flex w-full items-start gap-2 rounded-md px-1 py-1 text-left transition-colors hover:bg-gray-50"
            >
                {isExpanded ? (
                    <ChevronDown className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-500" />
                ) : (
                    <ChevronRight className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-500" />
                )}
                <div className="min-w-0 flex-1">
                    <h3
                        className={`flex items-center gap-1.5 ${
                            depth === 0
                                ? isCompleted
                                    ? 'text-sm font-bold text-emerald-700'
                                    : 'text-sm font-bold text-[#004A98]'
                                : isCompleted
                                    ? 'text-sm font-semibold text-emerald-700'
                                    : 'text-sm font-semibold text-gray-800'
                        }`}
                    >
                        {category.name || 'Danh mục chưa tên'}

                        {isCompleted && (
                            <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-emerald-500" />
                        )}
                    </h3>
                    {category.note && <p className="mt-0.5 text-xs text-gray-500">{category.note}</p>}
                </div>
                {requiredCredits > 0 && (
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium bg-[#004A98] text-white`}>
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
                                    onOpenMobilePlanner={onOpenMobilePlanner}
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
                                            onOpenMobilePlanner={onOpenMobilePlanner}
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
                            onOpenMobilePlanner={onOpenMobilePlanner}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
