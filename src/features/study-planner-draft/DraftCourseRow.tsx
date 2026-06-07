import { useState } from 'react';
import { CalendarPlus, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import type { CourseDragStartHandler, CourseMeta, MobilePlannerOpenHandler } from './types';

interface DraftCourseRowProps {
    course: CourseMeta;
    isPlanned: boolean;
    rootCompleted?: boolean;
    onDragStart: CourseDragStartHandler;
    onRemoveFromPlan: (courseId: string) => void;
    onOpenMobilePlanner: MobilePlannerOpenHandler;
}

export function DraftCourseRow({
    course,
    isPlanned,
    rootCompleted = false,
    onDragStart,
    onRemoveFromPlan,
    onOpenMobilePlanner,
}: DraftCourseRowProps) {
    const [showDetails, setShowDetails] = useState(false);
    const status = course.status || 'none';
    const isLocked = status === 'passed' || status === 'studying' || rootCompleted;
    const getContainerStyle = () => {
        if (isPlanned) return 'border-indigo-200 bg-indigo-50/80 hover:bg-indigo-100 shadow-sm';
        if (status === 'passed' || rootCompleted) return 'border-green-300 bg-green-50/80 hover:bg-green-100 shadow-sm';
        if (status === 'failed') return 'border-red-200 bg-red-50 hover:bg-red-100';
        if (status === 'studying') return 'border-blue-200 bg-blue-50/50 hover:bg-blue-50';
        return 'border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300';
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
                className={`flex items-center gap-1.5 md:gap-3 px-2 md:px-4 py-2 md:py-2.5 border rounded-lg transition-all ${getContainerStyle()} ${isLocked ? 'cursor-pointer' : 'cursor-grab active:cursor-grabbing'}`}
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
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded font-medium whitespace-nowrap">
                        {course.credits} TC
                    </span>
                </div>

                <div className="hidden md:block w-10 flex-shrink-0">
                    <span className="px-1 py-1 bg-gray-100 text-gray-700 text-xs rounded-md font-medium inline-block truncate w-full text-center" title={course.course_type}>
                        {course.course_type || '-'}
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
                        {showDetails ? (
                            <ChevronUp className="w-4 h-4 text-gray-600" />
                        ) : (
                            <ChevronDown className="w-4 h-4 text-gray-600" />
                        )}
                    </button>
                </div>
            </div>

            {showDetails && (
                <div className="mt-2 hidden rounded-lg border border-gray-200 bg-gray-50 px-3 py-3 text-sm md:block">
                    <div className="grid grid-cols-2 gap-3 border-b border-gray-200 pb-3 md:grid-cols-4">
                        <div>
                            <p className="text-[10px] font-medium uppercase text-gray-500">Tín chỉ</p>
                            <p className="mt-1 text-xs font-semibold text-gray-900">{course.credits} TC</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-medium uppercase text-gray-500">Loại môn</p>
                            <p className="mt-1 text-xs font-semibold text-gray-900">{course.course_type || '-'}</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-medium uppercase text-gray-500">Trạng thái</p>
                            <div className="mt-1">
                                <StatusBadge status={status} rootCompleted={rootCompleted} isPlanned={isPlanned} />
                            </div>
                        </div>
                        <div>
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
            )}
        </div>
    );
}
