import type { Ref } from 'react';
import type { AcademicCalendar, AcademicCalendarCohortPlan, AcademicCalendarWeek } from '../../../assets/data/academic-calendar';
import { formatCalendarDate, getCohortPlan } from '../academic-calendar-utils';

interface AcademicCalendarTableProps {
    calendar: AcademicCalendar;
    weeks: AcademicCalendarWeek[];
    currentCohortId: string | null;
    currentWeekIndex?: number;
    currentWeekRef?: Ref<HTMLTableRowElement>;
}

function CohortCell({ plan, isCurrentCohort }: { plan: AcademicCalendarCohortPlan | null; isCurrentCohort: boolean }) {
    if (!plan) return <span className="text-gray-300">-</span>;

    return (
        <div className={`text-center ${isCurrentCohort ? 'font-medium text-gray-900' : 'text-gray-700'}`}>
            {plan.activities.length > 0 ? (
                <div className="space-y-1.5">
                    {plan.activities.map((activity, index) => (
                        <p key={`${activity.label}-${index}`} className={index === 0 ? 'font-semibold' : ''}>
                            {activity.label}
                        </p>
                    ))}
                </div>
            ) : plan.teachingWeek !== undefined ? (
                <span className="font-semibold tabular-nums">{plan.teachingWeek}</span>
            ) : (
                <span className="text-gray-300">-</span>
            )}
        </div>
    );
}

export function AcademicCalendarTable({
    calendar,
    weeks,
    currentCohortId,
    currentWeekIndex,
    currentWeekRef,
}: AcademicCalendarTableProps) {
    return (
        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white scrollbar-hide ustudy-card">
            <table className="min-w-[1200px] w-full table-fixed border-collapse text-left text-sm ">
                <colgroup>
                    <col className="w-16" />
                    <col className="w-28" />
                    <col className="w-28" />
                    {calendar.cohorts.map((cohort) => <col key={cohort.id} className="w-56" />)}
                    <col className="w-60" />
                </colgroup>
                <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-600">
                    <tr className="border-b border-gray-200">
                        <th rowSpan={2} className="w-16 border-r border-gray-200 px-3 py-3 text-center text-center">Tuần</th>
                        <th rowSpan={2} className="w-28 border-r border-gray-200 px-3 py-3 text-center">Từ ngày</th>
                        <th rowSpan={2} className="w-28 border-r border-gray-200 px-3 py-3 text-center">Đến ngày</th>
                        <th colSpan={calendar.cohorts.length} className="border-r border-gray-200 px-3 py-3 text-center">Chương trình đại trà, tài năng</th>
                        <th rowSpan={2} className="w-60 px-4 py-3 text-center">Bảo vệ KL, Xét TN, Thông tin khác</th>
                    </tr>
                    <tr className="border-b border-gray-200">
                        {calendar.cohorts.map((cohort) => (
                            <th
                                key={cohort.id}
                                className={`min-w-48 border-r border-gray-200 px-3 py-2.5 text-center ${cohort.id === currentCohortId ? 'bg-blue-50 text-[#004A98]' : ''}`}
                            >
                                {cohort.label}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {weeks.map((week) => {
                        const isCurrentWeek = week.index === currentWeekIndex;

                        return (
                            <tr
                                key={week.index}
                                ref={isCurrentWeek ? currentWeekRef : undefined}
                                className={isCurrentWeek ? 'bg-blue-50/50' : 'bg-white'}
                            >
                                <td className={`border-r border-gray-200 px-3 py-4 text-center font-semibold tabular-nums ${isCurrentWeek ? 'text-[#004A98]' : 'text-gray-800'}`}>
                                    {week.index}
                                </td>
                                <td className="border-r border-gray-200 px-3 py-4 text-xs font-medium text-gray-600">{formatCalendarDate(week.startDate)}</td>
                                <td className="border-r border-gray-200 px-3 py-4 text-xs font-medium text-gray-600">{formatCalendarDate(week.endDate)}</td>
                                {calendar.cohorts.map((cohort) => (
                                    <td
                                        key={cohort.id}
                                        className={`border-r border-gray-200 px-3 py-4 text-center align-middle text-sm leading-5 ${cohort.id === currentCohortId ? (isCurrentWeek ? 'bg-blue-100' : 'bg-blue-50/30') : ''} `}
                                    >
                                        <CohortCell plan={getCohortPlan(week, cohort.id)} isCurrentCohort={cohort.id === currentCohortId} />
                                    </td>
                                ))}
                                <td className="px-4 py-4 align-top text-sm leading-5 text-gray-600">
                                    {week.institutionEvents.length > 0 ? (
                                        <div className="space-y-1.5">
                                            {week.institutionEvents.map((event, index) => <p key={`${event.label}-${index}`}>{event.label}</p>)}
                                        </div>
                                    ) : <span className="text-gray-300">-</span>}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
