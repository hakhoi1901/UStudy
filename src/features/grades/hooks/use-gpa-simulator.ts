import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { readFromStorage, readPlain, savePlain } from '../../../helpers/localStorage/save';
import { STORAGE_KEYS } from '../../../config';
import { GPACalculator } from '../services/gpa-calculator';
import {
    buildProjectionSemesters,
    createGradeAttemptKey,
    normalizeProjectionSemester,
} from '../services/semester-grade-projection';
import type { StudentCourseGrade } from '../types';

interface StoredProjectedGradesV2 {
    version: 2;
    grades: Record<string, number>;
}

function isValidGrade(value: unknown): value is number {
    return Number.isFinite(value) && Number(value) >= 0 && Number(value) <= 10;
}

function readProjectedGrades(): {
    grades: Record<string, number>;
    legacyGrades: Record<string, number>;
} {
    const saved = readPlain<unknown>(STORAGE_KEYS.PROJECTED_GRADES, {});
    if (saved && typeof saved === 'object' && (saved as StoredProjectedGradesV2).version === 2) {
        const grades = (saved as StoredProjectedGradesV2).grades ?? {};
        return {
            grades: Object.fromEntries(Object.entries(grades).filter((entry): entry is [string, number] => isValidGrade(entry[1]))),
            legacyGrades: {},
        };
    }

    const legacy = saved && typeof saved === 'object'
        ? Object.fromEntries(Object.entries(saved).filter((entry): entry is [string, number] => isValidGrade(entry[1])))
        : {};
    return { grades: {}, legacyGrades: legacy };
}

function getRegistrationSemesterFallback(importMeta: any): string | undefined {
    const registration = importMeta?.params?.registration;
    if (!registration) return undefined;
    if (registration.semester) return normalizeProjectionSemester(registration.semester);
    if (registration.year && registration.sem) {
        return normalizeProjectionSemester(`${registration.year}/${registration.sem}`);
    }
    return undefined;
}

/**
 * Quản lý dự đoán GPA theo từng lần học (học kỳ + mã môn).
 * Một kỳ có thể chứa đồng thời điểm chính thức, điểm dự kiến và môn chưa có điểm.
 */
export function useGPASimulator(
    gradesHistory: StudentCourseGrade[],
    allCoursesMeta: any[],
) {
    const initialProjectedGrades = useMemo(readProjectedGrades, []);
    const legacyGradesRef = useRef(initialProjectedGrades.legacyGrades);
    const [projectedGrades, setProjectedGrades] = useState<Record<string, number>>(initialProjectedGrades.grades);
    const [selectedSemesterId, setSelectedSemesterId] = useState(
        () => readPlain<string>(STORAGE_KEYS.GPA_ACTIVE_PROJECTION_SEMESTER, ''),
    );
    const [stamp, setStamp] = useState(0);

    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (event.data && (
                event.data.type === 'IMPORT_FULL_DATA'
                || event.data.type === 'CACHE_POPULATED'
            )) {
                setStamp(Date.now());
            }
        };
        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, []);

    const projectionSemesters = useMemo(() => {
        const studentDb = readFromStorage<any>(STORAGE_KEYS.STUDENT_DB, null);
        const importMeta = readFromStorage<any>(STORAGE_KEYS.IMPORT_META, null);
        void stamp;
        return buildProjectionSemesters({
            rawGrades: Array.isArray(studentDb?.grades) ? studentDb.grades : [],
            registrations: Array.isArray(studentDb?.registrations) ? studentDb.registrations : [],
            gradesHistory,
            allCoursesMeta,
            projectedGrades,
            legacyProjectedGrades: legacyGradesRef.current,
            fallbackRegistrationSemester: getRegistrationSemesterFallback(importMeta),
        });
    }, [allCoursesMeta, gradesHistory, projectedGrades, stamp]);

    useEffect(() => {
        if (Object.keys(legacyGradesRef.current).length === 0) return;
        const migrated: Record<string, number> = {};
        projectionSemesters.forEach((semester) => {
            semester.courses.forEach((course) => {
                const legacyGrade = legacyGradesRef.current[course.code];
                if (course.currentGrade === null && course.projectedGrade === legacyGrade && isValidGrade(legacyGrade)) {
                    migrated[course.attemptKey] = legacyGrade;
                }
            });
        });
        legacyGradesRef.current = {};
        if (Object.keys(migrated).length > 0) {
            setProjectedGrades((current) => ({ ...migrated, ...current }));
        }
    }, [projectionSemesters]);

    useEffect(() => {
        savePlain(STORAGE_KEYS.PROJECTED_GRADES, {
            version: 2,
            grades: projectedGrades,
        } satisfies StoredProjectedGradesV2);
    }, [projectedGrades]);

    useEffect(() => {
        if (projectionSemesters.length === 0) {
            if (selectedSemesterId) setSelectedSemesterId('');
            return;
        }
        if (!projectionSemesters.some((semester) => semester.id === selectedSemesterId)) {
            setSelectedSemesterId(projectionSemesters[0].id);
        }
    }, [projectionSemesters, selectedSemesterId]);

    useEffect(() => {
        savePlain(STORAGE_KEYS.GPA_ACTIVE_PROJECTION_SEMESTER, selectedSemesterId);
    }, [selectedSemesterId]);

    const selectedSemester = useMemo(
        () => projectionSemesters.find((semester) => semester.id === selectedSemesterId)
            ?? projectionSemesters[0]
            ?? null,
        [projectionSemesters, selectedSemesterId],
    );

    const handleGradeChange = useCallback((attemptKey: string, grade: number | null) => {
        setProjectedGrades((current) => {
            const updated = { ...current };
            if (grade === null) {
                delete updated[attemptKey];
            } else {
                updated[attemptKey] = grade;
            }
            return updated;
        });
    }, []);

    const projectedPendingCourses = useMemo(() => {
        const newestByCode = new Map<string, {
            code: string;
            credits: number;
            projectedGrade: number;
        }>();
        projectionSemesters.forEach((semester) => {
            semester.courses.forEach((course) => {
                if (
                    course.currentGrade !== null
                    || course.projectedGrade === null
                    || course.credits === null
                    || newestByCode.has(course.code)
                ) return;
                newestByCode.set(course.code, {
                    code: course.code,
                    credits: course.credits,
                    projectedGrade: course.projectedGrade,
                });
            });
        });
        return Array.from(newestByCode.values());
    }, [projectionSemesters]);

    const cumulativeGPA = useMemo(
        () => GPACalculator.calculateProjectedGPA(gradesHistory, projectedPendingCourses),
        [gradesHistory, projectedPendingCourses],
    );

    const simulatorCourses = selectedSemester?.courses ?? [];
    const semesterGPA = selectedSemester?.semesterGPA ?? 0;
    const totalSimCredits = selectedSemester?.totalCredits ?? 0;

    return {
        projectionSemesters,
        selectedProjectionSemester: selectedSemester,
        selectedProjectionSemesterId: selectedSemester?.id ?? '',
        setSelectedProjectionSemesterId: setSelectedSemesterId,
        simulatorCourses,
        handleGradeChange,
        semesterGPA,
        cumulativeGPA,
        totalSimCredits,
        createGradeAttemptKey,
    };
}
