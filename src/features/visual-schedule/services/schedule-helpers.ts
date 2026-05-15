// scheduleHelpers.ts
import { type ScheduleSession } from '../types';

export function getDisplayEnd(session: ScheduleSession): number {
    return Number.isInteger(session.endPeriod) ? session.endPeriod + 1 : session.endPeriod;
}

export function calculateRowSpan(session: ScheduleSession): number {
    const displayEnd = getDisplayEnd(session);
    return Math.max(1, Math.ceil(displayEnd) - Math.floor(session.startPeriod));
}

export function getSessionsForCell(
    day: number, period: number, sessions: ScheduleSession[]
): ScheduleSession | null {
    return sessions.find(s => {
        if (s.dayOfWeek !== day) return false;
        const start = Math.floor(s.startPeriod);
        const end = Math.ceil(getDisplayEnd(s));
        return period >= start && period < end;
    }) || null;
}

export function getAllSessionsForCell(
    day: number, period: number, sessions: ScheduleSession[]
): ScheduleSession[] {
    return sessions.filter(s => {
        if (s.dayOfWeek !== day) return false;
        const start = Math.floor(s.startPeriod);
        const end = Math.ceil(getDisplayEnd(s));
        return period >= start && period < end;
    });
}

export function hasOverlappingSession(
    day: number, period: number, sessions: ScheduleSession[]
): boolean {
    return getAllSessionsForCell(day, period, sessions).length > 1;
}

export function shouldRenderCell(session: ScheduleSession, period: number): boolean {
    return Math.floor(session.startPeriod) === period;
}

export function getCurrentDayAndTime(): {
    dayOfWeek: number;
    currentPeriod: number | null;
    isToday: (day: number) => boolean;
} {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const timeInMinutes = now.getHours() * 60 + now.getMinutes();
    const viDay = dayOfWeek === 0 ? 8 : dayOfWeek + 1;

    let currentPeriod: number | null = null;
    if (timeInMinutes >= 450 && timeInMinutes < 500) currentPeriod = 1;
    else if (timeInMinutes >= 500 && timeInMinutes < 550) currentPeriod = 2;
    else if (timeInMinutes >= 550 && timeInMinutes < 610) currentPeriod = 3;
    else if (timeInMinutes >= 610 && timeInMinutes < 660) currentPeriod = 4;
    else if (timeInMinutes >= 660 && timeInMinutes < 760) currentPeriod = 5;
    else if (timeInMinutes >= 760 && timeInMinutes < 810) currentPeriod = 6;
    else if (timeInMinutes >= 810 && timeInMinutes < 860) currentPeriod = 7;
    else if (timeInMinutes >= 860 && timeInMinutes < 920) currentPeriod = 8;
    else if (timeInMinutes >= 920 && timeInMinutes < 970) currentPeriod = 9;
    else if (timeInMinutes >= 970 && timeInMinutes < 1020) currentPeriod = 10;

    return {
        dayOfWeek: viDay,
        currentPeriod,
        isToday: (day: number) => day === viDay && viDay >= 2 && viDay <= 7,
    };
}