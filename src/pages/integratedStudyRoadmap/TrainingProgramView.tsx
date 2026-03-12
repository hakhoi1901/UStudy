import { Info, Search, Filter, DatabaseBackup } from 'lucide-react';
import { CategoryNode } from '../../components/CategoryNode';
import type { CourseData } from '../../components/CategoryNode';
import { useState, useMemo } from 'react';
import { useDepartmentData } from '../../context/DepartmentContext';
import { readFromStorage } from '../../helpers/localStorage/save';
import { STORAGE_KEYS } from '../../config';
import { AcademicRulesEngine } from '../../logic/AcademicRulesEngine';
import { PrerequisiteFlowchart } from '../../components/PrerequisiteFlowchart';
import type { Course } from '../../types';

export function TrainingProgramView() {
    const [searchTerm, setSearchTerm] = useState('');
    const [showFlowchart, setShowFlowchart] = useState(false);
    const [flowchartCourse, setFlowchartCourse] = useState<Course | null>(null);
    const { data: { courses: courses, categories } } = useDepartmentData();

    const studentDb = useMemo(() => {
        return readFromStorage<any>(STORAGE_KEYS.STUDENT_DB, null);
    }, []);

    const hasBLMExemption = useMemo(() => {
        if (!studentDb || !studentDb.grades) return false;
        return AcademicRulesEngine.checkBLMExemption(studentDb.grades);
    }, [studentDb]);

    const getCourseStatus = useMemo(() => (courseId: string) => {
        if (!studentDb || !studentDb.grades) {
            // Still handle BLM exemption even without grades
            if (hasBLMExemption && AcademicRulesEngine.ENGLISH_COURSE_IDS.includes(courseId)) {
                return 'passed' as const;
            }
            return 'none' as const;
        }
        return AcademicRulesEngine.getCourseStatus(courseId, studentDb.grades, hasBLMExemption);
    }, [studentDb, hasBLMExemption]);

    const isCourseExcludedFromGPA = (categoryName: string): boolean => {
        return AcademicRulesEngine.isCategoryExcludedFromGPA(categoryName);
    }

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


    const preprocessedCategories = useMemo(() => {

        const attachCoursesData = (cat: any): any => {
            let processedCat = { ...cat };

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

            const filterBySearch = (courses: CourseData[]) => {
                if (!searchTerm) return courses;
                return courses.filter(c =>
                    c.course_name_vi.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    c.course_id.toLowerCase().includes(searchTerm.toLowerCase())
                );
            };

            if (processedCat.courses) {
                const allCourses = getAllCoursesWithStatus(processedCat.courses);
                processedCat.allCoursesData = allCourses;
                processedCat.coursesData = filterBySearch(allCourses);
            }

            if (processedCat.breakdown) {
                processedCat.breakdown = Object.entries(processedCat.breakdown).reduce((acc: any, [key, subCat]: [string, any]) => {
                    acc[key] = attachCoursesData(subCat);
                    return acc;
                }, {});
            }

            if (processedCat.options) {
                processedCat.options = processedCat.options.map((opt: any) => {
                    const allCourses = getAllCoursesWithStatus(opt.courses);
                    return {
                        ...opt,
                        allCoursesData: allCourses,
                        coursesData: filterBySearch(allCourses),
                    };
                });
            }

            return processedCat;
        };

        return Object.entries(categories).reduce((acc: any, [key, cat]: [string, any]) => {
            acc[key] = attachCoursesData(cat);
            return acc;
        }, {});

    }, [searchTerm, getCourseStatus]);


    return (
        <div>
            {courses.length === 0 ? (
                <div className="flex flex-col items-center justify-center">
                    <div className="flex flex-col w-0.5 rounded-xl p-12 items-center justify-center py-20 px-4 bg-white border border-blue-100 rounded-2xl shadow-sm text-center mt-4">
                        <div className="w-20 h-20 p-5 bg-blue-50 rounded-full flex items-center justify-center mb-5 border border-blue-100 shadow-sm">
                            <DatabaseBackup className="w-10 h-10 text-blue-500" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 mb-3">Đang cập nhật dữ liệu</h2>
                        <p className="text-gray-500 max-w-md mx-auto leading-relaxed">
                            Chương trình đào tạo cho chuyên ngành và khóa học này hiện đang trong quá trình thu thập và cập nhật. Vui lòng quay lại kiểm tra sau.
                        </p>
                    </div>
                </div>
            ) : (
                <>
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

                        {Object.entries(preprocessedCategories).map(([key, category]) => (
                            <div key={key}>
                                <CategoryNode
                                    category={category}
                                    isCourseExcludedFromGPA={isCourseExcludedFromGPA}
                                    onShowFlowchart={handleShowFlowchart}
                                />
                            </div>
                        ))}
                    </div>

                    {/* Prerequisite Flowchart Modal */}
                    {showFlowchart && flowchartCourse && (
                        <PrerequisiteFlowchart
                            course={flowchartCourse}
                            allCourses={[]} // Passing empty array since PrerequisiteFlowchart now uses useDepartmentData internally
                            onClose={() => setShowFlowchart(false)}
                        />
                    )}
                </>
            )}
        </div>
    );
}