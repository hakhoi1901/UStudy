import { ScheduleLogic } from './schedule-logic';
import { getScheduleCalendarWeekCount, isSessionActiveInWeek } from './holiday-logic';
import type { ScheduleSession, WeeklySchedule } from '../types';

function getExportWeekCount(schedule: WeeklySchedule): number {
    const holidays = [...(schedule.systemHolidays || []), ...(schedule.overrides?.holidays || [])];
    return getScheduleCalendarWeekCount(schedule.sessions, schedule.semesterStartDate, holidays);
}

function getSessionForWeek(schedule: WeeklySchedule, session: ScheduleSession, calendarWeek: number): ScheduleSession | null {
    const semesterStart = schedule.semesterStartDate;
    if (!semesterStart) return null;

    const holidays = [...(schedule.systemHolidays || []), ...(schedule.overrides?.holidays || [])];
    if (!isSessionActiveInWeek(session, calendarWeek, semesterStart, holidays)) return null;

    const sessionOverride = schedule.overrides?.sessionOverrides[session.id];
    if (sessionOverride) {
        if (sessionOverride.startWeek !== undefined && calendarWeek < sessionOverride.startWeek) return null;
        if (sessionOverride.endWeek !== undefined && calendarWeek > sessionOverride.endWeek) return null;
        if (sessionOverride.hiddenWeeks?.includes(calendarWeek)) return null;
    }

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
