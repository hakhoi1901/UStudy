/**
 * useRegisteredCourses.ts
 *
 * Hook đọc student_db.registrations → gọi RegistrationResolver →
 * trả về registered baseline data cho solver + UI.
 *
 * Invariant: Output mask là number[] (serialized, immutable-friendly).
 * Registered baseline KHÔNG bao giờ đi vào ScheduleDraft.
 */

import { useEffect, useMemo, useState } from 'react';
import { readFromStorage } from '../helpers/localStorage/save';
import { STORAGE_KEYS } from '../config';
import { CACHE_POPULATED_EVENT } from '../context/CryptoContext';
import {
    resolveRegistrations,
    computeCombinedMask,
    normalizeSemester,
    type RegisteredCourse,
    type RawRegistration,
} from '../logic/scheduler/RegistrationResolver';
import { maskToSections } from '../logic/scheduler/ScheduleDecoder';
import type { ClassSection } from '../types';

/** Color dùng cho registered sections — xám tím nhạt, phân biệt với palette solver. */
const REGISTERED_COLOR = '#6B7280';

export interface UseRegisteredCoursesResult {
    /** Danh sách môn đã đăng ký, mỗi môn gồm components (LT/TH/BT) + mask. */
    registeredCourses: RegisteredCourse[];

    /** ClassSection[] đã map sang format UI, gắn isRegistered: true. Dùng để render trên calendar. */
    registeredSections: ClassSection[];

    /** Combined mask (serialized number[]) — "vùng cấm" cho solver. */
    registeredMask: number[];

    /** Set mã môn đã đăng ký — để UI disable chọn. */
    registeredCourseCodes: Set<string>;

    /** True khi dữ liệu đã sẵn sàng (luôn true vì đọc sync từ localStorage). */
    isReady: boolean;
}

export function useRegisteredCourses(): UseRegisteredCoursesResult {
    const [cacheRevision, setCacheRevision] = useState(0);

    useEffect(() => {
        const refresh = (event: MessageEvent) => {
            if (event.data?.type === 'IMPORT_FULL_DATA' || event.data?.type === CACHE_POPULATED_EVENT) {
                setCacheRevision((revision) => revision + 1);
            }
        };
        const refreshFromAnotherTab = (event: StorageEvent) => {
            if (event.key === STORAGE_KEYS.STUDENT_DB || event.key === STORAGE_KEYS.IMPORT_META) {
                setCacheRevision((revision) => revision + 1);
            }
        };

        window.addEventListener('message', refresh);
        window.addEventListener('storage', refreshFromAnotherTab);
        return () => {
            window.removeEventListener('message', refresh);
            window.removeEventListener('storage', refreshFromAnotherTab);
        };
    }, []);

    return useMemo(() => {
        // 1. Đọc dữ liệu
        // Registrations sống trong student_db_full (đã xử lý từ bookmarklet)
        // Tham chiếu: visual-schedule/hooks/use-schedule.ts dùng cùng key
        const studentDb = readFromStorage<any>(STORAGE_KEYS.STUDENT_DB, null);
        const importMeta = readFromStorage<any>(STORAGE_KEYS.IMPORT_META, null);

        const rawRegistrations: RawRegistration[] = studentDb?.registrations || [];

        if (rawRegistrations.length === 0) {
            return {
                registeredCourses: [],
                registeredSections: [],
                registeredMask: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                registeredCourseCodes: new Set<string>(),
                isReady: true,
            };
        }

        // 2. Xác định semester hiện tại từ import_meta
        const currentSemester = normalizeSemester(
            importMeta?.params?.registration || importMeta?.params?.class || null
        );

        // 3. Resolve
        const matchedCourses = resolveRegistrations(rawRegistrations, {
            currentSemester,
            acceptMissingSemester: true, // Nếu thiếu semester, coi như kỳ hiện tại
        });

        // Metadata của lần cào là phạm vi snapshot hiện tại. Nếu kỳ đó rỗng,
        // không được fallback sang môn đăng ký của kỳ cũ.
        const registeredCourses = matchedCourses;

        // 4. Combined mask (serialized)
        const registeredMask = computeCombinedMask(registeredCourses);

        // 5. Map thành ClassSection[] cho UI
        const registeredSections: ClassSection[] = [];
        for (const course of registeredCourses) {
            const sections = maskToSections(
                course.scheduleMask,
                course.courseCode,
                course.courseName,
                course.components.map(c => c.classGroup).filter(Boolean).join(' / ') || '---',
                REGISTERED_COLOR,
                0, // credits — không dùng cho registered display
            );

            // Gắn flag isRegistered cho mỗi section + thêm room info nếu có
            const rooms = course.components.map(c => c.room).filter(Boolean);
            for (const section of sections) {
                (section as any).isRegistered = true;
                if (rooms.length > 0) {
                    section.room = rooms.join(', ');
                }
            }

            registeredSections.push(...sections);
        }

        const registeredCourseCodes = new Set(registeredCourses.map(c => c.courseCode));

        return {
            registeredCourses,
            registeredSections,
            registeredMask,
            registeredCourseCodes,
            isReady: true,
        };
    }, [cacheRevision]);
}
