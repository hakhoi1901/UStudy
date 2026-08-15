import type { Holiday, ScheduleSession } from '../types';

const DAY_MS = 24 * 60 * 60 * 1000;

function atStartOfDay(date: Date): Date {
    const result = new Date(date);
    result.setHours(0, 0, 0, 0);
    return result;
}

function addDays(date: Date, days: number): Date {
    const result = atStartOfDay(date);
    result.setDate(result.getDate() + days);
    return result;
}

function parseLocalDate(value?: string): Date | null {
    if (!value) return null;
    const isoMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (isoMatch) {
        const date = new Date(Number(isoMatch[1]), Number(isoMatch[2]) - 1, Number(isoMatch[3]));
        return Number.isNaN(date.getTime()) ? null : date;
    }

    const dmyMatch = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (!dmyMatch) return null;
    const date = new Date(Number(dmyMatch[3]), Number(dmyMatch[2]) - 1, Number(dmyMatch[1]));
    return Number.isNaN(date.getTime()) ? null : date;
}

function getTargetJsDay(dayOfWeek: ScheduleSession['dayOfWeek']): number {
    return dayOfWeek === 8 ? 0 : dayOfWeek - 1;
}

function alignToSessionDay(date: Date, dayOfWeek: ScheduleSession['dayOfWeek']): Date {
    const result = atStartOfDay(date);
    const offset = (getTargetJsDay(dayOfWeek) - result.getDay() + 7) % 7;
    result.setDate(result.getDate() + offset);
    return result;
}

export interface HolidayDateRange {
    start: Date;
    end: Date;
}

export function toDateInputValue(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

export function getHolidayDateRange(holiday: Holiday, semesterStartDate?: Date): HolidayDateRange | null {
    const explicitStart = parseLocalDate(holiday.startDate);
    if (explicitStart) {
        const explicitEnd = parseLocalDate(holiday.endDate) || explicitStart;
        return {
            start: atStartOfDay(explicitStart),
            end: atStartOfDay(explicitEnd < explicitStart ? explicitStart : explicitEnd),
        };
    }

    if (!semesterStartDate || !holiday.startWeek || holiday.startWeek < 1) return null;
    const start = addDays(semesterStartDate, (holiday.startWeek - 1) * 7);
    const duration = Math.max(1, holiday.duration || 1);
    return { start, end: addDays(start, duration * 7 - 1) };
}

export function getSessionDateForWeek(
    semesterStartDate: Date,
    week: number,
    dayOfWeek: ScheduleSession['dayOfWeek'],
): Date {
    return addDays(semesterStartDate, (Math.max(1, week) - 1) * 7 + dayOfWeek - 2);
}

export function holidayAffectsSessionOnDate(
    holiday: Holiday,
    session: ScheduleSession,
    date: Date,
    semesterStartDate?: Date,
): boolean {
    const affectsCourse = holiday.affectedCourseCodes === 'all'
        || holiday.affectedCourseCodes.includes(session.courseCode);
    if (!affectsCourse) return false;

    const range = getHolidayDateRange(holiday, semesterStartDate);
    if (!range) return false;
    const target = atStartOfDay(date).getTime();
    return target >= range.start.getTime() && target <= range.end.getTime();
}

function getFirstSessionOccurrence(session: ScheduleSession, semesterStartDate: Date): Date {
    return alignToSessionDay(session.startDateParsed || semesterStartDate, session.dayOfWeek);
}

function getPlannedOccurrenceCount(session: ScheduleSession, firstOccurrence: Date): number {
    if (session.totalWeeks > 0) return session.totalWeeks;
    if (!session.endDateParsed) return 25;
    const weeks = Math.floor((atStartOfDay(session.endDateParsed).getTime() - firstOccurrence.getTime()) / (7 * DAY_MS));
    return Math.max(1, weeks + 1);
}

/**
 * Xét một buổi lặp theo tuần. Mỗi lịch lặp được đếm riêng nên môn có nhiều
 * buổi/tuần chỉ nghỉ đúng buổi rơi vào khoảng ngày nghỉ.
 */
export function isSessionActiveInWeek(
    session: ScheduleSession,
    week: number,
    semesterStartDate: Date | undefined,
    holidays: Holiday[],
): boolean {
    if (!semesterStartDate) return true;

    const occurrenceDate = getSessionDateForWeek(semesterStartDate, week, session.dayOfWeek);
    const firstOccurrence = getFirstSessionOccurrence(session, semesterStartDate);
    if (occurrenceDate < firstOccurrence) return false;

    const holidaysOnCurrentDate = holidays.filter((holiday) => (
        holidayAffectsSessionOnDate(holiday, session, occurrenceDate, semesterStartDate)
    ));
    if (holidaysOnCurrentDate.length > 0) return false;

    const plannedOccurrences = getPlannedOccurrenceCount(session, firstOccurrence);
    let consumedOccurrences = 0;

    for (let date = new Date(firstOccurrence); date < occurrenceDate; date = addDays(date, 7)) {
        const matchingHolidays = holidays.filter((holiday) => (
            holidayAffectsSessionOnDate(holiday, session, date, semesterStartDate)
        ));
        const requiresMakeUp = matchingHolidays.some((holiday) => holiday.makeUp !== false);
        if (!requiresMakeUp) consumedOccurrences += 1;
    }

    return consumedOccurrences < plannedOccurrences;
}

export function getScheduleCalendarWeekCount(
    sessions: ScheduleSession[],
    semesterStartDate: Date | undefined,
    holidays: Holiday[],
): number {
    const baseWeeks = Math.max(1, ...sessions.map((session) => session.totalWeeks || 0));
    if (!semesterStartDate) return baseWeeks;

    const datedWeeks = Math.max(0, ...sessions.map((session) => {
        if (!session.endDateParsed) return 0;
        return Math.floor((atStartOfDay(session.endDateParsed).getTime() - atStartOfDay(semesterStartDate).getTime()) / (7 * DAY_MS)) + 1;
    }));

    const lastActiveWeek = sessions.reduce((latestWeek, session) => {
        const firstOccurrence = getFirstSessionOccurrence(session, semesterStartDate);
        const firstWeek = Math.max(1, Math.floor((firstOccurrence.getTime() - atStartOfDay(semesterStartDate).getTime()) / (7 * DAY_MS)) + 1);
        const plannedOccurrences = getPlannedOccurrenceCount(session, firstOccurrence);
        let consumedOccurrences = 0;
        let calendarWeek = firstWeek;
        let lastActive = 0;

        // A bounded guard also protects old or malformed imported holiday ranges.
        const maximumWeek = firstWeek + plannedOccurrences + 104;
        while (consumedOccurrences < plannedOccurrences && calendarWeek <= maximumWeek) {
            const occurrenceDate = getSessionDateForWeek(semesterStartDate, calendarWeek, session.dayOfWeek);
            const matchingHolidays = holidays.filter((holiday) => (
                holidayAffectsSessionOnDate(holiday, session, occurrenceDate, semesterStartDate)
            ));
            const requiresMakeUp = matchingHolidays.some((holiday) => holiday.makeUp !== false);

            if (matchingHolidays.length === 0) {
                consumedOccurrences += 1;
                lastActive = calendarWeek;
            } else if (!requiresMakeUp) {
                consumedOccurrences += 1;
            }
            calendarWeek += 1;
        }

        return Math.max(latestWeek, lastActive);
    }, 0);

    return Math.max(baseWeeks, datedWeeks, lastActiveWeek);
}

export function sortHolidays(holidays: Holiday[], semesterStartDate?: Date): Holiday[] {
    return [...holidays].sort((first, second) => {
        const firstRange = getHolidayDateRange(first, semesterStartDate);
        const secondRange = getHolidayDateRange(second, semesterStartDate);
        return (firstRange?.start.getTime() ?? Number.MAX_SAFE_INTEGER)
            - (secondRange?.start.getTime() ?? Number.MAX_SAFE_INTEGER);
    });
}
