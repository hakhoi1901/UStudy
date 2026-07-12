import type { CourseStatus } from './types';

interface StatusBadgeProps {
    status: CourseStatus;
    rootCompleted?: boolean;
    isPlanned?: boolean;
}

type DisplayStatus = CourseStatus | 'planned' | 'rootCompleted';

const STATUS_META: Record<DisplayStatus, {
    label: string;
    mobileLabel: string;
    barClass: string;
    textClass: string;
}> = {
    planned: {
        label: 'Đã lên lịch',
        mobileLabel: 'Đã lịch',
        barClass: 'bg-indigo-500',
        textClass: 'text-indigo-700',
    },
    passed: {
        label: 'Đã tích lũy',
        mobileLabel: 'Đạt',
        barClass: 'bg-emerald-500',
        textClass: 'text-emerald-700',
    },
    studying: {
        label: 'Đang học',
        mobileLabel: 'Đang học',
        barClass: 'bg-blue-500',
        textClass: 'text-[#004A98]',
    },
    failed: {
        label: 'Học lại',
        mobileLabel: 'Học lại',
        barClass: 'bg-rose-500',
        textClass: 'text-rose-700',
    },
    rootCompleted: {
        label: 'Hoàn thành',
        mobileLabel: 'Xong',
        barClass: 'bg-emerald-500',
        textClass: 'text-emerald-700',
    },
    none: {
        label: 'Chưa học',
        mobileLabel: 'Chưa',
        barClass: 'bg-gray-300',
        textClass: 'text-gray-500',
    },
};

export function StatusBadge({ status, rootCompleted = false, isPlanned = false }: StatusBadgeProps) {
    const displayStatus: DisplayStatus = isPlanned ? 'planned' : rootCompleted ? 'rootCompleted' : status;
    const meta = STATUS_META[displayStatus];

    return (
        <span className="inline-flex w-full items-center gap-2 text-left">
            <span className={`h-4 w-1 rounded-full ${meta.barClass}`} />
            <span className={`text-[11px] font-semibold md:text-sm ${meta.textClass}`}>
                <span className="hidden md:inline">{meta.label}</span>
                <span className="md:hidden">{meta.mobileLabel}</span>
            </span>
        </span>
    );
}
