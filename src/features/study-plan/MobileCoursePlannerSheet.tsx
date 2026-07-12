import { createPortal } from 'react-dom';
import { AlertTriangle, X } from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import type { CourseMeta, StudyPlanStorage, MobileSheetStep, PrerequisiteRule, StudyPlanSemester } from './types';

interface MobileCoursePlannerSheetProps {
    course: CourseMeta | null;
    studyPlan: StudyPlanStorage;
    sheetStep: MobileSheetStep;
    rootCompleted: boolean;
    isLocked: boolean;
    manuallyPlannedCourseIds: Set<string>;
    selectedPlannedSemester: StudyPlanSemester | null;
    prereqByCourse: Map<string, PrerequisiteRule[]>;
    getMissingPrerequisites: (courseId: string, semesterIndex: number) => string[];
    onClose: () => void;
    onSheetStepChange: (step: MobileSheetStep) => void;
    onAddCourseToSemester: (semesterId: string) => void;
}

export function MobileCoursePlannerSheet({
    course,
    studyPlan,
    sheetStep,
    rootCompleted,
    isLocked,
    manuallyPlannedCourseIds,
    selectedPlannedSemester,
    prereqByCourse,
    getMissingPrerequisites,
    onClose,
    onSheetStepChange,
    onAddCourseToSemester,
}: MobileCoursePlannerSheetProps) {
    if (!course) return null;

    return createPortal((
        <div className="fixed inset-x-0 top-0 bottom-[calc(64px+env(safe-area-inset-bottom))] z-[9000] lg:hidden">
            <button
                type="button"
                aria-label="Đóng"
                onClick={onClose}
                className="absolute inset-0 h-full w-full bg-gray-900/35"
            />
            <div className="absolute inset-x-0 bottom-0 flex max-h-[82vh] flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl">
                <div className="mx-auto mt-2 h-1.5 w-12 rounded-full bg-gray-300" />
                <div className="flex items-start justify-between gap-3 border-b border-gray-100 px-4 py-4">
                    <div className="min-w-0">
                        <p className="text-xs font-semibold uppercase text-gray-500">{course.course_id}</p>
                        <h2 className="mt-1 text-base font-bold leading-snug text-gray-900">{course.course_name_vi}</h2>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100"
                        aria-label="Đóng"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {sheetStep === 'details' ? (
                    <>
                        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
                            <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-3 text-sm">
                                <div className="grid grid-cols-2 gap-3 border-b border-gray-200 pb-3">
                                    <div className="rounded-lg bg-gray-50 p-3">
                                        <p className="text-[10px] font-medium uppercase text-gray-500">Tín chỉ</p>
                                        <p className="mt-1 text-sm font-bold text-gray-900">{course.credits} TC</p>
                                    </div>
                                    <div className="rounded-lg bg-gray-50 p-3">
                                        <p className="text-[10px] font-medium uppercase text-gray-500">Loại</p>
                                        <p className="mt-1 truncate text-sm font-bold text-gray-900">{course.course_type || '-'}</p>
                                    </div>
                                    <div className="rounded-lg bg-gray-50 p-3">
                                        <p className="text-[10px] font-medium uppercase text-gray-500">Trạng thái</p>
                                        <div className="mt-1">
                                            <StatusBadge
                                                status={course.status || 'none'}
                                                rootCompleted={rootCompleted}
                                                isPlanned={manuallyPlannedCourseIds.has(course.course_id)}
                                            />
                                        </div>
                                    </div>
                                    <div className="rounded-lg bg-gray-50 p-3">
                                        <p className="text-[10px] font-medium uppercase text-gray-500">Danh mục</p>
                                        <p className="mt-1 truncate text-xs font-semibold text-gray-900">{course.category || '-'}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-3 border-b border-gray-200 py-3">
                                    <div>
                                        <p className="text-[10px] font-medium uppercase text-gray-500">Lý thuyết</p>
                                        <p className="mt-1 text-xs font-semibold text-gray-900">{course.theory_hours || 0} tiết</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-medium uppercase text-gray-500">Thực hành</p>
                                        <p className="mt-1 text-xs font-semibold text-gray-900">{course.lab_hours || 0} tiết</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-medium uppercase text-gray-500">Bài tập</p>
                                        <p className="mt-1 text-xs font-semibold text-gray-900">{course.exercise_hours || 0} tiết</p>
                                    </div>
                                </div>

                                <div className="pt-3">
                                    <p className="text-[10px] font-medium uppercase text-gray-500">Ghi chú từ CTĐT</p>
                                    <p className="mt-1 text-xs leading-relaxed text-gray-700">
                                        {course.description || 'Chưa có ghi chú cho môn học này.'}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-4 rounded-xl border border-gray-200 bg-white p-3">
                                <div className="mb-2 flex items-center gap-2">
                                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                                    <h3 className="text-sm font-bold text-gray-900">Tiên quyết</h3>
                                </div>
                                {(() => {
                                    const rules = prereqByCourse.get(course.course_id) || [];
                                    if (selectedPlannedSemester) {
                                        const plannedIndex = studyPlan.semesters.findIndex((semester) => semester.id === selectedPlannedSemester.id);
                                        const missing = getMissingPrerequisites(course.course_id, plannedIndex);
                                        if (missing.length > 0) {
                                            return <p className="text-xs leading-relaxed text-amber-800">Thiếu: {missing.join(', ')}</p>;
                                        }
                                    }
                                    if (rules.length === 0) {
                                        return <p className="text-xs leading-relaxed text-gray-500">Chưa có dữ liệu tiên quyết cho môn này.</p>;
                                    }
                                    return <p className="text-xs leading-relaxed text-gray-600">Cần học trước: {rules.map((rule) => rule.prereq_id).join(', ')}</p>;
                                })()}
                            </div>

                            {selectedPlannedSemester && (
                                <div className="mt-4 rounded-xl border border-indigo-100 bg-indigo-50 p-3">
                                    <p className="text-xs font-medium text-indigo-700">Đã lên lịch ở</p>
                                    <p className="mt-0.5 text-sm font-bold text-indigo-900">{selectedPlannedSemester.label}</p>
                                </div>
                            )}
                        </div>

                        {!isLocked && (
                            <div className="border-t border-gray-100 bg-white px-4 pb-4 pt-3 shadow-[0_-8px_18px_rgba(15,23,42,0.06)]">
                                <button
                                    type="button"
                                    onClick={() => onSheetStepChange('semesters')}
                                    className="w-full rounded-xl bg-[#004A98] px-4 py-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#003A78]"
                                >
                                    {selectedPlannedSemester ? 'Đổi học kỳ' : 'Lên lịch'}
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
                        <button
                            type="button"
                            onClick={() => onSheetStepChange('details')}
                            className="mb-3 text-sm font-semibold text-[#004A98]"
                        >
                            Quay lại
                        </button>
                        <div className="space-y-2">
                            {studyPlan.semesters
                                .filter((semester) => !semester.isHistorical)
                                .map((semester) => {
                                    const semesterIndex = studyPlan.semesters.findIndex((item) => item.id === semester.id);
                                    const plannedIds = studyPlan.plan[semester.id] || [];
                                    const missing = getMissingPrerequisites(course.course_id, semesterIndex);
                                    const isCurrentSemester = selectedPlannedSemester?.id === semester.id;

                                    return (
                                        <button
                                            key={semester.id}
                                            type="button"
                                            onClick={() => onAddCourseToSemester(semester.id)}
                                            className={`w-full rounded-xl border p-3 text-left transition-colors ${isCurrentSemester ? 'border-indigo-300 bg-indigo-50' : 'border-gray-200 bg-white hover:bg-gray-50'}`}
                                        >
                                            <div className="flex items-center justify-between gap-3">
                                                <div>
                                                    <p className="text-sm font-bold text-gray-900">{semester.label}</p>
                                                    <p className="mt-0.5 text-xs text-gray-500">{plannedIds.length} môn</p>
                                                </div>
                                                {isCurrentSemester && (
                                                    <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-semibold text-indigo-700">
                                                        Đang chọn
                                                    </span>
                                                )}
                                            </div>
                                            {missing.length > 0 && (
                                                <p className="mt-2 rounded-lg bg-amber-50 px-2 py-1.5 text-[11px] leading-relaxed text-amber-800">
                                                    Thiếu: {missing.join(', ')}
                                                </p>
                                            )}
                                        </button>
                                    );
                                })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    ), document.body);
}
