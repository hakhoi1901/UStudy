import React, { useState } from 'react';
import { CheckCircle2, ChevronDown, ChevronRight } from 'lucide-react';
import { CourseRowTrainingProgram } from './CourseRowTrainingProgram';

// Định nghĩa interface CourseData (để hiển thị thông tin môn học)
export interface CourseData {
    course_id: string;          // mã môn học
    course_name_vi: string;     // tên môn học
    credits: number;            // số tín chỉ
    theory_hours: number;       // số giờ lý thuyết
    lab_hours: number;          // số giờ thực hành
    exercise_hours: number;     // số giờ bài tập
    course_type: string;        // loại môn học
    category: string;           // danh mục môn học
    description: string;        // mô tả môn học
    status: 'passed' | 'studying' | 'failed' | 'none';  // trạng thái môn học
}

// Định nghĩa interface CategoryNodeProps (để hiển thị thông tin danh mục môn học)
interface CategoryNodeProps {
    category: any;               // danh mục môn học
    depth?: number;              // độ sâu của danh mục
    isCourseExcludedFromGPA: (courseName: string) => boolean;  // hàm kiểm tra xem môn học có được tính vào GPA không
    onShowFlowchart: (courseId: string) => void;  // hàm hiển thị sơ đồ tư duy
}

// Định nghĩa interface RenderResult (để hiển thị thông tin danh mục môn học)
interface RenderResult {
    node: React.ReactNode;       // node danh mục môn học
    earnedCredits: number;       // số tín chỉ đã tích lũy
}

/**
 * 
 * @param category - danh mục môn học
 * @param depth - độ sâu của danh mục
 * @param isCourseExcludedFromGPA - hàm kiểm tra xem môn học có được tính vào GPA không
 * @param onShowFlowchart - hàm hiển thị sơ đồ tư duy
 * @returns 
 * 
 * render danh mục môn học
 */
export const CategoryNode = React.memo(({ category, depth = 0, isCourseExcludedFromGPA, onShowFlowchart }: CategoryNodeProps) => {

    // render danh mục môn học
    const renderCategory = (cat: any, currentDepth: number): RenderResult => {
        let hasMatchingCourses = false;     // kiểm tra xem có môn học nào trong danh mục không
        let categoryEarnedCredits = 0;      // số tín chỉ đã tích lũy trong danh mục

        let coursesToRender: CourseData[] = []; // danh sách môn học
        // nếu có coursesData thì render danh sách môn học
        if (cat.coursesData) {
            coursesToRender = cat.coursesData;
            if (coursesToRender.length > 0) hasMatchingCourses = true;

            // lấy danh sách môn học để tính số tín chỉ đã tích lũy
            const coursesForCredits = cat.allCoursesData || cat.coursesData;

            // tính số tín chỉ đã tích lũy trong danh mục
            categoryEarnedCredits += coursesForCredits
                .filter((c: CourseData) => c.status === 'passed')   // chỉ tính môn đã qua (có trạng thái là passed)
                .reduce((sum: number, c: CourseData) => sum + c.credits, 0); // cộng số tín chỉ
        }

        // render danh mục con
        let nestedCategories: React.ReactNode[] = [];

        // nếu có breakdown thì render danh mục con
        if (cat.breakdown) {
            // duyệt qua từng danh mục con
            nestedCategories = Object.entries(cat.breakdown).map(([subKey, subCat]: [string, any]) => {
                // render danh mục con
                const { node, earnedCredits } = renderCategory(subCat, currentDepth + 1);
                if (node) hasMatchingCourses = true;

                // cộng số tín chỉ đã tích lũy trong danh mục con
                categoryEarnedCredits += earnedCredits;
                // nếu danh mục con có tên và được tính vào GPA thì trừ số tín chỉ đã tích lũy
                if (subCat.name && isCourseExcludedFromGPA(subCat.name)) {
                    categoryEarnedCredits -= earnedCredits;
                }
                // return danh mục con
                return <div key={subKey}>{node}</div>;
            });
        }

        // render danh sách các lựa chọn
        let optionsRendered: React.ReactNode[] = [];
        if (cat.options) {
            // duyệt qua từng lựa chọn
            optionsRendered = cat.options.map((opt: any, idx: number) => {
                const optCourses = opt.coursesData || [];
                if (optCourses.length > 0) hasMatchingCourses = true;
                const coursesForCredits = opt.allCoursesData || optCourses;

                // tính số tín chỉ đã tích lũy trong lựa chọn
                const optionEarnedCredits = coursesForCredits
                    .filter((c: CourseData) => c.status === 'passed')
                    .reduce((sum: number, c: CourseData) => sum + c.credits, 0);

                // nếu số tín chỉ đã tích lũy trong lựa chọn lớn hơn số tín chỉ đã tích lũy trong danh mục thì cập nhật
                if (optionEarnedCredits > categoryEarnedCredits) {
                    categoryEarnedCredits = optionEarnedCredits;
                }

                // nếu lựa chọn không có môn học thì return null
                if (optCourses.length === 0) return null;
                // kiểm tra xem lựa chọn đã hoàn thành chưa
                const optionCompleted = optionEarnedCredits >= opt.credits;

                // return lựa chọn
                return (
                    <div key={idx} className="mb-4">
                        <div className="flex items-center gap-2 mb-2">
                            {/* hiển thị thông tin lựa chọn */}
                            <h5 className="font-medium text-gray-800 text-sm flex items-center gap-2">
                                Lựa chọn {idx + 1} ({opt.type}): {opt.credits} TC
                                {/* nếu lựa chọn đã hoàn thành thì hiển thị thông tin */}
                                {optionCompleted && (
                                    <span className="text-green-600 flex items-center bg-green-50 px-1.5 py-0.5 rounded text-xs gap-1">
                                        <CheckCircle2 className="w-3.5 h-3.5" /> Hoàn thành ({optionEarnedCredits} / {opt.credits} TC)
                                    </span>
                                )}
                            </h5>
                        </div>
                        <div className="space-y-2">
                            {/* duyệt qua từng môn học trong lựa chọn */}
                            {optCourses.map((c: CourseData) => (
                                <CourseRowTrainingProgram key={c.course_id} course={c} status={c.status} onShowFlowchart={onShowFlowchart} />
                            ))}
                        </div>
                    </div>
                )
            });
        }

        // nếu danh mục không có môn học thì return null
        if (!hasMatchingCourses) return { node: null, earnedCredits: categoryEarnedCredits };

        // tính số tín chỉ bắt buộc
        const requiredCredits = cat.total_credits_required || cat.credits || cat.credits_required || 0;
        // kiểm tra xem danh mục đã hoàn thành chưa
        const isCompleted = requiredCredits > 0 && categoryEarnedCredits >= requiredCredits;

        // Bọc phần Node vào một component con để mỗi danh mục có state riêng
        const CollapsibleNode = () => {
            // state để kiểm tra xem danh mục có được mở rộng không
            const [isExpanded, setIsExpanded] = useState(true);

            return (
                <div className={`mb-4 ${currentDepth === 0 ? 'bg-white p-6 rounded-xl border border-gray-200 shadow-sm' : 'pl-4 border-l-2 mt-4 transition-colors ' + (isCompleted ? 'border-green-200 bg-green-50/20' : 'border-gray-100')}`}>
                    <div className="mb-4 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setIsExpanded(!isExpanded)}>
                        <div className="flex items-center gap-3 flex-wrap">
                            <div className="flex items-center gap-3">
                                {/* hiển thị icon mũi tên tùy thuộc vào trạng thái mở rộng */}
                                {isExpanded ? <ChevronDown className="w-5 h-5 text-gray-500" /> : <ChevronRight className="w-5 h-5 text-gray-500" />}
                                {/* hiển thị tên danh mục */}
                                {currentDepth === 0 ? (
                                    // hiển thị tên danh mục
                                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                        {cat.name || 'Danh mục chưa tên'}
                                        {isCompleted && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                                    </h3>
                                ) : currentDepth === 1 ? (
                                    // hiển thị tên danh mục
                                    <h4 className="text-base font-bold text-gray-800 flex items-center gap-1.5">
                                        {cat.name || 'Nhóm học phần'}
                                        {isCompleted && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                                    </h4>
                                ) : (
                                    // hiển thị tên danh mục
                                    <h5 className="text-sm font-semibold text-gray-800 flex items-center gap-1.5">
                                        {cat.name || 'Nhóm con'}
                                        {isCompleted && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                                    </h5>
                                )}
                            </div>

                            {/* hiển thị số tín chỉ đã tích lũy và số tín chỉ bắt buộc */}
                            {requiredCredits > 0 && (
                                <span className={`px-2.5 py-0.5 text-xs rounded-full font-medium bg-[#004A98] text-white`}>
                                    {categoryEarnedCredits} / {requiredCredits} Tín chỉ
                                </span>
                            )}
                        </div>

                        {/* hiển thị ghi chú của danh mục */}
                        {cat.note && <p className="text-sm text-gray-500 mt-1 italic ml-8">{cat.note}</p>}
                    </div>

                    {/* hiển thị danh sách môn học và lựa chọn */}
                    {isExpanded && (
                        <div className={`transition-all duration-300 ${isExpanded ? 'opacity-100 mt-4' : 'opacity-0 h-0 overflow-hidden'}`}>
                            {/* hiển thị danh sách môn học */}
                            {coursesToRender.length > 0 && (
                                <div className="space-y-2 mb-4 ml-8">
                                    {coursesToRender.map((c: CourseData) => (
                                        <CourseRowTrainingProgram key={c.course_id} course={c} status={c.status} rootStatus={isCompleted ? 'passed' : 'none'} onShowFlowchart={onShowFlowchart} />
                                    ))}
                                </div>
                            )}

                            {/* hiển thị danh sách lựa chọn */}
                            {optionsRendered.length > 0 && (
                                <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200 ml-8">
                                    <p className="text-sm font-medium text-gray-700 mb-3">Tùy chọn hoàn thành:</p>
                                    {optionsRendered}
                                </div>
                            )}

                            {/* hiển thị danh sách danh mục con */}
                            {nestedCategories.length > 0 && (
                                <div className="mt-2 text-gray-900 border-t border-dashed border-gray-200 pt-3 ml-8">
                                    {nestedCategories}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            );
        };

        return { node: <CollapsibleNode />, earnedCredits: categoryEarnedCredits };
    };

    return <>{renderCategory(category, depth).node}</>;
});

// hiển thị tên component
CategoryNode.displayName = 'CategoryNode';
