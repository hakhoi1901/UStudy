import { CourseCard } from './EditSessionDialog';
import { type WeeklySchedule, type ScheduleOverrides, DAYS } from '../types';
import {
    getSessionsForCell,
    hasOverlappingSession,
    getAllSessionsForCell,
    calculateRowSpan,
    shouldRenderCell,
} from '../services/schedule-helpers';


// Helper to render period row with today highlighting
export function PeriodRow({
    period,
    time,
    schedule,
    isToday,
    currentPeriod,
    overrides,
    onSave
}: {
    period: number;
    time: string;
    schedule: WeeklySchedule;
    isToday: (day: number) => boolean;
    currentPeriod: number | null;
    overrides: ScheduleOverrides;
    onSave: (newOverrides: ScheduleOverrides) => void;
}) {
    return (
        <tr>
            <td className="sticky left-0 bg-gray-50 z-10 p-0.5 md:p-1.5 border border-gray-200 text-center" style={{ height: 'var(--schedule-row-height)' }}>
                <div className="text-[10px] md:text-[13px] font-semibold text-gray-700">{period}</div>
                <div className="text-[9px] md:text-[11px] text-gray-500">{time}</div>
            </td>
            {DAYS.map((day) => {
                const session = getSessionsForCell(day.value, period, schedule.sessions);
                const isTodayCell = isToday(day.value);
                const isCurrentPeriod = isTodayCell && currentPeriod === period;
                const hasOverlap = hasOverlappingSession(day.value, period, schedule.sessions);

                if (session && shouldRenderCell(session, period)) {
                    const sessionsToDisplay = hasOverlap
                        ? getAllSessionsForCell(day.value, period, schedule.sessions)
                        : session;

                    return (
                        <td key={day.value} rowSpan={calculateRowSpan(session)} className={`p-0.5 md:p-1 border border-gray-200 align-middle ${isTodayCell ? 'bg-green-50/50' : ''
                            } ${isCurrentPeriod ? 'ring-2 ring-green-500 ring-inset' : ''}`}>
                            <CourseCard
                                sessions={sessionsToDisplay}
                                hasConflict={hasOverlap}
                                weekNumber={schedule.weekNumber}
                                overrides={overrides}
                                onSave={onSave}
                            />
                        </td>
                    );
                } else if (!session) {
                    return <td key={day.value} className={`p-0.5 md:p-1 border border-gray-200 bg-white ${isTodayCell ? 'bg-green-50/30' : ''
                        }`} style={{ height: 'var(--schedule-row-height)' }} />;
                }
                return null;
            })}
        </tr>
    );
}