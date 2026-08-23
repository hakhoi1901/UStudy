import type {
    AcademicCalendar,
    AcademicCalendarCohortPlan,
    AcademicCalendarWeek,
    AcademicTerm,
} from '../../assets/data/academic-calendar';

export type AcademicCalendarTermFilter = 'all' | AcademicTerm;

export const ACADEMIC_TERM_OPTIONS: Array<{ id: AcademicCalendarTermFilter; name: string }> = [
    { id: 'all', name: 'Cả năm' },
    { id: 'semester-1', name: 'Học kỳ 1' },
    { id: 'semester-2', name: 'Học kỳ 2' },
    { id: 'summer', name: 'Học kỳ hè' },
];

export const ACADEMIC_TERM_LABELS: Record<AcademicTerm, string> = {
    'semester-1': 'Học kỳ 1',
    'semester-2': 'Học kỳ 2',
    summer: 'Học kỳ hè',
};

export function parseCalendarDate(value: string) {
    const [year, month, day] = value.split('-').map(Number);
    return new Date(year, month - 1, day);
}

export function getCalendarCohort(calendar: AcademicCalendar, appCohortId: string) {
    return calendar.cohorts.find((cohort) => cohort.appCohortIds.includes(appCohortId)) ?? null;
}

export function getCohortPlan(week: AcademicCalendarWeek, cohortId: string | null): AcademicCalendarCohortPlan | null {
    return cohortId ? week.cohorts[cohortId] ?? null : null;
}

export function getVisibleWeeks(
    calendar: AcademicCalendar,
    term: AcademicCalendarTermFilter,
) {
    if (term === 'all') return calendar.weeks;

    return calendar.weeks.filter((week) => calendar.cohorts.some((cohort) => (
        getCohortPlan(week, cohort.id)?.terms.includes(term)
    )));
}

export function getCalendarPosition(calendar: AcademicCalendar, date = new Date()) {
    const today = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
    const firstWeek = calendar.weeks[0];
    const lastWeek = calendar.weeks.at(-1);

    const currentWeek = calendar.weeks.find((week) => {
        const start = parseCalendarDate(week.startDate).getTime();
        const end = parseCalendarDate(week.endDate).getTime();
        return start <= today && today <= end;
    }) ?? null;

    if (currentWeek) return { state: 'current' as const, currentWeek };
    if (firstWeek && today < parseCalendarDate(firstWeek.startDate).getTime()) return { state: 'upcoming' as const, currentWeek: null };
    if (lastWeek && today > parseCalendarDate(lastWeek.endDate).getTime()) return { state: 'finished' as const, currentWeek: null };
    return { state: 'unknown' as const, currentWeek: null };
}

export function formatWeekRange(startDate: string, endDate: string) {
    const formatter = new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: 'short' });
    return `${formatter.format(parseCalendarDate(startDate))} - ${formatter.format(parseCalendarDate(endDate))}`;
}

export function formatCalendarDate(date: string) {
    return new Intl.DateTimeFormat('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    }).format(parseCalendarDate(date));
}
