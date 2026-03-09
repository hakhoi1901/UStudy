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
    dayOfWeek: 2 | 3 | 4 | 5 | 6 | 7; // 2=T2, 7=T7
    startPeriod: number;
    endPeriod: number; // Có thể là số thập phân cho TH: 3.5, 5.5, 8.5, 10.5
    startTime: string;
    endTime: string;
    color: 'blue' | 'green' | 'yellow' | 'purple';
    session: 'morning' | 'afternoon';
    duration: number; // Số tiết: 2, 2.5, etc.
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

    console.log(courses_registered)

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

            const scheduleStr = course.schedule || '';
            const scheduleParts = scheduleStr.split(',').map((s: string) => s.trim()).filter(Boolean);

            if (scheduleParts.length > 0) {
                totalCourses++;
                totalCredits += credits;
            }

            if (!colorMap.has(course.id)) {
                colorMap.set(course.id, COLORS[colorIndex % COLORS.length]);
                colorIndex++;
            }
            const color = colorMap.get(course.id) || 'blue';

            scheduleParts.forEach((part: string, partIdx: number) => {
                const match = part.match(/T(\d|CN)\s*\(([\d.]+)-([\d.]+)\)/);
                if (match) {
                    const dayStr = match[1];
                    const dayOfWeek = (dayStr === 'CN' ? 8 : parseInt(dayStr, 10)) as ScheduleSession['dayOfWeek'];

                    let startPeriod = parseFloat(match[2]);
                    let endPeriod = parseFloat(match[3]);

                    // Logic xử lý ca Thực Hành (TH) hoặc Bài Tập (BT) bị chia rưỡi
                    if (course.courseType === 'TH' || course.courseType === 'BT') {
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

                    const duration = endPeriod - startPeriod + (startPeriod % 1 !== 0 ? 0.5 : 1);

                    // Lấy string thời gian gốc từ constants
                    let startTimeStr = '00:00';
                    let endTimeStr = '00:00';

                    // Xử lý custom time cho startPeriod
                    if (startPeriod === 3.5) startTimeStr = '09:45';
                    else if (startPeriod === 8.5) startTimeStr = '14:55';
                    else {
                        const startObj = timePeriods.find(p => p.period === Math.floor(startPeriod));
                        if (startObj) startTimeStr = startObj.time.split(' - ')[0].trim();
                    }

                    // Xử lý custom time cho endPeriod 
                    if (endPeriod === 2.5) endTimeStr = '09:35';
                    else if (endPeriod === 7.5) endTimeStr = '14:45';
                    else {
                        const endObj = timePeriods.find(p => p.period === Math.ceil(endPeriod));
                        if (endObj) endTimeStr = endObj.time.split(' - ')[1].trim();
                    }

                    // Xác định Buổi (Sáng/Chiều) dựa trên startPeriod
                    const sessionParams = Math.floor(startPeriod) <= 5 ? 'morning' as const : 'afternoon' as const;

                    totalPeriodsPerWeek += duration;
                    totalHoursPerWeek += duration;

                    sessions.push({
                        id: `${course.id}_${index}_${partIdx}`,
                        courseCode: course.id,
                        courseName: course.name,
                        classCode: course.classGroup,
                        credits: credits,
                        type: (course.courseType || 'LT') as 'LT' | 'TH' | 'BT',
                        instructor: course.instructor || '',
                        room: course.room || '---',
                        dayOfWeek: dayOfWeek,
                        startPeriod: startPeriod,
                        endPeriod: endPeriod,
                        startTime: startTimeStr,
                        endTime: endTimeStr,
                        color: color,
                        session: sessionParams,
                        duration: duration,
                    });
                }
            });
        });

        sessions.sort((a, b) => {
            if (a.dayOfWeek !== b.dayOfWeek) return a.dayOfWeek - b.dayOfWeek;
            return a.startPeriod - b.startPeriod;
        });

        console.log(sessions)

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