import React, { useState } from 'react';
import { CheckCircle2, ChevronDown, ChevronRight } from 'lucide-react';
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

// [GÓC KHUẤT ĐÃ ĐƯỢC FIX]: Tách Component hiển thị ra ngoài để bảo vệ State isExpanded
// Không được khai báo component có chứa useState ở bên trong một hàm render khác
const CategoryUIComponent = React.memo(({
    cat,
    depth,
    requiredCredits,
    categoryEarnedCredits,
    isCompleted,
    coursesToRender,
    optionsRendered,
    nestedCategories,
    onShowFlowchart
}: any) => {
    const [isExpanded, setIsExpanded] = useState(true);

    return (
        <div className={`mb-3 md:mb-4 ${depth === 0
                ? 'bg-white p-3 md:p-5 rounded-xl border border-gray-200 shadow-sm'
                : 'pl-3 md:pl-4 border-l-2 mt-3 md:mt-4 transition-colors ' + (isCompleted ? 'border-green-200 bg-green-50/20' : 'border-gray-100')
            }`}>
            <div className="mb-2 md:mb-3 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setIsExpanded(!isExpanded)}>
                <div className="flex items-center gap-2 md:gap-3 flex-wrap">
                    <div className="flex items-center gap-2 text-gray-800">
                        {isExpanded ? <ChevronDown className="w-4 h-4 md:w-5 md:h-5 text-gray-500 flex-shrink-0" /> : <ChevronRight className="w-4 h-4 md:w-5 md:h-5 text-gray-500 flex-shrink-0" />}

                        {/* Nén Typography cho Mobile */}
                        {depth === 0 ? (
                            <h3 className="text-sm md:text-base font-bold text-[#004A98] flex items-center gap-1.5 md:gap-2">
                                {cat.name || 'Danh mục chưa tên'}
                                {isCompleted && <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-green-500" />}
                            </h3>
                        ) : depth === 1 ? (
                            <h4 className="text-sm font-bold flex items-center gap-1.5">
                                {cat.name || 'Nhóm học phần'}
                                {isCompleted && <CheckCircle2 className="w-3.5 h-3.5 md:w-4 md:h-4 text-green-500" />}
                            </h4>
                        ) : (
                            <h5 className="text-xs md:text-sm font-semibold flex items-center gap-1.5">
                                {cat.name || 'Nhóm con'}
                                {isCompleted && <CheckCircle2 className="w-3.5 h-3.5 md:w-4 md:h-4 text-green-500" />}
                            </h5>
                        )}
                    </div>

                    {/* Nén Credit Badge */}
                    {requiredCredits > 0 && (
                        <span className="px-2 py-0.5 text-[10px] md:text-xs rounded-full font-medium bg-[#004A98] text-white whitespace-nowrap">
                            {categoryEarnedCredits} / {requiredCredits} TC
                        </span>
                    )}
                </div>

                {cat.note && <p className="text-xs md:text-sm text-gray-500 mt-1 italic ml-6 md:ml-8">{cat.note}</p>}
            </div>

            {/* Nội dung mở rộng */}
            {isExpanded && (
                <div className="transition-all duration-300 opacity-100 mt-3 md:mt-4">
                    {/* Danh sách khóa học - Nén lề trái từ ml-8 xuống ml-2 (mobile) */}
                    {coursesToRender.length > 0 && (
                        <div className="space-y-2 mb-3 md:mb-4 ml-2 md:ml-8">
                            {coursesToRender.map((c: CourseData) => (
                                <CourseRowTrainingProgram
                                    key={c.course_id}
                                    course={c}
                                    status={c.status}
                                    rootStatus={isCompleted ? 'passed' : 'none'}
                                    onShowFlowchart={onShowFlowchart}
                                />
                            ))}
                        </div>
                    )}

                    {/* Tùy chọn - Nén padding */}
                    {optionsRendered.length > 0 && (
                        <div className="mt-3 md:mt-4 p-3 md:p-4 bg-gray-50 rounded-lg border border-gray-200 ml-2 md:ml-8">
                            <p className="text-xs md:text-sm font-medium text-gray-700 mb-2 md:mb-3">Tùy chọn hoàn thành:</p>
                            {optionsRendered}
                        </div>
                    )}

                    {/* Nhóm con */}
                    {nestedCategories.length > 0 && (
                        <div className="mt-2 text-gray-900 border-t border-dashed border-gray-200 pt-3 ml-2 md:ml-8">
                            {nestedCategories}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
});

export const CategoryNode = React.memo(({ category, depth = 0, isCourseExcludedFromGPA, onShowFlowchart }: CategoryNodeProps) => {

    const renderCategory = (cat: any, currentDepth: number): RenderResult => {
        let hasMatchingCourses = false;
        let categoryEarnedCredits = 0;
        let coursesToRender: CourseData[] = [];

        if (cat.coursesData) {
            coursesToRender = cat.coursesData;
            if (coursesToRender.length > 0) hasMatchingCourses = true;

            const coursesForCredits = cat.allCoursesData || cat.coursesData;
            categoryEarnedCredits += coursesForCredits
                .filter((c: CourseData) => c.status === 'passed')
                .reduce((sum: number, c: CourseData) => sum + c.credits, 0);
        }

        let nestedCategories: React.ReactNode[] = [];
        if (cat.breakdown) {
            nestedCategories = Object.entries(cat.breakdown).map(([subKey, subCat]: [string, any]) => {
                const { node, earnedCredits } = renderCategory(subCat, currentDepth + 1);
                if (node) hasMatchingCourses = true;

                categoryEarnedCredits += earnedCredits;
                // Logic gốc: Trừ ra nếu môn này không tính GPA
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
                const coursesForCredits = opt.allCoursesData || optCourses;

                const optionEarnedCredits = coursesForCredits
                    .filter((c: CourseData) => c.status === 'passed')
                    .reduce((sum: number, c: CourseData) => sum + c.credits, 0);

                if (optionEarnedCredits > categoryEarnedCredits) {
                    categoryEarnedCredits = optionEarnedCredits;
                }

                if (optCourses.length === 0) return null;
                const optionCompleted = optionEarnedCredits >= opt.credits;

                return (
                    <div key={idx} className="mb-3 md:mb-4">
                        <div className="flex items-center gap-2 mb-2">
                            <h5 className="font-medium text-gray-800 text-xs md:text-sm flex flex-wrap items-center gap-1.5 md:gap-2">
                                Lựa chọn {idx + 1} ({opt.type}): {opt.credits} TC
                                {optionCompleted && (
                                    <span className="text-green-600 flex items-center bg-green-50 px-1.5 py-0.5 rounded text-[10px] md:text-xs gap-1 whitespace-nowrap">
                                        <CheckCircle2 className="w-3 h-3 md:w-3.5 md:h-3.5" /> Hoàn thành ({optionEarnedCredits}/{opt.credits})
                                    </span>
                                )}
                            </h5>
                        </div>
                        <div className="space-y-1.5 md:space-y-2">
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

        // Truyền các props đã tính toán vào Component UI tĩnh
        return {
            node: (
                <CategoryUIComponent
                    cat={cat}
                    depth={currentDepth}
                    requiredCredits={requiredCredits}
                    categoryEarnedCredits={categoryEarnedCredits}
                    isCompleted={isCompleted}
                    coursesToRender={coursesToRender}
                    optionsRendered={optionsRendered}
                    nestedCategories={nestedCategories}
                    onShowFlowchart={onShowFlowchart}
                />
            ),
            earnedCredits: categoryEarnedCredits
        };
    };

    return <>{renderCategory(category, depth).node}</>;
});

CategoryNode.displayName = 'CategoryNode';