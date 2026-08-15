import { CalendarClock, CircleCheck, CircleDashed } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ACADEMIC_CALENDARS, getAcademicCalendar } from '../../assets/data/academic-calendar';
import { useDepartmentData } from '../../context/DepartmentContext';
import {
    type AcademicCalendarTermFilter,
    ACADEMIC_TERM_LABELS,
    getCalendarCohort,
    getCalendarPosition,
    getVisibleWeeks,
} from './academic-calendar-utils';
import { AcademicCalendarTable } from './components/AcademicCalendarTable';
import { AcademicCalendarToolbar } from './components/AcademicCalendarToolbar';

const academicYearOptions = ACADEMIC_CALENDARS.map((calendar) => ({
    id: calendar.academicYear,
    name: calendar.academicYear,
}));

export function AcademicCalendarFeature() {
    const { cohortId, currentCohort } = useDepartmentData();
    const [academicYear, setAcademicYear] = useState(ACADEMIC_CALENDARS[0]?.academicYear ?? '');
    const [term, setTerm] = useState<AcademicCalendarTermFilter>('all');
    const currentWeekRef = useRef<HTMLTableRowElement>(null);

    const calendar = getAcademicCalendar(academicYear);
    const calendarCohort = useMemo(
        () => calendar ? getCalendarCohort(calendar, cohortId) : null,
        [calendar, cohortId],
    );
    const visibleWeeks = useMemo(
        () => calendar ? getVisibleWeeks(calendar, term) : [],
        [calendar, term],
    );
    const position = useMemo(() => calendar ? getCalendarPosition(calendar) : null, [calendar]);

    useEffect(() => {
        if (!position?.currentWeek || !visibleWeeks.some((week) => week.index === position.currentWeek?.index)) return;
        const frame = window.requestAnimationFrame(() => currentWeekRef.current?.scrollIntoView({ block: 'center', behavior: 'smooth' }));
        return () => window.cancelAnimationFrame(frame);
    }, [academicYear, term, position?.currentWeek?.index, visibleWeeks]);

    if (!calendar) {
        return <div className="py-12 text-center text-sm text-gray-500">Chưa có dữ liệu kế hoạch cho năm học này.</div>;
    }

    const currentWeek = position?.currentWeek;
    const status = position?.state === 'current'
        ? { icon: CircleCheck, label: `Đang ở tuần ${currentWeek?.index}`, className: 'text-emerald-700 bg-emerald-50' }
        : position?.state === 'upcoming'
            ? { icon: CalendarClock, label: 'Kế hoạch sắp bắt đầu', className: 'text-[#004A98] bg-blue-50' }
            : position?.state === 'finished'
                ? { icon: CircleCheck, label: 'Năm học đã kết thúc', className: 'text-gray-600 bg-gray-100' }
                : { icon: CircleDashed, label: 'Không xác định tuần hiện tại', className: 'text-gray-600 bg-gray-100' };
    const StatusIcon = status.icon;

    return (
        <section className="mt-5 space-y-6">
            <AcademicCalendarToolbar
                academicYear={academicYear}
                academicYearOptions={academicYearOptions}
                onAcademicYearChange={setAcademicYear}
                term={term}
                onTermChange={setTerm}
                calendarCohort={calendarCohort}
                currentCohort={currentCohort}
            />

            {calendarCohort ? (
                <AcademicCalendarTable
                    calendar={calendar}
                    weeks={visibleWeeks}
                    currentCohortId={calendarCohort.id}
                    currentWeekIndex={currentWeek?.index}
                    currentWeekRef={currentWeekRef}
                />
            ) : (
                <div className="border-y border-gray-200 py-12 text-center">
                    <p className="text-sm font-medium text-gray-700">Kế hoạch này chưa có lộ trình riêng cho {currentCohort?.name ?? 'khóa đang chọn'}.</p>
                    <p className="mt-1 text-sm text-gray-500">Các mốc chung sẽ được bổ sung khi có kế hoạch phù hợp.</p>
                </div>
            )}

            {term !== 'all' && (
                <p className="text-xs text-gray-500">Đang xem {ACADEMIC_TERM_LABELS[term]} của năm học {calendar.academicYear}.</p>
            )}
        </section>
    );
}
