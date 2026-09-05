import type { ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import type { ClassSection } from '../../types';
import { timePeriods } from '../../constants';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '../ui/overlays/hover-card';

interface ScheduleConflictHoverCardProps {
    section: ClassSection;
    conflictingSections: ClassSection[];
    children: ReactNode;
}

function getSectionTime(section: ClassSection): string {
    const start = timePeriods.find((period) => period.period === section.startPeriod)?.time.split(' - ')[0];
    const end = timePeriods.find((period) => period.period === section.endPeriod)?.time.split(' - ')[1];
    return start && end ? `${start} - ${end}` : `Tiết ${section.startPeriod} - ${section.endPeriod}`;
}

export function getScheduleConflictLabel(section: ClassSection, conflictingSections: ClassSection[]): string {
    const sessions = [section, ...conflictingSections];
    const courseCount = new Set(sessions.map((item) => item.courseCode)).size;
    return courseCount > 1 ? `Trùng ${courseCount} môn` : `Trùng ${sessions.length} lớp`;
}

export function ScheduleConflictHoverCard({
    section,
    conflictingSections,
    children,
}: ScheduleConflictHoverCardProps) {
    if (conflictingSections.length === 0) return <>{children}</>;

    const sessions = [section, ...conflictingSections];
    const conflictLabel = getScheduleConflictLabel(section, conflictingSections);

    return (
        <HoverCard openDelay={180} closeDelay={100}>
            <HoverCardTrigger asChild>{children}</HoverCardTrigger>
            <HoverCardContent
                side="top"
                align="start"
                sideOffset={8}
                className="z-[70] w-80 max-w-[calc(100vw-2rem)] rounded-lg border-red-200 bg-white p-0 text-gray-900 shadow-[0_14px_32px_rgba(127,29,29,0.16)]"
            >
                <div className="flex items-start gap-2 border-b border-red-100 bg-red-50 px-3 py-2.5">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
                    <div className="min-w-0">
                        <p className="text-sm font-semibold text-red-900">{conflictLabel}</p>
                        <p className="mt-0.5 text-xs text-red-700">Các lớp dưới đây cùng chiếm khung giờ này.</p>
                    </div>
                </div>
                <div className="divide-y divide-gray-100 px-3">
                    {sessions.map((item) => (
                        <div key={item.id} className="py-2.5">
                            <div className="flex items-center justify-between gap-3">
                                <span className="min-w-0 truncate font-mono text-xs font-bold text-[#004A98]">{item.courseCode}</span>
                                <span className="shrink-0 text-xs font-medium text-slate-500">Lớp {item.sectionNumber || item.selectedClassId || '-'}</span>
                            </div>
                            <p className="mt-0.5 truncate text-sm font-medium text-gray-900">{item.courseNameVi || item.courseName}</p>
                            <p className="mt-1 truncate text-xs text-slate-500">{getSectionTime(item)} · {item.room || 'Chưa có phòng'}</p>
                        </div>
                    ))}
                </div>
            </HoverCardContent>
        </HoverCard>
    );
}
