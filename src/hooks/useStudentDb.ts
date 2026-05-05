import { useMemo, useState, useEffect } from 'react';
import { readFromStorage } from '../helpers/localStorage/save';
import { STORAGE_KEYS } from '../config';

/**
 * Thông tin tổng quát về sinh viên
 */
export interface StudentInfo {
    name: string;
}

/**
 * Custom Hook để lấy dữ liệu từ student_db_full.
 * 
 * Cách dùng:
 * ```tsx
 * const { name, grades, tuition, registrations, isReady } = useStudentDb();
 * ```
 */

export function useStudentDb() {
    const [stamp, setStamp] = useState(Date.now());
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (event.data && (
                event.data.type === 'IMPORT_FULL_DATA' ||
                event.data.type === 'CACHE_POPULATED'
            )) {
                setStamp(Date.now());
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, []);

    // Đọc và phân rã dữ liệu có memoization
    const db = useMemo(() => {
        setIsReady(false);
        const studentDb = readFromStorage<any>(STORAGE_KEYS.STUDENT_DB, null);

        // Trả về dữ liệu mặc định rỗng nếu chưa có
        if (!studentDb) {
            setIsReady(true);
            return {
                name: "Chưa cập nhật",
                grades: [],
                exams: { midterm: [], final: [] },
                tuition: { details: [], year: "", sem: "", total: "0" },
                registrations: [],
                program: []
            };
        }

        setIsReady(true);
        // Phân rã dữ liệu từ object lớn
        return {
            name: studentDb.name || "Chưa cập nhật",
            grades: studentDb.grades || [],
            exams: studentDb.exams || {},
            tuition: studentDb.tuition || { details: [], year: "", sem: "", total: "0" },
            registrations: studentDb.registrations || [],
            program: studentDb.program || []
        };
    }, [stamp]);

    return {
        ...db,
        isReady,
        rawObject: readFromStorage<any>(STORAGE_KEYS.STUDENT_DB, null)
    };
}
