import { useState, useEffect, useMemo } from 'react';
import { readFromStorage } from '../helpers/localStorage/save';
import { STORAGE_KEYS } from '../config';
import { useDepartmentData } from '../context/DepartmentContext';
import { timePeriods } from '../constants/timetable';

export interface ScheduleSession {
    id: string;
    courseCode: string;
    courseName: string;
    classCode: string;
    credits: number;
    type: 'LT' | 'TH' | 'BT'; // Lý thuyết, Thực hành, Bài tập
    instructor: string;
    room: string;
    dayOfWeek: 2 | 3 | 4 | 5 | 6 | 7;
    startPeriod: number;
    endPeriod: number;
    startTime: string;
    endTime: string;
    color: 'blue' | 'green' | 'yellow' | 'purple';
    session: 'morning' | 'afternoon';
    duration: number; // Số tiết: 2, 2.5, etc.
    totalWeeks: number;
    startDate: string;
    endDate: string;
    location?: string;
}

export interface WeeklySchedule {
    semester: string;
    semesterName: string;
    weekNumber: number;
    weekRange: string;
    totalCourses: number;
    totalCredits: number;
    totalPeriodsPerWeek: number;
    totalHoursPerWeek: number;
    sessions: ScheduleSession[];
}

export interface Day {
    value: 2 | 3 | 4 | 5 | 6 | 7;
    label: string;
    short: string;
}

// ==================== CONSTANTS ====================

export const DAYS: Day[] = [
    { value: 2, label: 'Thứ 2', short: 'T2' },
    { value: 3, label: 'Thứ 3', short: 'T3' },
    { value: 4, label: 'Thứ 4', short: 'T4' },
    { value: 5, label: 'Thứ 5', short: 'T5' },
    { value: 6, label: 'Thứ 6', short: 'T6' },
    { value: 7, label: 'Thứ 7', short: 'T7' },
];

const COLORS = ['blue', 'green', 'yellow', 'purple'] as const;

export function useSchedule(): WeeklySchedule {
    const studentDb = readFromStorage<any>(STORAGE_KEYS.STUDENT_DB, null);
    const metadata = readFromStorage<any>(STORAGE_KEYS.IMPORT_META, {});
    const { data: { courses: allCoursesMeta } } = useDepartmentData();

    const courses_registered = studentDb?.registrations || [];

    console.log("Registered: ", courses_registered)

    return useMemo(() => {
        const semester = metadata?.params?.registration?.sem || '1';
        const year = metadata?.params?.registration?.year || '24-25';

        let totalCourses = 0;
        let totalCredits = 0;
        let totalPeriodsPerWeek = 0;
        let totalHoursPerWeek = 0;

        const sessions: ScheduleSession[] = [];

        const colorMap = new Map<string, typeof COLORS[number]>();
        let colorIndex = 0;

        courses_registered.forEach((course: any, index: number) => {
            const meta = allCoursesMeta.find((m: any) => m.course_id === course.id);
            const credits = parseInt(meta?.credits as any) || 0;
            const theoryHours = parseInt(meta?.theory_hours as any) || 0;
            const labHours = parseInt(meta?.lab_hours as any) || 0;
            const exerciseHours = parseInt(meta?.exercise_hours as any) || 0;

            const scheduleStr = course.schedule || '';
            const scheduleParts = scheduleStr.split(',').map((s: string) => s.trim()).filter(Boolean);

            if (scheduleParts.length > 0 && course.courseType === 'LT') {
                totalCourses++;
                totalCredits += credits;
            }

            if (!colorMap.has(course.id)) {
                colorMap.set(course.id, COLORS[colorIndex % COLORS.length]);
                colorIndex++;
            }
            const color = colorMap.get(course.id) || 'blue';

            scheduleParts.forEach((part: string, partIdx: number) => {
                const match = part.match(/T(\d|CN)\s*\(([\d.]+)-([\d.]+)\)(?:\s*-\s*([^:]+)(?::\s*(.*))?)?/);
                if (match) {
                    const dayStr = match[1];
                    const dayOfWeek = (dayStr === 'CN' ? 8 : parseInt(dayStr, 10)) as ScheduleSession['dayOfWeek'];

                    let startPeriod = parseFloat(match[2]);
                    let endPeriod = parseFloat(match[3]);
                    let room = match[5];

                    let duration = endPeriod - startPeriod + (startPeriod % 1 !== 0 ? 0.5 : 1);

                    if (course.courseType === 'TH' || course.courseType === 'BT') {
                        duration = 2.5;
                        if (startPeriod === 1 && endPeriod === 3) {
                            endPeriod = 2.5;
                        } else if (startPeriod === 3 && endPeriod === 5) {
                            startPeriod = 3.5;
                        } else if (startPeriod === 6 && endPeriod === 8) {
                            endPeriod = 7.5;
                        } else if (startPeriod === 8 && endPeriod === 10) {
                            startPeriod = 8.5;
                        }
                    }

                    let startTimeStr = '00:00';
                    let endTimeStr = '00:00';

                    if (startPeriod === 3.5) startTimeStr = '09:45';
                    else if (startPeriod === 8.5) startTimeStr = '14:55';
                    else {
                        const startObj = timePeriods.find(p => p.period === Math.floor(startPeriod));
                        if (startObj) startTimeStr = startObj.time.split(' - ')[0].trim();
                    }

                    if (endPeriod === 2.5) endTimeStr = '09:35';
                    else if (endPeriod === 7.5) endTimeStr = '14:45';
                    else {
                        const endObj = timePeriods.find(p => p.period === Math.ceil(endPeriod));
                        if (endObj) endTimeStr = endObj.time.split(' - ')[1].trim();
                    }

                    const sessionParams = Math.floor(startPeriod) <= 5 ? 'morning' as const : 'afternoon' as const;

                    totalPeriodsPerWeek += duration;
                    totalHoursPerWeek += duration;

                    const cType = (course.courseType || 'LT') as 'LT' | 'TH' | 'BT';
                    let requiredHours = theoryHours;
                    if (cType === 'TH') requiredHours = labHours;
                    else if (cType === 'BT') requiredHours = exerciseHours;

                    const totalWeeks = requiredHours > 0 && duration > 0 ? Math.ceil(requiredHours / duration) : 0;

                    let startDateStr = course.startWeek || '';
                    let endDateStr = '';
                    if (startDateStr && totalWeeks > 0) {
                        const parts = startDateStr.split('/');
                        if (parts.length === 3) {
                            const [day, month, year] = parts.map(Number);
                            const startD = new Date(year, month - 1, day);
                            if (!isNaN(startD.getTime())) {
                                const endD = new Date(startD);
                                endD.setDate(endD.getDate() + (totalWeeks - 1) * 7);
                                endDateStr = `${endD.getDate().toString().padStart(2, '0')}/${(endD.getMonth() + 1).toString().padStart(2, '0')}/${endD.getFullYear()}`;
                            }
                        }
                    }

                    sessions.push({
                        id: `${course.id}_${index}_${partIdx}`,
                        courseCode: course.id,
                        courseName: course.name,
                        classCode: course.classGroup,
                        credits: credits,
                        type: cType,
                        instructor: course.instructor || '',
                        room: room || '',
                        dayOfWeek: dayOfWeek,
                        startPeriod: startPeriod,
                        endPeriod: endPeriod,
                        startTime: startTimeStr,
                        endTime: endTimeStr,
                        color: color,
                        session: sessionParams,
                        duration: duration,
                        totalWeeks: totalWeeks,
                        startDate: startDateStr,
                        endDate: endDateStr,
                    });
                }
            });
        });

        sessions.sort((a, b) => {
            if (a.dayOfWeek !== b.dayOfWeek) return a.dayOfWeek - b.dayOfWeek;
            return a.startPeriod - b.startPeriod;
        });

        console.log("Secsions: ", sessions)

        return {
            semester: `${semester}-${year}`,
            semesterName: `Học kỳ ${semester} Năm học ${year}`,
            weekNumber: 1,
            weekRange: 'Tuần 1',
            totalCourses: totalCourses,
            totalCredits: totalCredits,
            totalPeriodsPerWeek: totalPeriodsPerWeek,
            totalHoursPerWeek: totalHoursPerWeek,
            sessions: sessions,
        };
    }, [courses_registered, metadata, allCoursesMeta]);
}