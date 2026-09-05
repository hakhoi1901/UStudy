import { useState } from 'react';
import { BookOpen, X, ListFilter } from 'lucide-react';
import type { Course } from '../../../types';
import { useDepartmentData } from '../../../context/DepartmentContext';
import { FinancialLogic } from '../../../logic/FinancialLogic';
import { getTuitionRates } from '../../../assets/data/tuition';
import { CourseClassFilterModal } from './CourseClassFilterModal';
import type { ClassPreferenceSelection } from '../../group-schedule/types';
import type React from 'react';

interface SelectionBasketProps {
    selectedCourses: Course[];
    registeredCourseCodes?: ReadonlySet<string>;
    courseCatalog?: Course[];
    onRemoveCourse?: (courseId: string) => void;
    allowedClassesMap?: Record<string, string[]>;
    setAllowedClassesMap?: React.Dispatch<React.SetStateAction<Record<string, string[]>>>;
    classPreferenceMap?: Record<string, ClassPreferenceSelection>;
    setClassPreferenceMap?: React.Dispatch<React.SetStateAction<Record<string, ClassPreferenceSelection>>>;
    compact?: boolean;
    title?: string;
    description?: string;
}

function normalizeCourseCode(value: unknown): string {
    return String(value ?? '').trim().toUpperCase();
}

function parseCredits(value: unknown): number {
    const credits = Number.parseFloat(String(value ?? '').replace(',', '.'));
    return Number.isFinite(credits) ? credits : 0;
}

export function SelectionBasket({
    selectedCourses,
    registeredCourseCodes,
    courseCatalog = [],
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
    const {
        data: { tuitionRates: tuition_rates, courses: allCoursesMeta },
        majorId,
        academicYear,
    } = useDepartmentData();
    const selectedCourseCodes = new Set(selectedCourses.map(course => normalizeCourseCode(course.code || course.id)));
    const registeredOnlyCourseCodes = Array.from(new Set(
        Array.from(registeredCourseCodes ?? []).map(normalizeCourseCode).filter(Boolean),
    )).filter(courseCode => !selectedCourseCodes.has(courseCode));
    const creditsByCourseCode = new Map<string, number>();
    courseCatalog.forEach(course => {
        creditsByCourseCode.set(normalizeCourseCode(course.code || course.id), parseCredits(course.credits));
    });
    allCoursesMeta.forEach(course => {
        const courseCode = normalizeCourseCode(course.course_id);
        const credits = parseCredits(course.credits);
        if (credits > 0 || !creditsByCourseCode.has(courseCode)) {
            creditsByCourseCode.set(courseCode, credits);
        }
    });
    const selectedCredits = selectedCourses.reduce((sum, course) => sum + parseCredits(course.credits), 0);
    const registeredCredits = registeredOnlyCourseCodes.reduce(
        (sum, courseCode) => sum + (creditsByCourseCode.get(courseCode) ?? 0),
        0,
    );
    const totalCredits = selectedCredits + registeredCredits;
    const basketDescription = description ?? [
        `${selectedCourses.length} môn chọn thêm`,
        registeredOnlyCourseCodes.length > 0 ? `${registeredOnlyCourseCodes.length} môn trường đăng ký` : null,
    ].filter(Boolean).join(' · ');

    const selectedTuition = selectedCourses.reduce((sum, course) => {
        const { courseFee } = FinancialLogic.calculateCourseFee(
            course.code || course.id,
            course.credits,
            tuition_rates,
            allCoursesMeta
        );
        course.price = courseFee;
        return sum + courseFee;
    }, 0);
    const registeredTuitionCourses = registeredOnlyCourseCodes.map((courseCode) => ({
        id: courseCode,
        credits: creditsByCourseCode.get(courseCode) ?? 0,
    }));
    const registeredTuition = FinancialLogic.calculateTotalTuition(
        registeredTuitionCourses,
        tuition_rates,
        allCoursesMeta,
    );
    const estimatedTuition = selectedTuition + registeredTuition;
    const allTuitionCourses = [
        ...selectedCourses.map((course) => ({
            id: normalizeCourseCode(course.code || course.id),
            credits: parseCredits(course.credits),
        })),
        ...registeredTuitionCourses,
    ];
    const forecastAcademicYear = '2026-2027';
    const comparisonAcademicYear = academicYear === forecastAcademicYear
        ? '2025-2026'
        : forecastAcademicYear;
    const comparisonTuition = FinancialLogic.calculateTotalTuition(
        allTuitionCourses,
        getTuitionRates(comparisonAcademicYear, majorId),
        allCoursesMeta,
    );

    const formatCurrency = (amount: number) => FinancialLogic.formatCurrency(amount);

    return (
        <div className={`ustudy-card flex h-full w-full flex-col overflow-hidden ${compact ? '' : 'shadow-lg'}`}>
            <div className="w-full flex-shrink-0 border-b border-gray-200 p-4">
                <h3 className="ustudy-card-title">{title}</h3>
                <p className="ustudy-card-subtitle mt-1">
                    {basketDescription}
                </p>
            </div>

            <div className="ustudy-scrollbar flex-1 space-y-2 overflow-y-auto p-3">
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
                <div className="flex-shrink-0 rounded-b-xl border-t border-gray-200 bg-white p-3">
                    <div className="mb-3">
                        <div className="mb-1.5 flex items-center justify-between">
                            <span className="text-sm text-gray-600">Tổng tín chỉ:</span>
                            <span className="text-lg font-bold text-gray-900">{totalCredits}</span>
                        </div>
                        {registeredOnlyCourseCodes.length > 0 && (
                            <div className="mb-1.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-gray-500">
                                <span>Trường đăng ký <strong className="font-semibold text-gray-700">{registeredCredits} TC</strong></span>
                                <span>Chọn thêm <strong className="font-semibold text-gray-700">{selectedCredits} TC</strong></span>
                            </div>
                        )}
                        <div className="h-2 w-full rounded-full bg-gray-200">
                            <div
                                className={`h-2 rounded-full transition-all ${totalCredits > 24 ? 'bg-red-500' : 'bg-[#004A98]'}`}
                                style={{ width: `${Math.min((totalCredits / 25) * 100, 100)}%` }}
                            />
                        </div>
                        {totalCredits > 25 && (
                            <p className="text-xs text-red-600 mt-1.5 flex items-center gap-1">
                                <span>⚠️</span>
                                <span>Vượt quá 25 tín chỉ tối đa mỗi học kỳ</span>
                            </p>
                        )}
                        {totalCredits > 0 && totalCredits <= 25 && (
                            <p className="text-xs text-gray-500 mt-1.5">
                                Còn lại {25 - totalCredits} tín chỉ có thể đăng ký
                            </p>
                        )}
                    </div>

                    <div className="mb-3">
                        <div className="ustudy-muted-panel border border-blue-100 bg-blue-50">
                            <div className="flex items-baseline justify-between gap-3">
                                <p className="text-xs text-gray-600">Tổng học phí dự kiến</p>
                                <p className="shrink-0 text-lg font-bold tabular-nums text-[#004A98]">
                                    {formatCurrency(estimatedTuition)} VNĐ
                                </p>
                            </div>
                            <div className="mt-1 flex items-center justify-between gap-3 border-t border-blue-100 pt-1.5 text-[11px]">
                                <span className="font-medium text-gray-600">
                                    {academicYear === forecastAcademicYear
                                        ? `Theo đơn giá ${comparisonAcademicYear}`
                                        : `Tham khảo ${comparisonAcademicYear}`}
                                </span>
                                <span className="shrink-0 font-semibold tabular-nums text-[#004A98]">
                                    {formatCurrency(comparisonTuition)} VNĐ
                                </span>
                            </div>
                            <p className="mt-1 text-[10px] leading-4 text-gray-500">
                                Tổng học phí dự kiến là dự đoán tham khảo, không phải mức thu chính thức của trường.
                            </p>
                        </div>
                    </div>

                    <p className="mt-2 text-center text-[10px] leading-relaxed text-gray-500">
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
