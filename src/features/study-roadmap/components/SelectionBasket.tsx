import { useState } from 'react';
import { BookOpen, X, ListFilter } from 'lucide-react';
import type { Course } from '../../../types';
import { useDepartmentData } from '../../../context/DepartmentContext';
import { FinancialLogic } from '../../../logic/FinancialLogic';
import { CourseClassFilterModal } from './CourseClassFilterModal';
import type { Tab } from '../types';
import type { ClassPreferenceSelection } from '../../group-schedule/types';
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
        <div className={`ustudy-card flex h-full w-full flex-col overflow-hidden ${compact ? '' : 'shadow-lg'}`}>
            <div className="w-full flex-shrink-0 border-b border-gray-200 p-4">
                <h3 className="ustudy-card-title">{title}</h3>
                <p className="ustudy-card-subtitle mt-1">
                    {description ?? `${selectedCourses.length} môn học đã chọn`}
                </p>
            </div>

            <div className="ustudy-scrollbar flex-1 space-y-3 overflow-y-auto p-4">
                {selectedCourses.length === 0 ? (
                    <div className="ustudy-empty-state flex-col">
                        <div className="ustudy-icon-badge ustudy-icon-primary-soft mx-auto mb-3 h-12 w-12 md:h-12 md:w-12">
                            <BookOpen className="h-5 w-5" />
                        </div>
                        <p className="text-gray-400 text-sm">Chưa có môn học nào được chọn</p>
                        <p className="text-gray-400 text-xs mt-1">Chọn môn từ danh sách bên trái</p>
                    </div>
                ) : (
                    selectedCourses.map((course) => (
                        <div
                            key={course.id}
                            className="ustudy-list-item group flex items-start gap-2"
                        >
                            <div className="flex-1 min-w-0">
                                <p className="text-xs text-gray-600 truncate">
                                    {course.code}
                                </p>
                                <span className="text-sm font-medium text-gray-900 truncate">{course.nameVi}</span> 
                                {course.price !== 0
                                    ? <p className="text-xs text-gray-600 truncate">{formatCurrency(course.price as number)} đ - {course.credits} tín chỉ</p> 
                                    : <p className="text-xs text-red-600 truncate">Môn này không nằm trong CTĐT của bạn.</p>
                                }

                                <div className="flex items-center gap-2 mt-1.5">
                                    
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
                                        className="ustudy-action-icon ustudy-action-icon-primary h-7 w-7"
                                        title="Lọc lớp học"
                                    >
                                        <ListFilter className="w-4 h-4" />
                                    </button>
                                )}
                                {onRemoveCourse && (
                                    <button
                                        onClick={() => onRemoveCourse(course.id)}
                                        className="ustudy-action-icon ustudy-action-icon-danger h-7 w-7"
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
                <div className="flex-shrink-0 rounded-b-xl border-t border-gray-200 bg-white p-4">
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
                        <div className="ustudy-muted-panel border border-blue-100 bg-blue-50">
                            <p className="text-xs text-gray-600 mb-1">Tổng học phí dự kiến</p>
                            <p className="text-2xl font-bold text-[#004A98]">
                                {formatCurrency(estimatedTuition)} VNĐ
                            </p>
                            <p className="mt-1.5 text-[11px] font-medium text-red-600">
                                Chưa áp dụng mức tăng học phí năm học 2026-2027
                            </p>
                        </div>
                    </div>

                    {(solve && setActiveTab) && (
                        <button
                            className={`w-full py-3 rounded-lg font-medium transition-all ${selectedCourses.length === 0
                                ? 'cursor-not-allowed bg-gray-200 text-gray-400'
                                : 'ustudy-button-primary'
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
