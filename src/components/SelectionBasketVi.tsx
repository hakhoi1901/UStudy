import { useState } from 'react';
import { X, CheckCircle2, ListFilter, AlertTriangle } from 'lucide-react';
import type { Course } from '../types';
import { useDepartmentData } from '../context/DepartmentContext';
import { FinancialLogic } from '../logic/FinancialLogic';
import { CourseClassFilterModal } from './CourseClassFilterModal';



interface SelectionBasketViProps {
    selectedCourses: Course[];
    onRemoveCourse: (courseId: string) => void;
    allowedClassesMap: Record<string, string[]>;
    setAllowedClassesMap: React.Dispatch<React.SetStateAction<Record<string, string[]>>>;
}

export function SelectionBasketVi({ selectedCourses, onRemoveCourse, allowedClassesMap, setAllowedClassesMap }: SelectionBasketViProps) {
    const [filterModalCourse, setFilterModalCourse] = useState<Course | null>(null);
    const { data: { tuitionRates: tuition_rates, courses: allCoursesMeta } } = useDepartmentData();
    const totalCredits = selectedCourses.reduce((sum, course) => sum + course.credits, 0);
    const missingMetaCourses: string[] = [];

    const estimatedTuition = selectedCourses.reduce((sum, course) => {
        const { courseFee, missingMeta } = FinancialLogic.calculateCourseFee(
            course.code, course.credits, tuition_rates, allCoursesMeta
        );
        course.price = courseFee;

        if (missingMeta) {
            missingMetaCourses.push(course.code);
        }

        return sum + courseFee;
    }, 0);
    const formatCurrency = (amount: number) => FinancialLogic.formatCurrency(amount);

    return (
        <div className="w-80 bg-white rounded-xl shadow-lg border border-gray-200 flex flex-col max-h-[calc(100vh-140px)]">
            {/* Header - Fixed */}
            <div className="p-4 border-b border-gray-200 flex-shrink-0">
                <h3 className="text-gray-900 font-semibold">Giỏ môn học</h3>
                <p className="text-sm text-gray-600 mt-1">
                    {selectedCourses.length} môn học đã chọn
                </p>
                <div className="mt-2 flex items-center gap-1.5 text-xs text-green-600">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Dữ liệu được lấy từ Portal</span>
                </div>
            </div>

            {/* Course List - Scrollable */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {selectedCourses.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <span className="text-2xl">📚</span>
                        </div>
                        <p className="text-gray-400 text-sm">Chưa có môn học nào được chọn</p>
                        <p className="text-gray-400 text-xs mt-1">Chọn môn từ danh sách bên trái</p>
                    </div>
                ) : (
                        selectedCourses.map((course) => (
                            <div
                                key={course.id}
                                className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors group"
                            >
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">
                                        {course.code}
                                    </p>
                                    <p className="text-xs text-gray-600 truncate">{course.nameVi}</p>
                                    {course.price !== 0
                                        ? <p className="text-xs text-gray-600 truncate">{formatCurrency(course.price as number) + ' đ'}</p>
                                        : <p className="text-xs text-red-600 truncate">Hệ thống không tìm thấy học phí</p>
                                    }

                                    <div className="flex items-center gap-2 mt-1.5">
                                        <span className="text-xs text-gray-500">{course.credits} tín chỉ</span>
                                        {course.needsRetake && (
                                            <span className="px-1.5 py-0.5 bg-red-100 text-red-700 text-[10px] rounded-full">
                                                Học lại
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex flex-col gap-1 flex-shrink-0 opacity-100 transition-opacity">
                                    <button
                                        onClick={() => setFilterModalCourse(course)}
                                        className="p-1 hover:bg-blue-100 rounded text-blue-600 transition-colors"
                                        title="Lọc lớp học"
                                    >
                                        <ListFilter className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => onRemoveCourse(course.id)}
                                        className="p-1 hover:bg-red-100 rounded text-red-600 transition-colors"
                                        title="Xóa khỏi giỏ"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))
                )}
            </div>

            {/* Footer - Sticky (Never scrolls out of view) */}
            <div className="border-t border-gray-200 p-4 bg-white flex-shrink-0 rounded-b-xl">
                {/* Credits Summary */}
                <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">Tổng tín chỉ:</span>
                        <span className="text-lg font-bold text-gray-900">{totalCredits}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                            className={`h-2.5 rounded-full transition-all ${totalCredits > 24 ? 'bg-red-500' : 'bg-[#004A98]'
                                }`}
                            style={{ width: `${Math.min((totalCredits / 24) * 100, 100)}%` }}
                        ></div>
                    </div>
                    {totalCredits > 24 && (
                        <p className="text-xs text-red-600 mt-1.5 flex items-center gap-1">
                            <span>⚠️</span>
                            <span>Vượt quá 24 tín chỉ tối đa mỗi học kỳ</span>
                        </p>
                    )}
                    {totalCredits > 0 && totalCredits <= 24 && (
                        <p className="text-xs text-gray-500 mt-1.5">
                            Còn lại {24 - totalCredits} tín chỉ có thể đăng ký
                        </p>
                    )}
                </div>

                {/* Tuition Summary */}
                <div className="mb-4">
                    {missingMetaCourses.length > 0 && (
                        <div className="mb-3 p-2.5 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 text-red-700">
                            <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <div className="text-xs">
                                <p className="font-semibold mb-0.5">Không tìm thấy thông tin học phí của môn học:</p>
                                <p className="font-mono">{missingMetaCourses.join(', ')}</p>
                                <p className="mt-1 text-red-600">Đang tạm tính: 0₫</p>
                            </div>
                        </div>
                    )}
                    <div className="p-3 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                        <p className="text-xs text-gray-600 mb-1">Tổng học phí dự kiến</p>
                        <p className="text-2xl font-bold text-[#004A98]">
                            {formatCurrency(estimatedTuition)}
                        </p>
                        <p className="text-[10px] text-gray-500 mt-1">VNĐ (đã bao gồm các khoản phí)</p>
                    </div>
                </div>

                {/* Confirm Button */}
                <button
                    className={`w-full py-3 rounded-lg font-medium transition-all ${selectedCourses.length === 0
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-[#004A98] text-white hover:bg-[#003A78] shadow-sm hover:shadow-md active:scale-[0.98]'
                        }`}
                    disabled={selectedCourses.length === 0}
                >
                    Xác nhận đăng ký
                </button>

                {/* Privacy Note */}
                <p className="text-[10px] text-gray-500 text-center mt-3 leading-relaxed">
                    Dữ liệu được lưu tại Local Storage và sẽ xóa khi Đăng xuất
                </p>
            </div>

            {/* Modal Lọc lớp học */}
            {filterModalCourse && (
                <CourseClassFilterModal
                    courseCode={filterModalCourse.id}
                    courseNameVi={filterModalCourse.nameVi}
                    isOpen={!!filterModalCourse}
                    onClose={() => setFilterModalCourse(null)}
                    allowedClassesMap={allowedClassesMap}
                    setAllowedClassesMap={setAllowedClassesMap}
                />
            )}
        </div>
    );
}