import { describe, expect, it } from 'vitest';

import { buildCalendarIcs } from '../../../src/features/visual-schedule/services/schedule-export';
import type { ScheduleSession, WeeklySchedule } from '../../../src/features/visual-schedule/types';

const semesterStart = new Date(2026, 0, 5);

const session: ScheduleSession = {
  id: 'CSC10009|24CTT1|LT|1',
  courseCode: 'CSC10009',
  courseName: 'Co so du lieu',
  classCode: '24CTT1',
  credits: 4,
  type: 'LT',
  instructor: 'Giang vien',
  room: 'F101',
  dayOfWeek: 2,
  startPeriod: 1,
  endPeriod: 3,
  startTime: '07:30',
  endTime: '10:00',
  color: 'blue',
  session: 'morning',
  duration: 3,
  totalWeeks: 3,
  startDate: '05/01/2026',
  endDate: '19/01/2026',
  startDateParsed: semesterStart,
  endDateParsed: new Date(2026, 0, 19),
};

function createSchedule(overrides: WeeklySchedule['overrides'] = {
  sessionOverrides: {},
  weekOverrides: {},
  holidays: [],
}): WeeklySchedule {
  return {
    semester: '25-26/3',
    semesterName: 'Hoc ky 3',
    weekNumber: 1,
    weekRange: '',
    totalCourses: 1,
    totalCredits: 4,
    totalPeriodsPerWeek: 3,
    totalHoursPerWeek: 3,
    sessions: [session],
    semesterStartDate: semesterStart,
    systemHolidays: [],
    overrides,
  };
}

describe('schedule calendar export', () => {
  it('exports one weekly recurring event instead of one event per week', () => {
    const ics = buildCalendarIcs(createSchedule(), new Date(2026, 0, 1));

    expect(ics).toContain('RRULE:FREQ=WEEKLY;COUNT=3');
    expect(ics?.match(/BEGIN:VEVENT/g)).toHaveLength(1);
    expect(ics).toContain('DTSTART;TZID=Asia/Ho_Chi_Minh:20260105T073000');
  });

  it('keeps skipped weeks as recurrence exceptions', () => {
    const ics = buildCalendarIcs(createSchedule({
      sessionOverrides: {
        [session.id]: { hiddenWeeks: [2] },
      },
      weekOverrides: {},
      holidays: [],
    }), new Date(2026, 0, 1));

    expect(ics).toContain('RRULE:FREQ=WEEKLY;COUNT=3');
    expect(ics).toContain('EXDATE;TZID=Asia/Ho_Chi_Minh:20260112T073000');
    expect(ics?.match(/BEGIN:VEVENT/g)).toHaveLength(1);
  });

  it('keeps a one-week room change as one recurrence exception', () => {
    const ics = buildCalendarIcs(createSchedule({
      sessionOverrides: {},
      weekOverrides: {
        [`2_${session.id}`]: { room: 'F202' },
      },
      holidays: [],
    }), new Date(2026, 0, 1));

    expect(ics?.match(/BEGIN:VEVENT/g)).toHaveLength(2);
    expect(ics).toContain('RECURRENCE-ID;TZID=Asia/Ho_Chi_Minh:20260112T073000');
    expect(ics).toContain('LOCATION:F202');
  });
});
