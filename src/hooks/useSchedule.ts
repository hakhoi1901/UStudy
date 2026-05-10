import { useMemo, useState, useEffect } from 'react';
import { readFromStorage, saveToStorage } from '../helpers/localStorage/save';
import { STORAGE_KEYS } from '../config';
import { useDepartmentData } from '../context/DepartmentContext';
import { ScheduleLogic } from '../logic/ScheduleLogic';

import { type WeeklySchedule, type ScheduleOverrides, type Holiday } from '../types/Schedule';

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

export function useSchedule(): WeeklySchedule & { 
    overrides: ScheduleOverrides; 
    systemHolidays: Holiday[];
    updateOverrides: (newOverrides: ScheduleOverrides) => void 
} {
    const { data: { courses: allCoursesMeta } } = useDepartmentData();
    const studentDb = readFromStorage<any>(STORAGE_KEYS.STUDENT_DB);
    const metadata = readFromStorage<any>(STORAGE_KEYS.IMPORT_META);
    const courses_registered = studentDb?.registrations || [];

    const [systemHolidays, setSystemHolidays] = useState<Holiday[]>([]);

    // Dùng useState để tránh reload trang khi cập nhật overrides
    const [overrides, setOverrides] = useState<ScheduleOverrides>(() => {
        const stored = readFromStorage<ScheduleOverrides>(STORAGE_KEYS.SCHEDULE_OVERRIDES);
        return stored || { sessionOverrides: {}, weekOverrides: {}, holidays: [] };
    });

    useEffect(() => {
        fetch('/holidays.json')
            .then(res => res.json())
            .then(data => setSystemHolidays(data))
            .catch(err => console.error('Failed to load system holidays:', err));
    }, []);

    const schedule = useMemo(() => {
        return ScheduleLogic.buildScheduleSessions(
            courses_registered,
            allCoursesMeta,
            metadata,
            overrides,
            systemHolidays
        );
    }, [courses_registered, metadata, allCoursesMeta, overrides, systemHolidays]);

    const updateOverrides = (newOverrides: ScheduleOverrides) => {
        saveToStorage(STORAGE_KEYS.SCHEDULE_OVERRIDES, newOverrides);
        setOverrides(newOverrides); // Cập nhật state trực tiếp, không reload
    };

    return {
        ...schedule,
        overrides,
        systemHolidays,
        updateOverrides
    };
}