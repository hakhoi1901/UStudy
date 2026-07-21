import { useEffect, useState, useMemo } from 'react';
import { useSchedule } from './use-schedule';
import { useCourseData } from '../../../hooks/useCourseData';
import { ScheduleLogic } from '../services/schedule-logic';
import { getHolidayDateRange, getScheduleCalendarWeekCount, isSessionActiveInWeek, sortHolidays } from '../services/holiday-logic';
import { exportCalendar } from '../services/schedule-export';
import { getCurrentDayAndTime } from '../services/schedule-helpers';
import { type ScheduleSession } from '../types';

interface UseVisualScheduleProps {
    selectedSemester?: string;
}

export function useVisualSchedule({ selectedSemester }: UseVisualScheduleProps = {}) {
    const { overrides, updateOverrides, ...SEMESTER_3_SCHEDULE_BASE } = useSchedule();
    const { isReady, hasData } = useCourseData();

    const [currentWeek, setCurrentWeek] = useState(() => {
        if (!SEMESTER_3_SCHEDULE_BASE.semesterStartDate) return 1;
        const now = new Date();
        const msDiff = now.getTime() - SEMESTER_3_SCHEDULE_BASE.semesterStartDate.getTime();
        if (msDiff < 0) return 1;
        const week = Math.floor(msDiff / (7 * 24 * 60 * 60 * 1000)) + 1;
        return week;
    });

    const schedule = useMemo(() => ({
        ...SEMESTER_3_SCHEDULE_BASE,
        semesterName: selectedSemester || SEMESTER_3_SCHEDULE_BASE.semesterName,
        overrides,
        updateOverrides
    }), [SEMESTER_3_SCHEDULE_BASE, selectedSemester, overrides, updateOverrides]);

    const { semesterStartDate } = schedule;

    const totalWeeks = useMemo(() => {
        const allHolidays = [...(schedule.systemHolidays || []), ...schedule.overrides.holidays];
        return getScheduleCalendarWeekCount(schedule.sessions, semesterStartDate, allHolidays);
    }, [schedule.sessions, schedule.systemHolidays, schedule.overrides.holidays, semesterStartDate]);

    useEffect(() => {
        setCurrentWeek((week) => Math.min(Math.max(1, week), totalWeeks));
    }, [totalWeeks]);

    const displaySessions = useMemo(() => {
        const allHolidays = [...schedule.systemHolidays, ...schedule.overrides.holidays];
        return schedule.sessions.filter(session => {
            if (!isSessionActiveInWeek(session, currentWeek, semesterStartDate, allHolidays)) return false;

            const sessionOverride = schedule.overrides.sessionOverrides[session.id];
            if (sessionOverride) {
                if (sessionOverride.startWeek !== undefined && currentWeek < sessionOverride.startWeek) return false;
                if (sessionOverride.endWeek !== undefined && currentWeek > sessionOverride.endWeek) return false;
                if (sessionOverride.hiddenWeeks?.includes(currentWeek)) return false;
            }
            return true;
        }).map(session => {
            const weekOverride = schedule.overrides.weekOverrides[`${currentWeek}_${session.id}`];
            if (weekOverride) {
                let sP = weekOverride.startPeriod !== undefined ? weekOverride.startPeriod : session.startPeriod;
                let eP = weekOverride.endPeriod !== undefined ? weekOverride.endPeriod : session.endPeriod;
                const adjusted = ScheduleLogic.adjustPeriodsForPractical(session.type, sP, eP);

                return {
                    ...session,
                    ...weekOverride,
                    startPeriod: adjusted.startPeriod,
                    endPeriod: adjusted.endPeriod,
                    startTime: ScheduleLogic.periodToTimeString(adjusted.startPeriod, true),
                    endTime: ScheduleLogic.periodToTimeString(adjusted.endPeriod, false),
                    duration: adjusted.duration,
                    isOverridden: true
                };
            }
            return session;
        });
    }, [schedule, currentWeek, semesterStartDate]);

    const weekRangeStr = useMemo(() => {
        if (!semesterStartDate) return `Tuần ${currentWeek}`;
        const wStart = new Date(semesterStartDate);
        wStart.setDate(wStart.getDate() + (currentWeek - 1) * 7);
        const wEnd = new Date(wStart);
        wEnd.setDate(wEnd.getDate() + 6);
        return `${String(wStart.getDate()).padStart(2, '0')}/${String(wStart.getMonth() + 1).padStart(2, '0')}/${wStart.getFullYear()} - ${String(wEnd.getDate()).padStart(2, '0')}/${String(wEnd.getMonth() + 1).padStart(2, '0')}/${wEnd.getFullYear()}`;
    }, [semesterStartDate, currentWeek]);

    const currentWeekHolidays = useMemo(() => {
        if (!semesterStartDate) return [];
        const weekStart = new Date(semesterStartDate);
        weekStart.setDate(weekStart.getDate() + (currentWeek - 1) * 7);
        weekStart.setHours(0, 0, 0, 0);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        weekEnd.setHours(23, 59, 59, 999);

        return sortHolidays([...schedule.systemHolidays, ...schedule.overrides.holidays], semesterStartDate)
            .filter((holiday) => {
                const range = getHolidayDateRange(holiday, semesterStartDate);
                return Boolean(range && range.start <= weekEnd && range.end >= weekStart);
            });
    }, [currentWeek, schedule.systemHolidays, schedule.overrides.holidays, semesterStartDate]);

    const stats = useMemo(() => {
        const uniqueCourseCodes = new Set(displaySessions.map(s => s.courseCode));
        const totalCredits = Array.from(uniqueCourseCodes).reduce((acc, code) => {
            const s = displaySessions.find(s => s.courseCode === code);
            return acc + (s?.credits || 0);
        }, 0);

        const totalPeriods = displaySessions.reduce((acc, s) => acc + s.duration, 0);
        const totalMinutes = totalPeriods * 50;
        const formattedHours = totalMinutes % 60 === 0
            ? `${Math.floor(totalMinutes / 60)} giờ`
            : `${Math.floor(totalMinutes / 60)} giờ ${totalMinutes % 60} phút`;

        return {
            totalCourses: uniqueCourseCodes.size,
            totalCredits,
            totalPeriods,
            formattedHours
        };
    }, [displaySessions]);

    const trends = useMemo(() => {
        if (currentWeek <= 1 || !semesterStartDate) return { periodsTrend: undefined, coursesTrend: undefined };

        const previousWeek = currentWeek - 1;
        const allHolidays = [...schedule.systemHolidays, ...schedule.overrides.holidays];
        const prevSessions = schedule.sessions.filter(session => {
            if (!isSessionActiveInWeek(session, previousWeek, semesterStartDate, allHolidays)) return false;
            const override = schedule.overrides.sessionOverrides[session.id];
            if (!override) return true;
            if (override.startWeek !== undefined && previousWeek < override.startWeek) return false;
            if (override.endWeek !== undefined && previousWeek > override.endWeek) return false;
            return !override.hiddenWeeks?.includes(previousWeek);
        });

        const prevTotalPeriods = prevSessions.reduce((acc, s) => acc + s.duration, 0);
        const prevTotalCourses = new Set(prevSessions.map(s => s.courseCode)).size;

        const diffPeriods = stats.totalPeriods - prevTotalPeriods;
        const diffCourses = stats.totalCourses - prevTotalCourses;

        return {
            periodsTrend: diffPeriods > 0 ? { direction: 'up' as const, value: `+${diffPeriods} tiết` } : (diffPeriods < 0 ? { direction: 'down' as const, value: `${diffPeriods} tiết` } : undefined),
            coursesTrend: diffCourses > 0 ? { direction: 'up' as const, value: `+${diffCourses} môn` } : (diffCourses < 0 ? { direction: 'down' as const, value: `${diffCourses} môn` } : undefined),
        };
    }, [currentWeek, semesterStartDate, schedule.sessions, schedule.systemHolidays, schedule.overrides, stats.totalPeriods, stats.totalCourses]);

    const uniqueCourses = useMemo(() => {
        return schedule.sessions.reduce((acc, session) => {
            if (!acc.find(s => s.courseCode === session.courseCode)) {
                acc.push(session);
            }
            return acc;
        }, [] as ScheduleSession[]);
    }, [schedule.sessions]);

    const { isToday, currentPeriod } = getCurrentDayAndTime();

    const handlePreviousWeek = () => currentWeek > 1 && setCurrentWeek(currentWeek - 1);
    const handleNextWeek = () => currentWeek < totalWeeks && setCurrentWeek(currentWeek + 1);
    const handleExport = () => exportCalendar(schedule);

    return {
        isReady,
        hasData,
        schedule,
        currentWeek,
        totalWeeks,
        weekRangeStr,
        currentWeekHolidays,
        displaySessions,
        stats,
        trends,
        uniqueCourses,
        isToday,
        currentPeriod,
        handlePreviousWeek,
        handleNextWeek,
        handleExport
    };
}
