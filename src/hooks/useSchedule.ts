import { useMemo } from 'react';
import { readFromStorage, saveToStorage } from '../helpers/localStorage/save';
import { STORAGE_KEYS } from '../config';
import { useDepartmentData } from '../context/DepartmentContext';
import { ScheduleLogic } from '../logic/ScheduleLogic';

import { type WeeklySchedule, type ScheduleOverrides } from '../types/Schedule';

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

export function useSchedule(): WeeklySchedule & { overrides: ScheduleOverrides; updateOverrides: (newOverrides: ScheduleOverrides) => void } {
    const studentDb = readFromStorage<any>(STORAGE_KEYS.STUDENT_DB, null);
    const metadata = readFromStorage<any>(STORAGE_KEYS.IMPORT_META, {});
    const { data: { courses: allCoursesMeta } } = useDepartmentData();

    // Read overrides from storage
    const overrides = useMemo(() => {
        return readFromStorage<ScheduleOverrides>(STORAGE_KEYS.SCHEDULE_OVERRIDES, {
            sessionOverrides: {},
            weekOverrides: {},
            holidays: []
        });
    }, []);

    const courses_registered = studentDb?.registrations || [];

    const schedule = useMemo(() => {
        return ScheduleLogic.buildScheduleSessions(
            courses_registered,
            allCoursesMeta,
            metadata,
            overrides
        );
    }, [courses_registered, metadata, allCoursesMeta, overrides]);

    const updateOverrides = (newOverrides: ScheduleOverrides) => {
        saveToStorage(STORAGE_KEYS.SCHEDULE_OVERRIDES, newOverrides);
        // Force refresh by reloading (simple way) or using a state. 
        // For now, let's just assume we reload or the component will re-render if we use a state.
        window.location.reload();
    };

    return {
        ...schedule,
        overrides,
        updateOverrides
    };
}