import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { CourseRowTrainingProgram } from './CourseRowTrainingProgram';

export interface CourseData {
    course_id: string;
    course_name_vi: string;
    credits: number;
    theory_hours: number;
    lab_hours: number;
    exercise_hours: number;
    course_type: string;
    category: string;
    description: string;
    status: 'passed' | 'studying' | 'failed' | 'none';
}

interface CategoryNodeProps {
    category: any;
    depth?: number;
    isCourseExcludedFromGPA: (courseName: string) => boolean;
    onShowFlowchart: (courseId: string) => void;
}

interface RenderResult {
    node: React.ReactNode;
    earnedCredits: number;
}

export const CategoryNode = React.memo(({ category, depth = 0, isCourseExcludedFromGPA, onShowFlowchart }: CategoryNodeProps) => {

    const renderCategory = (cat: any, currentDepth: number): RenderResult => {
        let hasMatchingCourses = false;
        let categoryEarnedCredits = 0;

        let coursesToRender: CourseData[] = [];
        if (cat.coursesData) {
            coursesToRender = cat.coursesData;
            if (coursesToRender.length > 0) hasMatchingCourses = true;
            // Calculate credits for this specific leaf node
            categoryEarnedCredits += coursesToRender
                .filter(c => c.status === 'passed')
                .reduce((sum, c) => sum + c.credits, 0);
        }

        let nestedCategories: React.ReactNode[] = [];
        if (cat.breakdown) {
            nestedCategories = Object.entries(cat.breakdown).map(([subKey, subCat]: [string, any]) => {
                const { node, earnedCredits } = renderCategory(subCat, currentDepth + 1);
                if (node) hasMatchingCourses = true;

                // Add up child credits to parent
                categoryEarnedCredits += earnedCredits;
                // Subtract credits if the sub-category is excluded (e.g., Physical Education)
                if (subCat.name && isCourseExcludedFromGPA(subCat.name)) {
                    categoryEarnedCredits -= earnedCredits;
                }
                return <div key={subKey}>{node}</div>;
            });
        }

        let optionsRendered: React.ReactNode[] = [];
        if (cat.options) {
            optionsRendered = cat.options.map((opt: any, idx: number) => {
                const optCourses = opt.coursesData || [];
                if (optCourses.length > 0) hasMatchingCourses = true;

                const optionEarnedCredits = optCourses
                    .filter((c: CourseData) => c.status === 'passed')
                    .reduce((sum: number, c: CourseData) => sum + c.credits, 0);

                // We'll count the max earned across options (assuming they choose one path)
                if (optionEarnedCredits > categoryEarnedCredits) {
                    categoryEarnedCredits = optionEarnedCredits;
                }

                if (optCourses.length === 0) return null;
                const optionCompleted = optionEarnedCredits >= opt.credits;

                return (
                    <div key={idx} className="mb-4">
                        <div className="flex items-center gap-2 mb-2">
                            <h5 className="font-medium text-gray-800 text-sm flex items-center gap-2">
                                Lựa chọn {idx + 1} ({opt.type}): {opt.credits} TC
                                {optionCompleted && (
                                    <span className="text-green-600 flex items-center bg-green-50 px-1.5 py-0.5 rounded text-xs gap-1">
                                        <CheckCircle2 className="w-3.5 h-3.5" /> Hoàn thành ({optionEarnedCredits} / {opt.credits} TC)
                                    </span>
                                )}
                            </h5>
                        </div>
                        <div className="space-y-2">
                            {optCourses.map((c: CourseData) => (
                                <CourseRowTrainingProgram key={c.course_id} course={c} status={c.status} onShowFlowchart={onShowFlowchart} />
                            ))}
                        </div>
                    </div>
                )
            });
        }

        if (!hasMatchingCourses) return { node: null, earnedCredits: categoryEarnedCredits };

        const requiredCredits = cat.total_credits_required || cat.credits || cat.credits_required || 0;
        const isCompleted = requiredCredits > 0 && categoryEarnedCredits >= requiredCredits;

        const Node = (
            <div className={`mb-4 ${currentDepth === 0 ? 'bg-white p-6 rounded-xl border border-gray-200 shadow-sm' : 'pl-4 border-l-2 mt-4 transition-colors ' + (isCompleted ? 'border-green-200 bg-green-50/20' : 'border-gray-100')}`}>
                <div className="mb-4">
                    <div className="flex items-center gap-3 flex-wrap">
                        {currentDepth === 0 ? (
                            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                {cat.name || 'Danh mục chưa tên'}
                                {isCompleted && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                            </h3>
                        ) : currentDepth === 1 ? (
                            <h4 className="text-base font-bold text-gray-800 flex items-center gap-1.5">
                                {cat.name || 'Nhóm học phần'}
                                {isCompleted && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                            </h4>
                        ) : (
                            <h5 className="text-sm font-semibold text-gray-800 flex items-center gap-1.5">
                                {cat.name || 'Nhóm con'}
                                {isCompleted && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                            </h5>
                        )}

                        {requiredCredits > 0 && (
                            <span className={`px-2.5 py-0.5 text-xs rounded-full font-medium bg-[#004A98] text-white`}>
                                {categoryEarnedCredits} / {requiredCredits} Tín chỉ
                            </span>
                        )}
                    </div>
                    {cat.note && <p className="text-sm text-gray-500 mt-1 italic">{cat.note}</p>}
                </div>

                {coursesToRender.length > 0 && (
                    <div className="space-y-2 mb-4">
                        {coursesToRender.map((c: CourseData) => (
                            <CourseRowTrainingProgram key={c.course_id} course={c} status={c.status} rootStatus={isCompleted ? 'passed' : 'none'} onShowFlowchart={onShowFlowchart} />
                        ))}
                    </div>
                )}

                {optionsRendered.length > 0 && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <p className="text-sm font-medium text-gray-700 mb-3">Tùy chọn hoàn thành:</p>
                        {optionsRendered}
                    </div>
                )}

                {nestedCategories.length > 0 && (
                    <div className="mt-2 text-gray-900 border-t border-dashed border-gray-200 pt-3">
                        {nestedCategories}
                    </div>
                )}
            </div>
        );

        return { node: Node, earnedCredits: categoryEarnedCredits };
    };

    return <>{renderCategory(category, depth).node}</>;
});

CategoryNode.displayName = 'CategoryNode';
