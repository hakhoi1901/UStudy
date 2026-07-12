import { AlertTriangle, Plus, RotateCcw, Trash2 } from 'lucide-react';
import type { CourseDragStartHandler, CourseMeta, DraftStorage } from './types';

interface DraftSemesterPanelProps {
    mobileVisible: boolean;
    draft: DraftStorage;
    courseById: Map<string, CourseMeta>;
    activeDropId: string | null;
    plannedStats: { courses: number; credits: number };
    getAccumulationCredits: (courseId: string) => number;
    getMissingPrerequisites: (courseId: string, semesterIndex: number) => string[];
    onActiveDropIdChange: (semesterId: string | null) => void;
    onAddCourseToSemester: (courseId: string, semesterId: string) => void;
    onRemoveCourseFromSemester: (courseId: string, semesterId: string) => void;
    onAddSemester: () => void;
    onClearDraft: () => void;
    onDragStart: CourseDragStartHandler;
}

export function DraftSemesterPanel({
    mobileVisible,
    draft,
    courseById,
    activeDropId,
    plannedStats,
    getAccumulationCredits,
    getMissingPrerequisites,
    onActiveDropIdChange,
    onAddCourseToSemester,
    onRemoveCourseFromSemester,
    onAddSemester,
    onClearDraft,
    onDragStart,
}: DraftSemesterPanelProps) {
    return (
        <aside className={`${mobileVisible ? 'block' : 'hidden'} lg:sticky lg:top-0 lg:block lg:max-h-[calc(100vh-11rem)] lg:pl-3`}>
            <div className="flex h-full flex-col rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="border-b border-gray-100 p-4">
                    <div className="mb-3 flex items-start justify-between gap-3">
                        <div>
                            <h2 className="text-base font-bold text-gray-900">Khung học kỳ</h2>
                            <p className="mt-0.5 text-xs text-gray-500">
                                {plannedStats.courses} môn · {plannedStats.credits} tín chỉ tích lũy
                            </p>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <button
                                type="button"
                                onClick={onAddSemester}
                                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-700 transition-colors hover:bg-gray-50"
                                title="Thêm học kỳ"
                            >
                                <Plus className="h-4 w-4" />
                            </button>
                            <button
                                type="button"
                                onClick={onClearDraft}
                                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-700 transition-colors hover:bg-gray-50"
                                title="Xóa nháp"
                            >
                                <RotateCcw className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                    <p className="rounded-lg bg-gray-50 px-3 py-2 text-xs leading-relaxed text-gray-600">
                        Các học kỳ đã/đang học được tự điền từ dữ liệu điểm. Môn thiếu tiên quyết sẽ hiện cảnh báo ngay trong học kỳ.
                    </p>
                </div>

                <div className="flex-1 space-y-3 overflow-y-auto p-4">
                    {draft.semesters.map((semester, semesterIndex) => {
                        const plannedIds = draft.plan[semester.id] || [];
                        const totalCredits = plannedIds.reduce((sum, courseId) => sum + getAccumulationCredits(courseId), 0);
                        const warningCount = plannedIds.filter((courseId) => getMissingPrerequisites(courseId, semesterIndex).length > 0).length;

                        return (
                            <div
                                key={semester.id}
                                onDragOver={(event) => {
                                    if (semester.isHistorical) return;
                                    event.preventDefault();
                                    onActiveDropIdChange(semester.id);
                                }}
                                onDragLeave={() => onActiveDropIdChange(null)}
                                onDrop={(event) => {
                                    if (semester.isHistorical) return;
                                    event.preventDefault();
                                    const courseId = event.dataTransfer.getData('text/plain');
                                    onAddCourseToSemester(courseId, semester.id);
                                    onActiveDropIdChange(null);
                                }}
                                className={`rounded-lg bg-white transition-all p-2 ${
                                    activeDropId === semester.id
                                        ? "border-[#004A98] ring-2 ring-[#004A98]/10"
                                        : "border-gray-200"
                                }`}
                            >
                                <div className="mb-2 flex items-center justify-between gap-2">
                                    <div>
                                        <div className="flex flex-wrap items-center gap-2">
                                            <h3 className="text-sm font-bold text-gray-900">{semester.label}</h3>
                                            {semester.isHistorical && (
                                                <span className="rounded-full px-2 py-0.5 text-[10px] font-medium bg-[#004A98] text-white">
                                                    Từ dữ liệu
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-500">
                                            {plannedIds.length} môn · {totalCredits} TC tích lũy
                                        </p>
                                    </div>
                                    {warningCount > 0 && (
                                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-700">
                                            <AlertTriangle className="h-3 w-3" />
                                            {warningCount}
                                        </span>
                                    )}
                                </div>

                                {plannedIds.length === 0 ? (
                                    <div className="rounded-lg border border-dashed border-gray-300 bg-white px-3 py-5 text-center text-xs text-gray-500">
                                        {semester.isHistorical ? 'Chưa có dữ liệu môn trong kỳ này' : 'Thả môn vào đây'}
                                    </div>
                                ) : (
                                    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
                                        {plannedIds.map((courseId) => {
                                            const course = courseById.get(courseId);
                                            if (!course) return null;

                                            const missingPrereqs = getMissingPrerequisites(courseId, semesterIndex);
                                            return (
                                                <div
                                                    key={courseId}
                                                    draggable={!semester.isHistorical}
                                                    onDragStart={(event) => onDragStart(courseId, event)}
                                                    className="border-b border-gray-200 bg-white px-3 py-2.5 last:border-b-0"                                               >
                                                    <div className="flex items-start gap-2 ">
                                                        <div className="min-w-0 flex-1">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-xs font-bold text-gray-900 pt-1">{course.course_id}</span>
                                                                <span className="text-[11px] font-semibold tabular-nums text-gray-500">
                                                                    {course.credits}
                                                                    <span className="ml-1 font-medium text-gray-400">TC</span>
                                                                </span>
                                                            </div>
                                                            <p className="mt-1 truncate text-xs font-medium text-gray-600">
                                                                {course.course_name_vi}
                                                            </p>
                                                        </div>
                                                        {!semester.isHistorical && (
                                                            <button
                                                                type="button"
                                                                onClick={() => onRemoveCourseFromSemester(courseId, semester.id)}
                                                                className="rounded-md p-1 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
                                                                title="Xóa khỏi học kỳ"
                                                            >
                                                                <Trash2 className="h-3.5 w-3.5" />
                                                            </button>
                                                        )}
                                                    </div>

                                                    {missingPrereqs.length > 0 && (
                                                        <div className="mt-2 rounded-md bg-amber-50 px-2 py-1.5 text-[11px] leading-relaxed text-amber-800">
                                                            Thiếu: {missingPrereqs.join(', ')}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </aside>
    );
}
