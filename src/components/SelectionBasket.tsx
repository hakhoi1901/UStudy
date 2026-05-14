import { useState } from 'react';
import { X, ListFilter } from 'lucide-react';
import type { Course } from '../types';
import { useDepartmentData } from '../context/DepartmentContext';
import { FinancialLogic } from '../logic/FinancialLogic';
import { CourseClassFilterModal } from './CourseClassFilterModal';
import type { Tab } from '../pages/integratedStudyRoadmap/IntegratedStudyRoadmap';
import type { ClassPreferenceSelection } from '../logic/scheduler/GroupTypes';
import type React from 'react';

interface SelectionBasketProps {
    selectedCourses: Course[];
    solve?: (courses: Course[], allowedClassesMap: Record<string, string[]>) => void;
    setActiveTab?: (tab: Tab) => void;
    onRemoveCourse?: (courseId: string) => void;
    allowedClassesMap?: Record<string, string[]>;
    setAllowedClassesMap?: React.Dispatch<React.SetStateAction<Record<string, string[]>>>;
    classPreferenceMap?: Record<string, ClassPreferenceSelection>;
    setClassPreferenceMap?: React.Dispatch<React.SetStateAction<Record<string, ClassPreferenceSelection>>>;
    compact?: boolean;
    title?: string;
    description?: string;
}

const ENGLISH_COURSE_IDS = ['ADD00031', 'ADD00032', 'ADD00033', 'ADD00034', 'BAA00100', 'BAA00021'];

export function SelectionBasket({
    selectedCourses,
    solve,
    setActiveTab,
    onRemoveCourse,
    allowedClassesMap,
    setAllowedClassesMap,
    classPreferenceMap,
    setClassPreferenceMap,
    compact = false,
    title = 'Giỏ môn học',
    description,
}: SelectionBasketProps) {
    const [filterModalCourse, setFilterModalCourse] = useState<Course | null>(null);
    const { data: { tuitionRates: tuition_rates, courses: allCoursesMeta } } = useDepartmentData();
    const totalCredits = selectedCourses
        .filter(course => !ENGLISH_COURSE_IDS.includes(course.id))
        .reduce((sum, course) => sum + course.credits, 0);

    const estimatedTuition = selectedCourses.reduce((sum, course) => {
        const { courseFee } = FinancialLogic.calculateCourseFee(
            course.code,
            course.credits,
            tuition_rates,
            allCoursesMeta
        );
        course.price = courseFee;
        return sum + courseFee;
    }, 0);

    const formatCurrency = (amount: number) => FinancialLogic.formatCurrency(amount);

    return (
        <div className={`w-full h-full bg-white rounded-xl border border-gray-200 flex flex-col overflow-hidden ${compact ? '' : 'shadow-lg'}`}>
            <div className="w-full p-4 border-b border-gray-200 flex-shrink-0">
                <h3 className="text-gray-900 font-semibold">{title}</h3>
                <p className="text-sm text-gray-600 mt-1">
                    {description ?? `${selectedCourses.length} môn học đã chọn`}
                </p>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-track]:bg-gray-100">
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
                                    ? <p className="text-xs text-gray-600 truncate">{formatCurrency(course.price as number)} đ</p>
                                    : <p className="text-xs text-red-600 truncate">Môn này không nằm trong CTĐT của bạn.</p>
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
                                {(allowedClassesMap && setAllowedClassesMap) && (
                                    <button
                                        onClick={() => setFilterModalCourse(course)}
                                        className="p-1 hover:bg-blue-100 rounded text-blue-600 transition-colors"
                                        title="Lọc lớp học"
                                    >
                                        <ListFilter className="w-4 h-4" />
                                    </button>
                                )}
                                {onRemoveCourse && (
                                    <button
                                        onClick={() => onRemoveCourse(course.id)}
                                        className="p-1 hover:bg-red-100 rounded text-red-600 transition-colors"
                                        title="Xóa khỏi giỏ"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {!compact && (
                <div className="border-t border-gray-200 p-4 bg-white flex-shrink-0 rounded-b-xl">
                    <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-600">Tổng tín chỉ:</span>
                            <span className="text-lg font-bold text-gray-900">{totalCredits}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div
                                className={`h-2.5 rounded-full transition-all ${totalCredits > 24 ? 'bg-red-500' : 'bg-[#004A98]'}`}
                                style={{ width: `${Math.min((totalCredits / 25) * 100, 100)}%` }}
                            />
                        </div>
                        {totalCredits > 24 && (
                            <p className="text-xs text-red-600 mt-1.5 flex items-center gap-1">
                                <span>⚠️</span>
                                <span>Vượt quá 25 tín chỉ tối đa mỗi học kỳ</span>
                            </p>
                        )}
                        {totalCredits > 0 && totalCredits <= 24 && (
                            <p className="text-xs text-gray-500 mt-1.5">
                                Còn lại {24 - totalCredits} tín chỉ có thể đăng ký
                            </p>
                        )}
                    </div>

                    <div className="mb-4">
                        <div className="p-3 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                            <p className="text-xs text-gray-600 mb-1">Tổng học phí dự kiến</p>
                            <p className="text-2xl font-bold text-[#004A98]">
                                {formatCurrency(estimatedTuition)} VNĐ
                            </p>
                        </div>
                    </div>

                    {(solve && setActiveTab) && (
                        <button
                            className={`w-full py-3 rounded-lg font-medium transition-all ${selectedCourses.length === 0
                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                : 'bg-[#004A98] text-white hover:bg-[#003A78] shadow-sm hover:shadow-md active:scale-[0.98]'
                                }`}
                            disabled={selectedCourses.length === 0}
                            onClick={() => {
                                setActiveTab('calendar');
                                solve(selectedCourses, allowedClassesMap || {});
                            }}
                        >
                            Xác nhận đăng ký
                        </button>
                    )}

                    <p className="text-[10px] text-gray-500 text-center mt-3 leading-relaxed">
                        Dữ liệu được lưu tại Local Storage và sẽ xóa khi Đăng xuất
                    </p>
                </div>
            )}

            {(filterModalCourse && allowedClassesMap && setAllowedClassesMap) && (
                <CourseClassFilterModal
                    courseCode={filterModalCourse.id}
                    courseNameVi={filterModalCourse.nameVi}
                    isOpen={!!filterModalCourse}
                    onClose={() => setFilterModalCourse(null)}
                    allowedClassesMap={allowedClassesMap}
                    setAllowedClassesMap={setAllowedClassesMap}
                    classPreferenceMap={classPreferenceMap}
                    setClassPreferenceMap={setClassPreferenceMap}
                />
            )}
        </div>
    );
}
