import { useMemo, useState, useEffect } from 'react';
import { readFromStorage, saveToStorage } from '../../../helpers/localStorage/save';
import { STORAGE_KEYS } from '../../../config';
import { useDepartmentData } from '../../../context/DepartmentContext';
import { ScheduleLogic } from '../services/schedule-logic';
import { type WeeklySchedule, type ScheduleOverrides, type Holiday } from '../types';

export function useSchedule(): WeeklySchedule & {
    overrides: ScheduleOverrides;
    systemHolidays: Holiday[];
    updateOverrides: (newOverrides: ScheduleOverrides) => void
} {
    const { data: { courses: allCoursesMeta } } = useDepartmentData();
    const studentDb = readFromStorage<any>(STORAGE_KEYS.STUDENT_DB, null);
    const metadata = readFromStorage<any>(STORAGE_KEYS.IMPORT_META, null);
    const activeGroupSchedule = readFromStorage<any>(STORAGE_KEYS.ACTIVE_GROUP_SCHEDULE, null);
    const legacySavedSchedules = readFromStorage<any>(STORAGE_KEYS.SAVED_SCHEDULES, null);
    const groupRegistrations = activeGroupSchedule?.registrations ?? legacySavedSchedules?.activeGroupSchedule?.registrations;
    const courses_registered = Array.isArray(groupRegistrations) && groupRegistrations.length > 0
        ? groupRegistrations
        : studentDb?.registrations || [];

    const [systemHolidays, setSystemHolidays] = useState<Holiday[]>([]);

    // Dùng useState để tránh reload trang khi cập nhật overrides
    const [overrides, setOverrides] = useState<ScheduleOverrides>(() => {
        const stored = readFromStorage<ScheduleOverrides>(STORAGE_KEYS.SCHEDULE_OVERRIDES, { sessionOverrides: {}, weekOverrides: {}, holidays: [] });
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
