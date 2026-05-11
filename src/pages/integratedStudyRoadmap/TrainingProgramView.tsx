import { Info, Search, Filter, DatabaseBackup, X } from 'lucide-react';
import { CategoryNode } from '../../components/CategoryNode';
import type { CourseData } from '../../components/CategoryNode';
import { useState, useMemo } from 'react';
import { useDepartmentData } from '../../context/DepartmentContext';
import { readFromStorage } from '../../helpers/localStorage/save';
import { STORAGE_KEYS } from '../../config';
import { AcademicRulesEngine } from '../../features/grades';
import { PrerequisiteFlowchart } from '../../components/PrerequisiteFlowchart';
import type { Course } from '../../types';

export function TrainingProgramView() {
    const [searchTerm, setSearchTerm] = useState('');
    const [showFlowchart, setShowFlowchart] = useState(false);
    const [flowchartCourse, setFlowchartCourse] = useState<Course | null>(null);
    const { data: { courses, categories } } = useDepartmentData();

    // Lấy dữ liệu điểm số của sinh viên
    const studentDb = useMemo(() => {
        return readFromStorage<any>(STORAGE_KEYS.STUDENT_DB, null);
    }, []);

    // Kiểm tra miễn điểm Tiếng Anh (BLM)
    const hasBLMExemption = useMemo(() => {
        if (!studentDb || !studentDb.grades) return false;
        return AcademicRulesEngine.checkBLMExemption(studentDb.grades);
    }, [studentDb]);

    // Hàm xác định trạng thái môn học (Đã đậu, Rớt, Đang học, Chưa học)
    const getCourseStatus = useMemo(() => (courseId: string) => {
        if (!studentDb || !studentDb.grades) {
            if (hasBLMExemption && AcademicRulesEngine.ENGLISH_COURSE_IDS.includes(courseId)) {
                return 'passed' as const;
            }
            return 'none' as const;
        }
        return AcademicRulesEngine.getCourseStatus(courseId, studentDb.grades, hasBLMExemption);
    }, [studentDb, hasBLMExemption]);

    // Kiểm tra nhóm môn học có tính vào GPA không
    const isCourseExcludedFromGPA = (categoryName: string): boolean => {
        return AcademicRulesEngine.isCategoryExcludedFromGPA(categoryName);
    };

    // Xử lý mở Modal Sơ đồ tiên quyết
    const handleShowFlowchart = (courseId: string) => {
        const fullCourseMeta = courses.find(c => c.course_id === courseId);
        if (fullCourseMeta) {
            const courseMapping: Course = {
                id: fullCourseMeta.course_id,
                code: fullCourseMeta.course_id,
                name: fullCourseMeta.course_name_vi,
                nameVi: fullCourseMeta.course_name_vi,
                credits: parseInt((fullCourseMeta.credits) as any) || 0,
                prerequisites: [],
                needsRetake: false,
                isAvailable: true,
                description: fullCourseMeta.description || '',
                descriptionVi: fullCourseMeta.description || '',
                category: fullCourseMeta.category,
            };
            setFlowchartCourse(courseMapping);
            setShowFlowchart(true);
        }
    };

    // Xử lý logic Đệ quy để đắp dữ liệu vào Categories & Lọc theo Search
    const preprocessedCategories = useMemo(() => {
        const attachCoursesData = (cat: any): any => {
            let processedCat = { ...cat };

            // Hàm đắp thêm trạng thái học tập vào metadata môn học
            const getAllCoursesWithStatus = (courseIds: string[]) => {
                return courseIds
                    .map((id) => {
                        const metadata = courses.find((c) => c.course_id === id);
                        if (!metadata) return null;
                        return {
                            ...metadata,
                            status: getCourseStatus(id)
                        } as CourseData;
                    })
                    .filter((c): c is CourseData => c !== null);
            };

            // Hàm lọc môn học theo từ khóa tìm kiếm
            const filterBySearch = (courseList: CourseData[]) => {
                if (!searchTerm.trim()) return courseList;
                const lowerSearch = searchTerm.toLowerCase();
                return courseList.filter(c =>
                    c.course_name_vi.toLowerCase().includes(lowerSearch) ||
                    c.course_id.toLowerCase().includes(lowerSearch)
                );
            };

            // 1. Xử lý danh sách môn học cấp hiện tại
            if (processedCat.courses && Array.isArray(processedCat.courses)) {
                const allCourses = getAllCoursesWithStatus(processedCat.courses);
                processedCat.allCoursesData = allCourses;
                processedCat.coursesData = filterBySearch(allCourses);
            }

            // 2. Xử lý đệ quy cho các nhóm con (Breakdown)
            if (processedCat.breakdown) {
                processedCat.breakdown = Object.entries(processedCat.breakdown).reduce((acc: any, [key, subCat]: [string, any]) => {
                    acc[key] = attachCoursesData(subCat);
                    return acc;
                }, {});
            }

            // 3. Xử lý đệ quy cho các nhóm tùy chọn (Options)
            if (processedCat.options && Array.isArray(processedCat.options)) {
                processedCat.options = processedCat.options.map((opt: any) => {
                    if (opt.courses && Array.isArray(opt.courses)) {
                        const allCourses = getAllCoursesWithStatus(opt.courses);
                        return {
                            ...opt,
                            allCoursesData: allCourses,
                            coursesData: filterBySearch(allCourses),
                        };
                    }
                    return opt;
                });
            }

            return processedCat;
        };

        // Duyệt toàn bộ Object Categories gốc
        return Object.entries(categories).reduce((acc: any, [key, cat]: [string, any]) => {
            acc[key] = attachCoursesData(cat);
            return acc;
        }, {});

    }, [searchTerm, getCourseStatus, courses, categories]);

    return (
        <div className="animate-in fade-in duration-500">
            {courses.length === 0 ? (
                /* --- TRẠNG THÁI TRỐNG (Đã fix lỗi UI) --- */
                <div className="flex flex-col items-center justify-center p-8 mt-8 bg-white border border-dashed border-blue-200 rounded-2xl shadow-sm">
                    <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-5 shadow-sm ring-4 ring-white">
                        <DatabaseBackup className="w-10 h-10 text-blue-500" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Đang cập nhật dữ liệu</h2>
                    <p className="text-gray-500 max-w-md mx-auto text-center leading-relaxed">
                        Chương trình đào tạo cho chuyên ngành và khóa học này hiện đang trong quá trình thu thập. Vui lòng quay lại kiểm tra sau.
                    </p>
                </div>
            ) : (
                /* --- GIAO DIỆN CHÍNH --- */
                <>
                    {/* Header Banner */}
                    <div className="mb-6 p-4 bg-blue-50 border border-blue-100 rounded-xl flex items-start gap-3 shadow-sm">
                        <Info className="w-5 h-5 text-[#004A98] flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                            <h3 className="text-sm font-bold text-[#004A98]">
                                Chương trình đào tạo toàn khóa
                            </h3>
                            <p className="text-sm text-blue-800/80 mt-1">
                                Danh sách tổng hợp các môn học thuộc chương trình đào tạo phân theo từng nhóm. Tra cứu số tín chỉ, môn tiên quyết và tiến độ học tập của bạn tại đây.
                            </p>
                        </div>
                    </div>

                    {/* Thanh Tìm kiếm & Lọc */}
                    <div className="flex flex-col sm:flex-row items-center gap-3 mb-8">
                        <div className="flex-1 relative w-full">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Tìm kiếm theo mã môn hoặc tên môn..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-10 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#004A98]/20 focus:border-[#004A98] transition-all shadow-sm text-sm"
                            />
                            {/* Nút Clear Search - Nâng cấp UX */}
                            {searchTerm && (
                                <button
                                    onClick={() => setSearchTerm('')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-100 transition-colors"
                                >
                                    <X className="w-4 h-4 text-gray-500" />
                                </button>
                            )}
                        </div>
                        <button className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm">
                            <Filter className="w-4 h-4 text-gray-600" />
                            <span className="text-gray-700 text-sm font-medium">Lọc môn học</span>
                        </button>
                    </div>

                    {/* Danh sách các Category Môn học */}
                    <div className="space-y-6">
                        {Object.entries(preprocessedCategories).map(([key, category]) => (
                            <CategoryNode
                                key={key}
                                category={category}
                                isCourseExcludedFromGPA={isCourseExcludedFromGPA}
                                onShowFlowchart={handleShowFlowchart}
                            />
                        ))}
                    </div>

                    {/* Modal Flowchart */}
                    {showFlowchart && flowchartCourse && (
                        <PrerequisiteFlowchart
                            course={flowchartCourse}
                            allCourses={[]}
                            onClose={() => setShowFlowchart(false)}
                        />
                    )}
                </>
            )}
        </div>
    );
}