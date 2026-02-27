import { Info, CheckCircle2, Search, Filter } from 'lucide-react';
import { categories } from '../../assets/data/categories';
import { STORAGE_KEYS, ACADEMIC_RULES } from '../../config';
import { courses as courses_cntt } from '../../assets/data/courses';
import { CourseRowTrainingProgram } from '../../components/CourseRowTrainingProgram';
import { useState } from 'react';

export function TrainingProgramView() {
    const [searchTerm, setSearchTerm] = useState('');

    return (
        <div>

            {/* Tìm kiếm và lọc */}
            <div className="flex items-center gap-4 mb-6">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo tên môn học hoặc mã môn..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004A98] focus:border-transparent"
                    />
                </div>
                <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <Filter className="w-5 h-5 text-gray-600" />
                    <span className="text-gray-700 text-sm">Lọc</span>
                </button>
            </div>

            {/* Thông tin */}
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                    <p className="text-sm text-blue-900 font-medium">
                        Chương trình đào tạo toàn khóa
                    </p>
                    <p className="text-xs text-blue-700 mt-1">
                        Danh sách tổng hợp các môn học thuộc chương trình đào tạo phân theo từng nhóm. Bạn có thể tra cứu thông tin số tín chỉ, số tiết và khối lượng của từng môn học.
                    </p>
                </div>
            </div>

            <div className="space-y-6">
                {Object.entries(categories).map(([key, category]) => {

                    // Get student grades for status check
                    const studentDb = (() => {
                        try {
                            const data = localStorage.getItem(STORAGE_KEYS.STUDENT_DB);
                            return data ? JSON.parse(data) : null;
                        } catch {
                            return null;
                        }
                    })();

                    const getCourseStatus = (courseId: string): 'passed' | 'studying' | 'failed' | 'none' => {
                        if (!studentDb || !studentDb.grades) return 'none';
                        const gradeRecords = studentDb.grades.filter((g: any) => g.id === courseId);
                        if (gradeRecords.length === 0) return 'none';

                        // Check if any record has a passing score (>= 5.0)
                        const hasPassed = gradeRecords.some((g: any) => {
                            const score = typeof g.score === 'string' ? parseFloat(g.score) : g.score;
                            return typeof score === 'number' && !isNaN(score) && score >= 5.0;
                        });
                        if (hasPassed) return 'passed';

                        // Check if latest record has empty score (currently studying)
                        const latestRecord = gradeRecords[gradeRecords.length - 1];
                        if (latestRecord.score === '' || latestRecord.score === null || latestRecord.score === undefined) {
                            return 'studying';
                        }

                        // Has a score but didn't pass
                        const latestScore = typeof latestRecord.score === 'string' ? parseFloat(latestRecord.score) : latestRecord.score;
                        if (typeof latestScore === 'number' && !isNaN(latestScore) && latestScore < 5.0) {
                            return 'failed';
                        }

                        return 'none';
                    };

                    // Recursive function to render a category and its nested children
                    const renderCategory = (cat: any, depth: number = 0): { node: React.ReactNode, earnedCredits: number } => {
                        let hasMatchingCourses = false;
                        let categoryEarnedCredits = 0;

                        const getCoursesWithStatus = (courseIds: string[]) => {
                            return courseIds
                                .map((id) => {
                                    const metadata = courses_cntt.find((c) => c.course_id === id);
                                    if (!metadata) return null;
                                    return {
                                        ...metadata,
                                        status: getCourseStatus(id)
                                    };
                                })
                                .filter((c): c is NonNullable<typeof c> => {
                                    if (!c) return false;
                                    if (!searchTerm) return true;
                                    return (
                                        c.course_name_vi.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                        c.course_id.toLowerCase().includes(searchTerm.toLowerCase())
                                    );
                                });
                        };

                        let coursesToRender: any[] = [];
                        if (cat.courses) {
                            coursesToRender = getCoursesWithStatus(cat.courses);
                            if (coursesToRender.length > 0) hasMatchingCourses = true;
                            // Calculate credits for this specific leaf node
                            categoryEarnedCredits += coursesToRender
                                .filter(c => c.status === 'passed')
                                .reduce((sum, c) => sum + c.credits, 0);
                        }

                        let nestedCategories: React.ReactNode[] = [];
                        if (cat.breakdown) {
                            nestedCategories = Object.entries(cat.breakdown).map(([subKey, subCat]: [string, any]) => {
                                const { node, earnedCredits } = renderCategory(subCat, depth + 1);
                                if (node) hasMatchingCourses = true;

                                // Add up child credits to parent
                                categoryEarnedCredits += earnedCredits;
                                // Subtract credits if the sub-category is excluded (e.g., Physical Education)
                                if (subCat.name && ACADEMIC_RULES.EXCLUDED_COURSE_PREFIXES.some(prefix => subCat.name.startsWith(prefix.name))) {
                                    categoryEarnedCredits -= earnedCredits;
                                }
                                return <div key={subKey}>{node}</div>;
                            });
                        }

                        let optionsRendered: React.ReactNode[] = [];
                        if (cat.options) {
                            optionsRendered = cat.options.map((opt: any, idx: number) => {
                                const optCourses = getCoursesWithStatus(opt.courses);
                                if (optCourses.length > 0) hasMatchingCourses = true;

                                const optionEarnedCredits = optCourses
                                    .filter(c => c.status === 'passed')
                                    .reduce((sum, c) => sum + c.credits, 0);

                                // We'll count the max earned across options (assuming they choose one path)
                                // This is a naive heuristic for 'options' logic
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
                                            {optCourses.map((c) => (
                                                <CourseRowTrainingProgram key={c.course_id} course={c} status={c.status} />
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
                            <div className={`mb-4 ${depth === 0 ? 'bg-white p-6 rounded-xl border border-gray-200 shadow-sm' : 'pl-4 border-l-2 mt-4 transition-colors ' + (isCompleted ? 'border-green-200 bg-green-50/20' : 'border-gray-100')}`}>
                                <div className="mb-4">
                                    <div className="flex items-center gap-3 flex-wrap">
                                        {depth === 0 ? (
                                            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                                {cat.name || 'Danh mục chưa tên'}
                                                {isCompleted && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                                            </h3>
                                        ) : depth === 1 ? (
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
                                        {coursesToRender.map((c) => (
                                            <CourseRowTrainingProgram key={c.course_id} course={c} status={c.status} rootStatus={isCompleted ? 'passed' : 'none'} />
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

                    return <div key={key}>{renderCategory(category).node}</div>;
                })}
            </div>
        </div>
    );
}