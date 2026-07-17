import { isSessionActiveInWeek } from '../../features/visual-schedule/services/holiday-logic';
import type { Holiday, ScheduleSession, WeeklySchedule } from '../../features/visual-schedule/types';
import type { DashboardCalendarSource } from './dashboard-layout';

export interface DashboardCalendarEvent {
  id: string;
  source: DashboardCalendarSource;
  title: string;
  subtitle: string;
  date: Date;
  startTime: string;
  endTime?: string;
  room: string;
}

export type DashboardSchedule = WeeklySchedule & {
  systemHolidays?: Holiday[];
  overrides?: { holidays?: Holiday[] };
};

const DAY_MS = 24 * 60 * 60 * 1000;

export function startOfDay(value: Date): Date {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
}

function addDays(value: Date, amount: number): Date {
  const date = startOfDay(value);
  date.setDate(date.getDate() + amount);
  return date;
}

function toDateKey(value: Date): string {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function parsePortalDate(value: unknown): Date | null {
  const raw = String(value || '').trim();
  if (!raw) return null;

  const slashMatch = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (slashMatch) {
    const date = new Date(Number(slashMatch[3]), Number(slashMatch[2]) - 1, Number(slashMatch[1]));
    return Number.isNaN(date.getTime()) ? null : startOfDay(date);
  }

  const isoMatch = raw.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (isoMatch) {
    const date = new Date(Number(isoMatch[1]), Number(isoMatch[2]) - 1, Number(isoMatch[3]));
    return Number.isNaN(date.getTime()) ? null : startOfDay(date);
  }

  return null;
}

function getPortalDay(date: Date): ScheduleSession['dayOfWeek'] {
  const day = date.getDay();
  return (day === 0 ? 8 : day + 1) as ScheduleSession['dayOfWeek'];
}

function isDateInsideSession(date: Date, session: ScheduleSession): boolean {
  const target = startOfDay(date).getTime();
  const start = session.startDateParsed ? startOfDay(session.startDateParsed).getTime() : Number.MIN_SAFE_INTEGER;
  const end = session.endDateParsed ? startOfDay(session.endDateParsed).getTime() : Number.MAX_SAFE_INTEGER;
  return target >= start && target <= end;
}

function getClassEvents(
  schedule: DashboardSchedule,
  rangeStart: Date,
  rangeEnd: Date,
): DashboardCalendarEvent[] {
  const events: DashboardCalendarEvent[] = [];
  const semesterStart = schedule.semesterStartDate ? startOfDay(schedule.semesterStartDate) : undefined;
  const holidays = [...(schedule.systemHolidays || []), ...(schedule.overrides?.holidays || [])];

  for (let date = startOfDay(rangeStart); date <= rangeEnd; date = addDays(date, 1)) {
    const portalDay = getPortalDay(date);
    const week = semesterStart
      ? Math.floor((date.getTime() - semesterStart.getTime()) / (7 * DAY_MS)) + 1
      : 1;

    schedule.sessions
      .filter((session) => session.dayOfWeek === portalDay)
      .filter((session) => isDateInsideSession(date, session))
      .filter((session) => !semesterStart || (week >= 1 && isSessionActiveInWeek(session, week, semesterStart, holidays)))
      .forEach((session) => {
        events.push({
          id: `class-${session.id}-${toDateKey(date)}`,
          source: 'classes',
          title: session.courseName || session.courseCode,
          subtitle: [session.courseCode, session.type].filter(Boolean).join(' · '),
          date: new Date(date),
          startTime: session.startTime,
          endTime: session.endTime,
          room: session.room,
        });
      });
  }

  return events;
}

function getExamEvents(exams: unknown, rangeStart: Date, rangeEnd: Date): DashboardCalendarEvent[] {
  if (!exams || typeof exams !== 'object') return [];

  const events: DashboardCalendarEvent[] = [];
  const append = (items: unknown, type: string, groupKey: string) => {
    if (!Array.isArray(items)) return;

    items.forEach((item: any, index) => {
      const date = parsePortalDate(item?.date);
      if (!date || date < rangeStart || date > rangeEnd) return;

      const rawTime = String(item?.time || '').trim();
      const [startTime = '', endTime = ''] = rawTime.split(/\s*-\s*/);
      const courseCode = String(item?.id || item?.courseCode || '').trim();
      events.push({
        id: `exam-${groupKey}-${type}-${courseCode || index}-${toDateKey(date)}`,
        source: 'exams',
        title: String(item?.name || item?.courseName || courseCode || 'Lịch thi').trim(),
        subtitle: [courseCode, type].filter(Boolean).join(' · '),
        date,
        startTime,
        endTime,
        room: String(item?.room || '').trim(),
      });
    });
  };

  const examRecord = exams as Record<string, any>;
  append(examRecord.midterm, 'Giữa kỳ', 'root');
  append(examRecord.final, 'Cuối kỳ', 'root');

  Object.entries(examRecord).forEach(([semesterKey, semesterExams]) => {
    if (semesterKey === 'midterm' || semesterKey === 'final' || !semesterExams || typeof semesterExams !== 'object') return;
    append(semesterExams.midterm, 'Giữa kỳ', semesterKey);
    append(semesterExams.final, 'Cuối kỳ', semesterKey);
  });

  return events;
}

function getTimeValue(value: string): number {
  const match = value.match(/(\d{1,2}):(\d{2})/);
  return match ? Number(match[1]) * 60 + Number(match[2]) : Number.MAX_SAFE_INTEGER;
}

function sortEvents(events: DashboardCalendarEvent[]): DashboardCalendarEvent[] {
  return events.sort((first, second) => {
    const dateDiff = first.date.getTime() - second.date.getTime();
    return dateDiff || getTimeValue(first.startTime) - getTimeValue(second.startTime);
  });
}

export function getCalendarEventStart(event: DashboardCalendarEvent): Date | null {
  const match = event.startTime.match(/(\d{1,2}):(\d{2})/);
  if (!match) return null;
  const result = new Date(event.date);
  result.setHours(Number(match[1]), Number(match[2]), 0, 0);
  return Number.isNaN(result.getTime()) ? null : result;
}

export function buildDashboardCalendarEvents(
  schedule: DashboardSchedule,
  exams: unknown,
  sources: DashboardCalendarSource[],
  days: number,
  now = new Date(),
): DashboardCalendarEvent[] {
  const rangeStart = startOfDay(now);
  const rangeEnd = addDays(rangeStart, Math.max(1, Math.min(30, days)) - 1);
  const events: DashboardCalendarEvent[] = [];

  if (sources.includes('classes')) events.push(...getClassEvents(schedule, rangeStart, rangeEnd));
  if (sources.includes('exams')) events.push(...getExamEvents(exams, rangeStart, rangeEnd));

  return sortEvents(events);
}
