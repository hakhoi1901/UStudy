// scheduleExport.ts
import { type WeeklySchedule } from '../types';

export function exportCalendar(schedule: WeeklySchedule) {
    const pad = (n: number) => String(n).padStart(2, '0');
    const toIcsDateTime = (d: Date) =>
        `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
    const esc = (t: string) =>
        t.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');

    const semesterStart = schedule.semesterStartDate
        ? new Date(schedule.semesterStartDate) : null;
    const nowStamp = toIcsDateTime(new Date());

    const lines: string[] = [
        'BEGIN:VCALENDAR', 'VERSION:2.0',
        'PRODID:-//HCMUS Portal Tool//Visual Schedule//VI',
        'CALSCALE:GREGORIAN', 'METHOD:PUBLISH',
        `X-WR-CALNAME:${esc(`Thoi khoa bieu - ${schedule.semesterName}`)}`,
        'X-WR-TIMEZONE:Asia/Ho_Chi_Minh',
    ];

    schedule.sessions.forEach((session, idx) => {
        const [sh, sm] = session.startTime.split(':').map(Number);
        const [eh, em] = session.endTime.split(':').map(Number);
        let eventDate: Date | null = null;

        if (semesterStart) {
            const offset = session.dayOfWeek - 2;
            eventDate = new Date(
                semesterStart.getFullYear(),
                semesterStart.getMonth(),
                semesterStart.getDate() + offset
            );
        } else if (session.startDateParsed) {
            eventDate = new Date(session.startDateParsed);
        }

        if (!eventDate || isNaN(sh) || isNaN(sm) || isNaN(eh) || isNaN(em)) return;

        const dtStart = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate(), sh, sm, 0);
        const dtEnd = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate(), eh, em, 0);
        const weeks = Math.max(1, session.totalWeeks || 1);
        const typeLabel = session.type === 'LT' ? 'Ly thuyet' : session.type === 'TH' ? 'Thuc hanh' : 'Bai tap';
        const description = [
            `Mon: ${session.courseName} (${session.courseCode})`,
            `Lop: ${session.classCode}`, `Loai: ${typeLabel}`,
            `Giang vien: ${session.instructor || 'Dang cap nhat'}`,
            `Tin chi: ${session.credits}`,
            `Bat dau: ${session.startTime} - Tuan 1`,
            `Ket thuc du kien: +${weeks} tuan`,
        ].join('\\n');

        lines.push(
            'BEGIN:VEVENT',
            `UID:${session.id}-${schedule.weekNumber}-${idx}@hcmus-portal-tool`,
            `DTSTAMP:${nowStamp}`,
            `DTSTART;TZID=Asia/Ho_Chi_Minh:${toIcsDateTime(dtStart)}`,
            `DTEND;TZID=Asia/Ho_Chi_Minh:${toIcsDateTime(dtEnd)}`,
            `RRULE:FREQ=WEEKLY;COUNT=${weeks}`,
            `SUMMARY:${esc(`${session.courseCode} - ${session.courseName}`)}`,
            `LOCATION:${esc(session.room || 'Chua co phong')}`,
            `DESCRIPTION:${esc(description)}`,
            'STATUS:CONFIRMED', 'TRANSP:OPAQUE', 'END:VEVENT'
        );
    });

    lines.push('END:VCALENDAR');
    const blob = new Blob([lines.join('\r\n') + '\r\n'], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TKB_${schedule.semester.replace(/\//g, '-')}_FullSemester.ics`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}