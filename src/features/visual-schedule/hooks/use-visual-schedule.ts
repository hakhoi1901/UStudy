import { useState, useMemo } from 'react';
import { useSchedule } from './use-schedule';
import { useCourseData } from '../../../hooks/useCourseData';
import { ScheduleLogic } from '../services/schedule-logic';
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

    const displaySessions = useMemo(() => {
        return schedule.sessions.filter(session => {
            const allHolidays = [...schedule.systemHolidays, ...schedule.overrides.holidays];

            const relevantHolidays = allHolidays.filter(h => {
                const isAffectedCourse = h.affectedCourseCodes === 'all' || h.affectedCourseCodes.includes(session.courseCode);
                if (!isAffectedCourse) return false;
                if (!semesterStartDate || !session.startDateParsed || !session.endDateParsed) return true;

                const holidayStart = new Date(semesterStartDate);
                holidayStart.setDate(holidayStart.getDate() + (h.startWeek - 1) * 7);
                const holidayEnd = new Date(holidayStart);
                holidayEnd.setDate(holidayEnd.getDate() + h.duration * 7 - 1);
                holidayEnd.setHours(23, 59, 59, 999);

                return holidayStart <= session.endDateParsed && holidayEnd >= session.startDateParsed;
            });

            const actualWeek = ScheduleLogic.getActualWeekForCourse(currentWeek, session.courseCode, relevantHolidays);
            if (actualWeek === null) return false;

            const sessionOverride = schedule.overrides.sessionOverrides[session.id];
            if (sessionOverride) {
                if (sessionOverride.startWeek !== undefined && actualWeek < sessionOverride.startWeek) return false;
                if (sessionOverride.endWeek !== undefined && actualWeek > sessionOverride.endWeek) return false;
                if (sessionOverride.hiddenWeeks?.includes(currentWeek)) return false;
            }

            if (!semesterStartDate || !session.startDateParsed || !session.endDateParsed) return true;

            const contentWeekStart = new Date(semesterStartDate);
            contentWeekStart.setDate(contentWeekStart.getDate() + (actualWeek - 1) * 7);
            const contentWeekEnd = new Date(contentWeekStart);
            contentWeekEnd.setDate(contentWeekEnd.getDate() + 6);
            contentWeekEnd.setHours(23, 59, 59, 999);

            return !(contentWeekStart > session.endDateParsed || contentWeekEnd < session.startDateParsed);
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

        const prevWeekStart = new Date(semesterStartDate);
        prevWeekStart.setDate(prevWeekStart.getDate() + (currentWeek - 2) * 7);
        const prevWeekEnd = new Date(prevWeekStart);
        prevWeekEnd.setDate(prevWeekEnd.getDate() + 6);
        prevWeekEnd.setHours(23, 59, 59, 999);

        const prevSessions = schedule.sessions.filter(session => {
            if (!session.startDateParsed || !session.endDateParsed) return true;
            return !(prevWeekStart > session.endDateParsed || prevWeekEnd < session.startDateParsed);
        });

        const prevTotalPeriods = prevSessions.reduce((acc, s) => acc + s.duration, 0);
        const prevTotalCourses = new Set(prevSessions.map(s => s.courseCode)).size;

        const diffPeriods = stats.totalPeriods - prevTotalPeriods;
        const diffCourses = stats.totalCourses - prevTotalCourses;

        return {
            periodsTrend: diffPeriods > 0 ? { direction: 'up' as const, value: `+${diffPeriods} tiết` } : (diffPeriods < 0 ? { direction: 'down' as const, value: `${diffPeriods} tiết` } : undefined),
            coursesTrend: diffCourses > 0 ? { direction: 'up' as const, value: `+${diffCourses} môn` } : (diffCourses < 0 ? { direction: 'down' as const, value: `${diffCourses} môn` } : undefined),
        };
    }, [currentWeek, semesterStartDate, schedule.sessions, stats.totalPeriods, stats.totalCourses]);

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
    const handleNextWeek = () => currentWeek < 25 && setCurrentWeek(currentWeek + 1);
    const handleExport = () => exportCalendar(schedule);

    return {
        isReady,
        hasData,
        schedule,
        currentWeek,
        weekRangeStr,
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
