import { useState } from 'react';
import { CalendarPlus, ChevronUp, ExternalLink, GitBranch, Trash2 } from 'lucide-react';
import { courseLinks } from '../../assets/data/courseLinks';
import { DocumentContributionModal } from '../../components/DocumentContributionModal';
import { StatusBadge } from './StatusBadge';
import type { CourseDragStartHandler, CourseMeta, MobilePlannerOpenHandler } from './types';

const prerequisiteStatusConfig = {
    passed: { label: 'Đã đạt', dotClass: 'bg-emerald-500', textClass: 'text-emerald-700' },
    studying: { label: 'Đang học', dotClass: 'bg-blue-500', textClass: 'text-blue-700' },
    failed: { label: 'Cần học lại', dotClass: 'bg-red-500', textClass: 'text-red-700' },
    none: { label: 'Chưa học', dotClass: 'bg-amber-400', textClass: 'text-amber-700' },
} as const;

function getPrerequisiteTypeLabel(type: string): string {
    const normalized = type.trim().toLocaleUpperCase('vi-VN');
    if (normalized === 'PREVIOUS') return 'Học trước';
    if (normalized === 'COREQUISITE' || normalized === 'CO-REQUISITE') return 'Song hành';
    return type || 'Tiên quyết';
}

interface StudyPlanCourseRowProps {
    course: CourseMeta;
    isPlanned: boolean;
    rootCompleted?: boolean;
    onDragStart: CourseDragStartHandler;
    onRemoveFromPlan: (courseId: string) => void;
    onOpenMobilePlanner: MobilePlannerOpenHandler;
}

export function StudyPlanCourseRow({
    course,
    isPlanned,
    rootCompleted = false,
    onDragStart,
    onRemoveFromPlan,
    onOpenMobilePlanner,
}: StudyPlanCourseRowProps) {
    const [showDetails, setShowDetails] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const status = course.status || 'none';
    const isLocked = status === 'passed' || status === 'studying' || rootCompleted;
    const getContainerStyle = () => {
    if (isPlanned) {
        return "border-gray-200 bg-white hover:bg-gray-50 border-l-3 border-l-indigo-500";
    }

    if (status === "passed" || rootCompleted) {
        return "border-gray-200 bg-white hover:bg-gray-50 border-l-3 border-l-emerald-600";
    }

    if (status === "failed") {
        return "border-gray-200 bg-white hover:bg-gray-50 border-l-3 border-l-red-500";
    }

    if (status === "studying") {
        return "border-gray-200 bg-white hover:bg-gray-50 border-l-3 border-l-blue-500";
    }

    return "border-gray-200 bg-white hover:bg-gray-50 border-l-3 border-l-gray-300";
};

    return (
        <div className="group">
            <div
                draggable={!isLocked}
                onClick={() => {
                    if (onOpenMobilePlanner(course, rootCompleted)) return;
                    setShowDetails((value) => !value);
                }}
                onDragStart={(event) => onDragStart(course.course_id, event)}
                className={`flex items-center gap-1.5 md:gap-3 px-2 md:px-4 py-2 md:py-2.5 border rounded-lg ${getContainerStyle()} ${isLocked ? 'cursor-pointer' : 'cursor-grab active:cursor-grabbing'} ${showDetails ? 'rounded-t-lg rounded-b-none' : 'rounded-lg'}`}
            >
                <div className="flex-1 min-w-0 flex flex-col md:flex-row md:items-center gap-0.5 md:gap-3">
                    <div className="md:w-24 flex-shrink-0">
                        <p className="text-[11px] md:text-sm font-semibold text-gray-900 leading-tight md:leading-normal">
                            {course.course_id}
                        </p>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-[10px] md:text-sm text-gray-500 md:text-gray-900 truncate font-medium leading-tight md:leading-normal">
                            {course.course_name_vi}
                        </p>
                    </div>
                </div>

                <div className="hidden md:block w-16 flex-shrink-0 text-center">
                    <span className="px-2 py-1 text-gray-700 text-xs rounded font-medium whitespace-nowrap">
                        {course.credits} TC
                    </span>
                </div>

                <div className="hidden md:block w-10 flex-shrink-0">
                    <span className="px-1 py-1 text-xs font-semibold uppercase tracking-wide text-gray-500" title={course.course_type}>
                        {course.course_type
                            ? course.course_type.slice(0, 2)
                            : "-"}
                    </span>
                </div>

                <div className="hidden flex-shrink-0 md:block">
                    <div className="w-28">
                        <StatusBadge status={status} rootCompleted={rootCompleted} isPlanned={isPlanned} />
                    </div>
                </div>

                <div className="flex items-center flex-shrink-0">
                    {!isLocked && (
                        <button
                            type="button"
                            onClick={(event) => {
                                event.stopPropagation();
                                onOpenMobilePlanner(course, rootCompleted);
                            }}
                            className="mr-0.5 inline-flex items-center justify-center rounded-lg border border-blue-100 bg-blue-50 p-1.5 text-[#004A98] transition-colors hover:bg-blue-100 md:hidden"
                            title={isPlanned ? 'Đổi học kỳ' : 'Lên lịch'}
                        >
                            <CalendarPlus className="h-4 w-4" />
                        </button>
                    )}
                    {isPlanned && (
                        <button
                            type="button"
                            onClick={(event) => {
                                event.stopPropagation();
                                onRemoveFromPlan(course.course_id);
                            }}
                            className="p-1 md:p-1.5 hover:bg-red-50 rounded transition-colors text-gray-500 hover:text-red-600"
                            title="Xóa khỏi kế hoạch"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={(event) => {
                            event.stopPropagation();
                            if (onOpenMobilePlanner(course, rootCompleted)) return;
                            setShowDetails((value) => !value);
                        }}
                        className="p-1 md:p-1.5 hover:bg-gray-200/60 rounded transition-colors"
                        title="Xem chi tiết"
                    >
                        
                        <ChevronUp className={showDetails ? "w-4 h-4 text-gray-600" : "rotate-180 w-4 h-4 text-gray-600"} />
                        
                    </button>
                </div>
            </div>

            {showDetails && (
                <div className="hidden rounded-b-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm md:block">

                    <div className="grid grid-cols-4 gap-3 border-b border-gray-200 py-3">
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
                        <div>
                            <p className="text-[10px] font-medium uppercase text-gray-500">Danh mục</p>
                            <p className="mt-1 truncate text-xs font-semibold text-gray-900">{course.category || '-'}</p>
                        </div>
                    </div>

                    {(course.prerequisites?.length ?? 0) > 0 && (
                        <div className="border-b border-gray-200 py-3">
                            <div className="flex items-center gap-2">
                                <GitBranch className="h-4 w-4 text-amber-600" />
                                <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">
                                    Môn tiên quyết
                                </p>
                            </div>

                            <div className="divide-y divide-gray-100">
                                {course.prerequisites?.map((prerequisite) => {
                                    const prerequisiteStatus = prerequisiteStatusConfig[prerequisite.status];
                                    return (
                                        <div
                                            key={`${prerequisite.id}-${prerequisite.type}`}
                                            className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 py-2"
                                        >
                                            <div className="min-w-0 flex-1">
                                                <p className="text-xs font-semibold text-gray-900">{prerequisite.id}</p>
                                                <p className="mt-0.5 truncate text-[11px] text-gray-500">{prerequisite.name}</p>
                                            </div>
                                            <div className="flex flex-shrink-0 items-center gap-3 text-[10px]">
                                                <span className="text-gray-500">{getPrerequisiteTypeLabel(prerequisite.type)}</span>
                                                <span className={`inline-flex items-center gap-1.5 font-semibold ${prerequisiteStatus.textClass}`}>
                                                    <span className={`h-1.5 w-1.5 rounded-full ${prerequisiteStatus.dotClass}`} />
                                                    {prerequisiteStatus.label}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    <div className="pt-3">
                        <p className="text-[10px] font-medium uppercase text-gray-500">Ghi chú từ CTĐT</p>
                        <p className="mt-1 text-xs leading-relaxed text-gray-700">
                            {course.description || 'Chưa có ghi chú cho môn học này.'}
                        </p>
                    </div>

                    <div className="mt-3 border-t border-gray-200 pt-3">
                        <p className="text-[10px] font-medium uppercase tracking-wide text-gray-500">Tài liệu tham khảo</p>
                        <div className="mt-2 flex flex-wrap items-center gap-3">
                            {courseLinks[course.course_id] ? (
                                <a
                                    href={courseLinks[course.course_id]}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-medium text-[#004A98] transition-colors hover:bg-blue-100 hover:text-[#003d7a]"
                                >
                                    <ExternalLink className="h-3.5 w-3.5" />
                                    Mở thư mục Drive tài liệu
                                </a>
                            ) : (
                                <span className="text-xs italic text-gray-500">Chưa có tài liệu cho môn học này.</span>
                            )}

                            <button
                                type="button"
                                onClick={() => setIsModalOpen(true)}
                                className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-green-700 transition-colors hover:border-green-600 hover:bg-green-50"
                                title="Đóng góp tài liệu, đề thi, bài tập cho môn này"
                            >
                                <ExternalLink className="h-3.5 w-3.5" />
                                Đóng góp tài liệu
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <DocumentContributionModal
                courseId={course.course_id}
                courseName={course.course_name_vi}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </div>
    );
}
