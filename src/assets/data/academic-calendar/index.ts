import { ACADEMIC_CALENDAR_2026_2027 } from './2026-2027';

export * from './types';
export { ACADEMIC_CALENDAR_2026_2027 } from './2026-2027';

export const ACADEMIC_CALENDARS = [ACADEMIC_CALENDAR_2026_2027];

export function getAcademicCalendar(academicYear: string) {
    return ACADEMIC_CALENDARS.find((calendar) => calendar.academicYear === academicYear) ?? null;
}
