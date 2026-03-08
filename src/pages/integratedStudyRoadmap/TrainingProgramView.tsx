import { Info, Search, Filter } from 'lucide-react';
import { STORAGE_KEYS, ACADEMIC_RULES } from '../../config';
import { CategoryNode } from '../../components/CategoryNode';
import type { CourseData } from '../../components/CategoryNode';
import { useState, useMemo } from 'react';
import { useDepartmentData } from '../../context/DepartmentContext';
import { PrerequisiteFlowchart } from '../../components/PrerequisiteFlowchart';
import type { Course } from '../../types';

export function TrainingProgramView() {
    const [searchTerm, setSearchTerm] = useState('');
    const [showFlowchart, setShowFlowchart] = useState(false);
    const [flowchartCourse, setFlowchartCourse] = useState<Course | null>(null);
    const { data: { courses: courses_cntt, categories } } = useDepartmentData();

    const studentDb = useMemo(() => {
        try {
            const data = localStorage.getItem(STORAGE_KEYS.STUDENT_DB);
            return data ? JSON.parse(data) : null;
        } catch {
            return null;
        }
    }, []);

    const ENGLISH_COURSE_IDS = ['ADD00031', 'ADD00032', 'ADD00033', 'ADD00034'];

    const hasBLMExemption = useMemo(() => {
        if (!studentDb || !studentDb.grades) return false;
        const hasExemptionByBAA00100 = studentDb.grades.some(
            (g: any) => String(g.id).trim() === 'BAA00100' && String(g.type).trim() === 'M'
        );
        const hasExemptionByScore = studentDb.grades.some(
            (g: any) => ENGLISH_COURSE_IDS.includes(String(g.id).trim()) && String(g.score).trim().toUpperCase() === 'M'
        );
        return hasExemptionByBAA00100 || hasExemptionByScore;
    }, [studentDb]);

    const getCourseStatus = useMemo(() => (courseId: string): 'passed' | 'studying' | 'failed' | 'none' => {
        // BLM exemption: English courses are auto-passed
        if (hasBLMExemption && ENGLISH_COURSE_IDS.includes(courseId)) {
            return 'passed';
        }

        if (!studentDb || !studentDb.grades) return 'none';
        const gradeRecords = studentDb.grades.filter((g: any) => g.id === courseId);
        if (gradeRecords.length === 0) return 'none';

        // Check for CT (improvement) record — if exists, use only that
        const ctRecord = gradeRecords.find((g: any) => String(g.type).trim() === 'CT');
        const recordToCheck = ctRecord || gradeRecords[gradeRecords.length - 1];

        // Check if the effective record has a passing score (>= 5.0)
        const score = typeof recordToCheck.score === 'string' ? parseFloat(recordToCheck.score) : recordToCheck.score;

        if (typeof score === 'number' && !isNaN(score) && score >= 5.0) {
            return 'passed';
        }

        // Check if latest record has empty score (currently studying)
        if (recordToCheck.score === '' || recordToCheck.score === null || recordToCheck.score === undefined) {
            return 'studying';
        }

        // Has a score but didn't pass
        if (typeof score === 'number' && !isNaN(score) && score < 5.0) {
            return 'failed';
        }

        return 'none';
    }, [studentDb, hasBLMExemption]);

    const isCourseExcludedFromGPA = (courseName: string): boolean => {
        return ACADEMIC_RULES.EXCLUDED_COURSE_PREFIXES.some(prefix => courseName.startsWith(prefix.name));
    }

    const handleShowFlowchart = (courseId: string) => {
        const fullCourseMeta = courses_cntt.find(c => c.course_id === courseId);
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
                        const metadata = courses_cntt.find((c) => c.course_id === id);
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
        </div>
    );
}