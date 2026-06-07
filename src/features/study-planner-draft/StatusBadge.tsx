import { CheckCircle2, Clock, XCircle } from 'lucide-react';
import type { CourseStatus } from './types';

interface StatusBadgeProps {
    status: CourseStatus;
    rootCompleted?: boolean;
    isPlanned?: boolean;
}

export function StatusBadge({ status, rootCompleted = false, isPlanned = false }: StatusBadgeProps) {
    if (isPlanned) {
        return (
            <span className="flex items-center justify-center gap-1 w-full px-1 md:px-2 py-0.5 md:py-1 bg-indigo-100 text-indigo-700 text-[9px] md:text-xs rounded-full font-medium whitespace-nowrap">
                <CheckCircle2 className="w-3 h-3 md:w-3.5 md:h-3.5 flex-shrink-0" />
                <span className="hidden md:inline">Đã lên lịch</span>
                <span className="md:hidden">Đã lịch</span>
            </span>
        );
    }

    if (status === 'passed') {
        return (
            <span className="flex items-center justify-center gap-1 w-full px-1 md:px-2 py-0.5 md:py-1 bg-green-100 text-green-700 text-[9px] md:text-xs rounded-full font-medium whitespace-nowrap">
                <CheckCircle2 className="w-3 h-3 md:w-3.5 md:h-3.5 flex-shrink-0" />
                <span className="hidden md:inline">Đã tích lũy</span>
                <span className="md:hidden">Đạt</span>
            </span>
        );
    }

    if (status === 'studying') {
        return (
            <span className="flex items-center justify-center gap-1 w-full px-1 md:px-2 py-0.5 md:py-1 bg-blue-100 text-[#004A98] text-[9px] md:text-xs rounded-full font-medium whitespace-nowrap">
                <Clock className="w-3 h-3 md:w-3.5 md:h-3.5 flex-shrink-0" />
                Đang học
            </span>
        );
    }

    if (status === 'failed') {
        return (
            <span className="flex items-center justify-center gap-1 w-full px-1 md:px-2 py-0.5 md:py-1 bg-red-100 text-red-700 text-[9px] md:text-xs rounded-full font-medium whitespace-nowrap">
                <XCircle className="w-3 h-3 md:w-3.5 md:h-3.5 flex-shrink-0" />
                Học lại
            </span>
        );
    }

    if (rootCompleted) {
        return (
            <span className="flex items-center justify-center gap-1 w-full px-1 md:px-2 py-0.5 md:py-1 bg-green-100 text-green-700 text-[9px] md:text-xs rounded-full font-medium whitespace-nowrap">
                Hoàn thành
            </span>
        );
    }

    return (
        <span className="block w-full text-center px-1 md:px-2 py-0.5 md:py-1 bg-gray-100 text-gray-500 text-[9px] md:text-xs rounded-full font-medium whitespace-nowrap">
            <span className="hidden md:inline">Chưa học</span>
            <span className="md:hidden">Chưa</span>
        </span>
    );
}
