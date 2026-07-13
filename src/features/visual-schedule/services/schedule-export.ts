import { ScheduleLogic } from './schedule-logic';
import type { ScheduleSession, WeeklySchedule } from '../types';

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

function getExportWeekCount(schedule: WeeklySchedule): number {
    const { semesterStartDate } = schedule;
    const datedWeeks = semesterStartDate
        ? Math.max(0, ...schedule.sessions.map((session) => {
            if (!session.endDateParsed) return 0;
            return Math.floor((session.endDateParsed.getTime() - semesterStartDate.getTime()) / WEEK_MS) + 1;
        }))
        : 0;
    const plannedWeeks = Math.max(0, ...schedule.sessions.map((session) => session.totalWeeks || 0));
    const baseWeeks = Math.max(datedWeeks, plannedWeeks, 1);
    const holidayWeeks = [...(schedule.systemHolidays || []), ...(schedule.overrides?.holidays || [])]
        .filter((holiday) => holiday.startWeek <= baseWeeks)
        .reduce((sum, holiday) => sum + holiday.duration, 0);

    return baseWeeks + holidayWeeks;
}

function getSessionForWeek(schedule: WeeklySchedule, session: ScheduleSession, calendarWeek: number): ScheduleSession | null {
    const semesterStart = schedule.semesterStartDate;
    if (!semesterStart) return null;

    const holidays = [...(schedule.systemHolidays || []), ...(schedule.overrides?.holidays || [])]
        .filter((holiday) => holiday.affectedCourseCodes === 'all' || holiday.affectedCourseCodes.includes(session.courseCode));
    const actualWeek = ScheduleLogic.getActualWeekForCourse(calendarWeek, session.courseCode, holidays);
    if (actualWeek === null) return null;

    const sessionOverride = schedule.overrides?.sessionOverrides[session.id];
    if (sessionOverride) {
        if (sessionOverride.startWeek !== undefined && actualWeek < sessionOverride.startWeek) return null;
        if (sessionOverride.endWeek !== undefined && actualWeek > sessionOverride.endWeek) return null;
        if (sessionOverride.hiddenWeeks?.includes(calendarWeek)) return null;
    }

    const contentWeekStart = new Date(semesterStart);
    contentWeekStart.setDate(contentWeekStart.getDate() + (actualWeek - 1) * 7);
    const contentWeekEnd = new Date(contentWeekStart);
    contentWeekEnd.setDate(contentWeekEnd.getDate() + 6);
    contentWeekEnd.setHours(23, 59, 59, 999);
    if (session.startDateParsed && contentWeekEnd < session.startDateParsed) return null;
    if (session.endDateParsed && contentWeekStart > session.endDateParsed) return null;

    const weekOverride = schedule.overrides?.weekOverrides[`${calendarWeek}_${session.id}`];
    if (!weekOverride) return session;

    const startPeriod = weekOverride.startPeriod ?? session.startPeriod;
    const endPeriod = weekOverride.endPeriod ?? session.endPeriod;
    const adjusted = ScheduleLogic.adjustPeriodsForPractical(session.type, startPeriod, endPeriod);

    return {
        ...session,
        ...weekOverride,
        startPeriod: adjusted.startPeriod,
        endPeriod: adjusted.endPeriod,
        startTime: ScheduleLogic.periodToTimeString(adjusted.startPeriod, true),
        endTime: ScheduleLogic.periodToTimeString(adjusted.endPeriod, false),
        duration: adjusted.duration,
    };
}

export function exportCalendar(schedule: WeeklySchedule) {
    const pad = (value: number) => String(value).padStart(2, '0');
    const toIcsDateTime = (date: Date) =>
        `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}T${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`;
    const escapeIcs = (text: string) =>
        text.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');

    const semesterStart = schedule.semesterStartDate ? new Date(schedule.semesterStartDate) : null;
    if (!semesterStart) return;

    const nowStamp = toIcsDateTime(new Date());
    const lines: string[] = [
        'BEGIN:VCALENDAR', 'VERSION:2.0',
        'PRODID:-//HCMUS Portal Tool//Visual Schedule//VI',
        'CALSCALE:GREGORIAN', 'METHOD:PUBLISH',
        `X-WR-CALNAME:${escapeIcs(`Thoi khoa bieu - ${schedule.semesterName}`)}`,
        'X-WR-TIMEZONE:Asia/Ho_Chi_Minh',
    ];

    const totalWeeks = getExportWeekCount(schedule);
    for (let calendarWeek = 1; calendarWeek <= totalWeeks; calendarWeek += 1) {
        for (const rawSession of schedule.sessions) {
            const session = getSessionForWeek(schedule, rawSession, calendarWeek);
            if (!session) continue;

            const [startHour, startMinute] = session.startTime.split(':').map(Number);
            const [endHour, endMinute] = session.endTime.split(':').map(Number);
            if ([startHour, startMinute, endHour, endMinute].some(Number.isNaN)) continue;

            const eventDate = new Date(semesterStart);
            eventDate.setDate(eventDate.getDate() + (calendarWeek - 1) * 7 + session.dayOfWeek - 2);
            const dtStart = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate(), startHour, startMinute, 0);
            const dtEnd = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate(), endHour, endMinute, 0);
            const typeLabel = session.type === 'LT' ? 'Ly thuyet' : session.type === 'TH' ? 'Thuc hanh' : 'Bai tap';
            const description = [
                `Mon: ${session.courseName} (${session.courseCode})`,
                `Lop: ${session.classCode}`,
                `Loai: ${typeLabel}`,
                `Giang vien: ${session.instructor || 'Dang cap nhat'}`,
                `Tin chi: ${session.credits}`,
                `Tuan: ${calendarWeek}`,
            ].join('\n');

            lines.push(
                'BEGIN:VEVENT',
                `UID:${escapeIcs(`${session.id}-${calendarWeek}@hcmus-portal-tool`)}`,
                `DTSTAMP:${nowStamp}`,
                `DTSTART;TZID=Asia/Ho_Chi_Minh:${toIcsDateTime(dtStart)}`,
                `DTEND;TZID=Asia/Ho_Chi_Minh:${toIcsDateTime(dtEnd)}`,
                `SUMMARY:${escapeIcs(`${session.courseCode} - ${session.courseName}`)}`,
                `LOCATION:${escapeIcs(session.room || 'Chua co phong')}`,
                `DESCRIPTION:${escapeIcs(description)}`,
                'STATUS:CONFIRMED', 'TRANSP:OPAQUE', 'END:VEVENT'
            );
        }
    }

    lines.push('END:VCALENDAR');
    const blob = new Blob([lines.join('\r\n') + '\r\n'], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `TKB_${schedule.semester.replace(/\//g, '-')}_FullSemester.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}
