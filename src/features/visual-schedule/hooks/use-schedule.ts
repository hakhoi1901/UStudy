import { useMemo, useState, useEffect } from 'react';
import { readFromStorage, saveToStorage } from '../../../helpers/localStorage/save';
import { STORAGE_KEYS } from '../../../config';
import { useDepartmentData } from '../../../context/DepartmentContext';
import { ScheduleLogic } from '../services/schedule-logic';
import { type WeeklySchedule, type ScheduleOverrides, type Holiday } from '../types';

const EMPTY_OVERRIDES: ScheduleOverrides = { sessionOverrides: {}, weekOverrides: {}, holidays: [] };

function normalizeOverrides(value: ScheduleOverrides | null | undefined): ScheduleOverrides {
    return {
        sessionOverrides: value?.sessionOverrides || {},
        weekOverrides: value?.weekOverrides || {},
        holidays: Array.isArray(value?.holidays) ? value.holidays : [],
    };
}

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
    const registrationMeta = metadata?.params?.registration;
    const overridesStorageKey = `${STORAGE_KEYS.SCHEDULE_OVERRIDES}:${registrationMeta?.year || 'unknown'}:${registrationMeta?.sem || 'unknown'}`;
    const groupRegistrations = activeGroupSchedule?.registrations ?? legacySavedSchedules?.activeGroupSchedule?.registrations;
    const courses_registered = Array.isArray(groupRegistrations) && groupRegistrations.length > 0
        ? groupRegistrations
        : studentDb?.registrations || [];

    const [systemHolidays, setSystemHolidays] = useState<Holiday[]>([]);

    const readOverridesForSemester = () => {
        const semesterOverrides = readFromStorage<ScheduleOverrides | null>(overridesStorageKey, null);
        if (semesterOverrides) return normalizeOverrides(semesterOverrides);

        // Dữ liệu trước đây dùng một key chung; giữ làm fallback để không mất thiết lập cũ.
        return normalizeOverrides(readFromStorage<ScheduleOverrides>(STORAGE_KEYS.SCHEDULE_OVERRIDES, EMPTY_OVERRIDES));
    };

    // Dùng useState để tránh reload trang khi cập nhật overrides
    const [overrides, setOverrides] = useState<ScheduleOverrides>(readOverridesForSemester);

    useEffect(() => {
        setOverrides(readOverridesForSemester());
    }, [overridesStorageKey]);

    useEffect(() => {
        fetch('/holidays.json')
            .then(res => res.json())
            .then(data => setSystemHolidays(Array.isArray(data) ? data : []))
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
        const normalized = normalizeOverrides(newOverrides);
        saveToStorage(overridesStorageKey, normalized);
        setOverrides(normalized);
    };

    return {
        ...schedule,
        overrides,
        systemHolidays,
        updateOverrides
    };
}
