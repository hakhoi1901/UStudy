import { MobileCourseDetailContent, MobileCourseSheetFrame } from '../../components/course';
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

    const prerequisiteContent = (() => {
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
    })();

    const footer = sheetStep === 'details' && !isLocked ? (
        <button
            type="button"
            onClick={() => onSheetStepChange('semesters')}
            className="w-full rounded-xl bg-[#004A98] px-4 py-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#003A78]"
        >
            {selectedPlannedSemester ? 'Đổi học kỳ' : 'Lên lịch'}
        </button>
    ) : undefined;

    return (
        <MobileCourseSheetFrame
            courseCode={course.course_id}
            courseName={course.course_name_vi}
            onClose={onClose}
            footer={footer}
        >
            {sheetStep === 'details' ? (
                <MobileCourseDetailContent
                    course={{
                        code: course.course_id,
                        name: course.course_name_vi,
                        credits: course.credits,
                        type: course.course_type,
                        category: course.category,
                        theoryHours: course.theory_hours,
                        labHours: course.lab_hours,
                        exerciseHours: course.exercise_hours,
                        description: course.description,
                    }}
                    status={(
                        <StatusBadge
                            status={course.status || 'none'}
                            rootCompleted={rootCompleted}
                            isPlanned={manuallyPlannedCourseIds.has(course.course_id)}
                        />
                    )}
                    prerequisiteContent={prerequisiteContent}
                    additionalContent={selectedPlannedSemester ? (
                        <div className="mt-4 rounded-xl border border-indigo-100 bg-indigo-50 p-3">
                            <p className="text-xs font-medium text-indigo-700">Đã lên lịch ở</p>
                            <p className="mt-0.5 text-sm font-bold text-indigo-900">{selectedPlannedSemester.label}</p>
                        </div>
                    ) : undefined}
                />
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
        </MobileCourseSheetFrame>
    );
}
